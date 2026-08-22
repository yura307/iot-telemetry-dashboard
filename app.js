Chart.defaults.color = '#8b949e'; Chart.defaults.borderColor = '#2d3243';
const ctxVibro = document.getElementById('mainVibroChart').getContext('2d');
const ctxSound = document.getElementById('soundRadarChart').getContext('2d');
let gradientVibro = ctxVibro.createLinearGradient(0, 0, 0, 400);
gradientVibro.addColorStop(0, 'rgba(13, 110, 253, 0.5)'); gradientVibro.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

const mainVibroChart = new Chart(ctxVibro, {
    type: 'line', data: { labels: Array(30).fill(''), datasets: [{ label: 'Амплітуда (мм/с)', data: Array(30).fill(0), borderColor: '#0d6efd', backgroundColor: gradientVibro, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHitRadius: 10 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 0 }, plugins: { legend: { display: false } }, scales: { x: { display: true, grid: { display: false } }, y: { min: 0, max: 100, grid: { borderDash: [2, 4] } } } }
});
const soundRadarChart = new Chart(ctxSound, {
    type: 'bar', data: { labels: ['125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz'], datasets: [{ label: 'Спектр', data: [45, 50, 65, 85, 60, 40, 35], backgroundColor: 'rgba(255, 193, 7, 0.7)', borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }
});

const logConsole = document.getElementById('logConsole');
const kpiVibro = document.getElementById('kpi-vibro'); const kpiSound = document.getElementById('kpi-sound'); const kpiTemp = document.getElementById('kpi-temp'); const kpiRssi = document.getElementById('kpi-rssi');
const alertCard = document.getElementById('kpi-vibro-card'); const alertIcon = document.getElementById('alert-icon');
let isAlert = false; let activeUser = null;

function addLog(msg, type = "INFO") {
    const time = new Date().toISOString().substring(11, 23);
    const color = type === "WARN" || type === "CRIT" ? "#ff1744" : "#00e676";
    const div = document.createElement('div');
    div.innerHTML = `<span style="color:#58a6ff">[${time}]</span> <span style="color:${color}">[${type}]</span> ${msg}`;
    logConsole.appendChild(div); logConsole.scrollTop = logConsole.scrollHeight;
    if(logConsole.childElementCount > 50) logConsole.removeChild(logConsole.firstChild);
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId); const icon = document.getElementById(iconId);
    if (input.type === "password") { input.type = "text"; icon.classList.replace("bi-eye-slash", "bi-eye"); icon.style.color = "#00e676"; } 
    else { input.type = "password"; icon.classList.replace("bi-eye", "bi-eye-slash"); icon.style.color = "#8b949e"; }
}
document.getElementById('toggle-login-pwd').addEventListener('click', () => togglePasswordVisibility('password', 'toggle-login-pwd'));
document.getElementById('toggle-reg-pwd').addEventListener('click', () => togglePasswordVisibility('reg-password', 'toggle-reg-pwd'));
document.getElementById('toggle-reg-pwd-confirm').addEventListener('click', () => togglePasswordVisibility('reg-password-confirm', 'toggle-reg-pwd-confirm'));

const loginOverlay = document.getElementById('login-overlay');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const regUsernameInput = document.getElementById('reg-username');
const regPasswordInput = document.getElementById('reg-password');
const pwdStrengthContainer = document.getElementById('pwd-strength-container');
const pwdStrengthBar = document.getElementById('pwd-strength-bar');
const pwdStrengthText = document.getElementById('pwd-strength-text');
const registerBtn = document.getElementById('register-btn');

document.getElementById('show-register').addEventListener('click', (e) => { e.preventDefault(); loginSection.classList.add('d-none'); registerSection.classList.remove('d-none'); });
document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); registerSection.classList.add('d-none'); loginSection.classList.remove('d-none'); });

