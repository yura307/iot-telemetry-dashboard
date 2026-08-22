const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
let currentTheme = localStorage.getItem('scada_theme') || 'dark';

function updateChartColors(theme) {
    const textColor = theme === 'dark' ? '#8b949e' : '#6c757d';
    const gridColor = theme === 'dark' ? 'rgba(45, 50, 67, 0.5)' : 'rgba(0,0,0,0.1)';
    Chart.defaults.color = textColor; Chart.defaults.borderColor = gridColor;
    if (typeof mainVibroChart !== 'undefined') { mainVibroChart.options.scales.x.ticks.color = textColor; mainVibroChart.options.scales.y.ticks.color = textColor; mainVibroChart.options.scales.y.grid.color = gridColor; mainVibroChart.update(); }
    if (typeof soundRadarChart !== 'undefined') { soundRadarChart.options.scales.y.ticks.color = textColor; soundRadarChart.options.scales.y.grid.color = gridColor; soundRadarChart.update(); }
    if (typeof historyChart !== 'undefined') { historyChart.options.plugins.legend.labels.color = textColor; historyChart.options.scales.x.ticks.color = textColor; historyChart.options.scales.x.grid.color = gridColor; historyChart.options.scales.y.ticks.color = textColor; historyChart.options.scales.y.grid.color = gridColor; historyChart.update(); }
}

function applyTheme(theme) {
    htmlElement.setAttribute('data-bs-theme', theme); localStorage.setItem('scada_theme', theme);
    themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
    updateChartColors(theme);
}
themeToggleBtn.addEventListener('click', () => { currentTheme = currentTheme === 'dark' ? 'light' : 'dark'; applyTheme(currentTheme); });

// --- ГРАФІКИ ---
const ctxVibro = document.getElementById('mainVibroChart').getContext('2d');
const ctxSound = document.getElementById('soundRadarChart').getContext('2d');
let gradientVibro = ctxVibro.createLinearGradient(0, 0, 0, 400); gradientVibro.addColorStop(0, 'rgba(13, 110, 253, 0.5)'); gradientVibro.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