// Валідація пароля
regPasswordInput.addEventListener('input', function() {
    const val = this.value;
    if (val.length > 0) { pwdStrengthContainer.classList.remove('d-none'); } else { pwdStrengthContainer.classList.add('d-none'); registerBtn.disabled = true; return; }
    if (/[А-Яа-яІіЇїЄєҐґ]/.test(val)) {
        pwdStrengthBar.style.width = '100%'; pwdStrengthBar.className = 'progress-bar bg-danger';
        pwdStrengthText.innerText = 'Помилка: Лише англійські літери!'; pwdStrengthText.className = 'fw-bold text-danger';
        registerBtn.disabled = true; return;
    }
    let missing = [];
    if (val.length < 8) missing.push('8 символів'); if (!/[A-Z]/.test(val)) missing.push('велику літеру'); if (!/[0-9]/.test(val)) missing.push('цифру'); if (!/[^A-Za-z0-9]/.test(val)) missing.push('спецсимвол');
    if (missing.length > 0) {
        pwdStrengthBar.style.width = '50%'; pwdStrengthBar.className = 'progress-bar bg-warning';
        pwdStrengthText.innerText = 'Бракує: ' + missing.join(', '); pwdStrengthText.className = 'fw-bold text-warning';
        registerBtn.disabled = true;
    } else {
        pwdStrengthBar.style.width = '100%'; pwdStrengthBar.className = 'progress-bar bg-success';
        pwdStrengthText.innerText = 'Надійний'; pwdStrengthText.className = 'fw-bold text-success';
        registerBtn.disabled = false;
    }
});

// Реєстрація через хмарний сервер
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = regUsernameInput.value.trim();
    const pass = regPasswordInput.value;
    const passConfirm = document.getElementById('reg-password-confirm').value;
    const regError = document.getElementById('reg-error');

    if (pass !== passConfirm) { regError.innerHTML = 'Паролі не співпадають!'; regError.classList.remove('d-none'); return; }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.detail || 'Помилка реєстрації');

        registerForm.reset(); pwdStrengthContainer.classList.add('d-none');
        registerSection.classList.add('d-none'); loginSection.classList.remove('d-none');
        document.getElementById('login-success-msg').classList.remove('d-none');
    } catch (err) {
        regError.innerHTML = err.message; regError.classList.remove('d-none');
    }
});

// Вхід через хмарний сервер
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputUser = document.getElementById('username').value.trim();
    const inputPass = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: inputUser, password: inputPass })
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.detail || 'Невірний логін або пароль');

        activeUser = result.username;
        document.getElementById('nav-username').innerText = result.name;
        document.getElementById('nav-role').innerText = result.role;
        document.getElementById('user-profile-menu').classList.remove('d-none');
        document.getElementById('user-profile-menu').classList.add('d-flex');

        loginOverlay.classList.add('hidden');
        setTimeout(() => loginOverlay.style.display = 'none', 600);
        addLog(`[AUTH] Оператор '${activeUser}' успішно авторизований через хмару.`, 'INFO');

        startWebSocket();
    } catch (err) {
        document.getElementById('login-error').classList.remove('d-none');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => location.reload());

// Підключення до справжнього WebSocket сервера для отримання даних датчиків
function startWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        kpiVibro.innerText = data.vibro;
        kpiSound.innerText = data.sound;
        kpiTemp.innerText = data.temp;
        kpiRssi.innerText = data.rssi;

        if (data.vibro > 75) {
            if (!isAlert) { alertCard.classList.add('alert-flash'); alertIcon.classList.remove('d-none'); addLog(`КРИТИЧНА ВІБРАЦІЯ: ${data.vibro} мм/с`, "CRIT"); isAlert = true; }
        } else {
            if (isAlert) { alertCard.classList.remove('alert-flash'); alertIcon.classList.add('d-none'); addLog(`Вібрація стабілізувалась`, "INFO"); isAlert = false; }
        }

        mainVibroChart.data.labels.shift(); mainVibroChart.data.labels.push(new Date().getSeconds());
        mainVibroChart.data.datasets[0].data.shift(); mainVibroChart.data.datasets[0].data.push(data.vibro);
        mainVibroChart.update();

        soundRadarChart.data.datasets[0].data = soundRadarChart.data.datasets[0].data.map(val => Math.max(20, Math.min(100, val + (Math.random() * 10 - 5))));
        soundRadarChart.update();
    };

    ws.onclose = function() {
        addLog(`[WARNING] Втрачено зв'язок із сервером. Перепідключення...`, "WARN");
        setTimeout(startWebSocket, 3000);
    };
}