const mainVibroChart = new Chart(ctxVibro, { type: 'line', data: { labels: Array(30).fill(''), datasets: [{ label: 'Амплітуда', data: Array(30).fill(0), borderColor: '#0d6efd', backgroundColor: gradientVibro, borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 0 }, plugins: { legend: { display: false } }, scales: { x: { display: true, grid: { display: false } }, y: { min: 0, max: 100 } } } });
const soundRadarChart = new Chart(ctxSound, { type: 'bar', data: { labels: ['125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz'], datasets: [{ label: 'Спектр', data: [45, 50, 65, 85, 60, 40, 35], backgroundColor: 'rgba(255, 193, 7, 0.7)', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } } });

const historyLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
const mockHistoryData = { vibro: [30, 32, 28, 35, 31, 29, 33, 40, 45, 82, 75, 40, 35, 30, 28, 32, 34, 30, 29, 31, 33, 30, 28, 30], sound: [60, 62, 61, 65, 63, 60, 64, 68, 70, 88, 80, 68, 65, 62, 60, 63, 64, 61, 60, 62, 64, 61, 60, 61], temp: [40, 40.5, 41, 41.5, 41, 40.8, 41.2, 42, 43, 48.5, 46, 43, 42, 41, 40.5, 41, 41.5, 41, 40.5, 41, 41.2, 40.8, 40.5, 40], rssi: [-65, -66, -64, -68, -70, -65, -64, -62, -65, -78, -82, -70, -68, -65, -64, -66, -65, -64, -65, -67, -66, -65, -64, -65] };

const ctxHistory = document.getElementById('historyChart').getContext('2d');
let historyChart = new Chart(ctxHistory, { type: 'line', data: { labels: historyLabels, datasets: [{ label: 'Вібрація (мм/с)', data: mockHistoryData.vibro, borderColor: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)', borderWidth: 2, fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } } });

window.switchHistory = function(type, btnElement) {
    btnElement.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); btnElement.classList.add('active');
    historyChart.data.datasets[0].data = mockHistoryData[type];
    const colors = { vibro: '#0d6efd', sound: '#ffc107', temp: '#dc3545', rssi: '#0dcaf0' };
    const labels = { vibro: 'Вібрація (мм/с)', sound: 'Шум (dB)', temp: 'Температура (°C)', rssi: 'Мережа RSSI' };
    historyChart.data.datasets[0].borderColor = colors[type]; historyChart.data.datasets[0].backgroundColor = colors[type] + '1A'; historyChart.data.datasets[0].label = labels[type];
    historyChart.update();
};
applyTheme(currentTheme);

// --- ЛОГІКА АВТОРИЗАЦІЇ ---
const logConsole = document.getElementById('logConsole'); let isAlert = false; let activeUser = null;
function addLog(msg, type = "INFO") {
    const div = document.createElement('div');
    div.innerHTML = `<span style="color:#58a6ff">[${new Date().toISOString().substring(11, 23)}]</span> <span style="color:${type==="CRIT"?"#ff1744":"#00e676"}">[${type}]</span> ${msg}`;
    logConsole.appendChild(div); logConsole.scrollTop = logConsole.scrollHeight;
}

function togglePasswordVisibility(inId, icId) {
    const input = document.getElementById(inId); const icon = document.getElementById(icId);
    if (input.type === "password") { input.type = "text"; icon.classList.replace("bi-eye-slash", "bi-eye"); } 
    else { input.type = "password"; icon.classList.replace("bi-eye", "bi-eye-slash"); }
}
document.getElementById('toggle-login-pwd').addEventListener('click', () => togglePasswordVisibility('password', 'toggle-login-pwd'));
document.getElementById('toggle-reg-pwd').addEventListener('click', () => togglePasswordVisibility('reg-password', 'toggle-reg-pwd'));
document.getElementById('toggle-reg-pwd-confirm').addEventListener('click', () => togglePasswordVisibility('reg-password-confirm', 'toggle-reg-pwd-confirm'));

document.getElementById('show-register').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('login-section').classList.add('d-none'); document.getElementById('register-section').classList.remove('d-none'); });
document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('register-section').classList.add('d-none'); document.getElementById('login-section').classList.remove('d-none'); });

// ПОВЕРНУТО: Перевірка складності пароля та розблокування кнопки
const regPasswordInput = document.getElementById('reg-password');
const registerBtn = document.getElementById('register-btn');
const pwdStrengthContainer = document.getElementById('pwd-strength-container');
const pwdStrengthBar = document.getElementById('pwd-strength-bar');
const pwdStrengthText = document.getElementById('pwd-strength-text');

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
        registerBtn.disabled = false; // ОСЬ ЦЕ РОЗБЛОКОВУЄ КНОПКУ
    }
});

document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value.trim(); const pass = document.getElementById('reg-password').value;
    if (pass !== document.getElementById('reg-password-confirm').value) { document.getElementById('reg-error').classList.remove('d-none'); return; }
    try {
        const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) });
        if (!response.ok) throw new Error((await response.json()).detail);
        this.reset(); document.getElementById('register-section').classList.add('d-none'); document.getElementById('login-section').classList.remove('d-none'); document.getElementById('login-success-msg').classList.remove('d-none');
    } catch (err) { document.getElementById('reg-error').innerHTML = err.message; document.getElementById('reg-error').classList.remove('d-none'); }
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const inputUser = document.getElementById('username').value.trim();
    const inputPass = document.getElementById('password').value;
    const inputTfa = document.getElementById('login-tfa-code').value; 

    try {
        const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: inputUser, password: inputPass, tfa_code: inputTfa || null }) });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.detail || 'Помилка входу');

        if (result.status === "tfa_required") {
            document.getElementById('login-tfa-block').classList.remove('d-none');
            document.getElementById('login-error').classList.add('d-none');
            document.getElementById('login-btn').className = 'btn w-100 py-2 fw-bold mb-3 btn-warning';
            document.getElementById('login-text').innerText = 'ПІДТВЕРДИТИ 2FA';
            return; 
        }

        activeUser = result.username;
        document.getElementById('nav-username').innerText = result.name;
        document.getElementById('nav-role').innerText = result.role;
        document.getElementById('profile-name').value = result.name === activeUser ? '' : result.name;
        document.getElementById('profile-role').value = result.role;
        
        document.getElementById('tfa-switch').checked = result.tfa;
        if(result.tfa) document.getElementById('tfa-setup-block').classList.add('d-none');

        document.getElementById('user-profile-menu').classList.remove('d-none'); document.getElementById('user-profile-menu').classList.add('d-flex');
        document.getElementById('login-overlay').classList.add('hidden'); setTimeout(() => document.getElementById('login-overlay').style.display = 'none', 600);
        startWebSocket();
    } catch (err) {
        document.getElementById('login-error-text').innerText = err.message;
        document.getElementById('login-error').classList.remove('d-none');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => location.reload());

// --- ЛОГІКА НАЛАШТУВАННЯ 2FA В ПРОФІЛІ ---
const tfaSwitch = document.getElementById('tfa-switch');
const tfaSetupBlock = document.getElementById('tfa-setup-block');
const tfaQrImage = document.getElementById('tfa-qr-image');
const tfaSuccessMsg = document.getElementById('tfa-success-msg');
const tfaErrorMsg = document.getElementById('tfa-error-msg');

tfaSwitch.addEventListener('change', async (e) => {
    tfaSuccessMsg.classList.add('d-none'); tfaErrorMsg.classList.add('d-none');
    
    if(e.target.checked) {
        const res = await fetch(`/api/2fa/setup?username=${activeUser}`);
        const data = await res.json();
        tfaQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.uri)}`;
        tfaSetupBlock.classList.remove('d-none');
    } else {
        await fetch('/api/2fa/disable', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: activeUser}) });
        tfaSetupBlock.classList.add('d-none');
    }
});

document.getElementById('tfa-verify-btn').addEventListener('click', async () => {
    const code = document.getElementById('tfa-code-input').value;
    try {
        const res = await fetch('/api/2fa/verify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: activeUser, code: code}) });
        if(res.ok) {
            tfaSuccessMsg.classList.remove('d-none'); tfaErrorMsg.classList.add('d-none');
            setTimeout(() => tfaSetupBlock.classList.add('d-none'), 2000); 
        } else {
            tfaErrorMsg.classList.remove('d-none'); tfaSuccessMsg.classList.add('d-none');
        }
    } catch(e) { console.error(e); }
});

// --- ЗБЕРЕЖЕННЯ ПРОФІЛЮ ---
document.getElementById('profile-details-form').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const newName = document.getElementById('profile-name').value; const newRole = document.getElementById('profile-role').value;
    if(!activeUser) return;
    try {
        const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: activeUser, name: newName, role: newRole }) });
        if(res.ok) {
            document.getElementById('nav-username').innerText = newName || activeUser; document.getElementById('nav-role').innerText = newRole;
            document.getElementById('profile-save-msg').classList.remove('d-none'); setTimeout(() => document.getElementById('profile-save-msg').classList.add('d-none'), 3000);
        }
    } catch (err) { console.error(err); }
});

// --- WEBSOCKET ---
function startWebSocket() {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        document.getElementById('kpi-vibro').innerText = data.vibro; document.getElementById('kpi-sound').innerText = data.sound; document.getElementById('kpi-temp').innerText = data.temp; document.getElementById('kpi-rssi').innerText = data.rssi;
        if (data.vibro > 75) { if (!isAlert) { document.getElementById('kpi-vibro-card').classList.add('alert-flash'); addLog(`КРИТИЧНА ВІБРАЦІЯ: ${data.vibro}`, "CRIT"); isAlert = true; } } 
        else { if (isAlert) { document.getElementById('kpi-vibro-card').classList.remove('alert-flash'); isAlert = false; } }
        mainVibroChart.data.labels.shift(); mainVibroChart.data.labels.push(new Date().getSeconds()); mainVibroChart.data.datasets[0].data.shift(); mainVibroChart.data.datasets[0].data.push(data.vibro); mainVibroChart.update();
        soundRadarChart.data.datasets[0].data = soundRadarChart.data.datasets[0].data.map(val => Math.max(20, Math.min(100, val + (Math.random() * 10 - 5)))); soundRadarChart.update();
    };
    ws.onclose = () => setTimeout(startWebSocket, 3000);
}
