// Ініціалізація графіків
Chart.defaults.color = '#8b949e';
Chart.defaults.borderColor = '#2d3243';

const ctxVibro = document.getElementById('mainVibroChart').getContext('2d');
const ctxSound = document.getElementById('soundRadarChart').getContext('2d');

let gradientVibro = ctxVibro.createLinearGradient(0, 0, 0, 400);
gradientVibro.addColorStop(0, 'rgba(13, 110, 253, 0.5)');
gradientVibro.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

const mainVibroChart = new Chart(ctxVibro, {
    type: 'line',
    data: { 
        labels: Array(30).fill(''), 
        datasets: [{ 
            label: 'Амплітуда (мм/с)', data: Array(30).fill(0), 
            borderColor: '#0d6efd', backgroundColor: gradientVibro,
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0, pointHitRadius: 10
        }] 
    },
    options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
        plugins: { legend: { display: false } },
        scales: { x: { display: true, grid: { display: false } }, y: { min: 0, max: 100, grid: { borderDash: [2, 4] } } }
    }
});

const soundRadarChart = new Chart(ctxSound, {
    type: 'bar',
    data: {
        labels: ['125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz'],
        datasets: [{
            label: 'Спектр', data: [45, 50, 65, 85, 60, 40, 35],
            backgroundColor: 'rgba(255, 193, 7, 0.7)', borderRadius: 4
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100 } }
    }
});

const logConsole = document.getElementById('logConsole');
const kpiVibro = document.getElementById('kpi-vibro');
const kpiSound = document.getElementById('kpi-sound');
const kpiTemp = document.getElementById('kpi-temp');
const kpiRssi = document.getElementById('kpi-rssi');
const alertCard = document.getElementById('kpi-vibro-card');
const alertIcon = document.getElementById('alert-icon');

let t = 0;
let isAlert = false;

function addLog(msg, type = "INFO") {
    const time = new Date().toISOString().substring(11, 23);
    const color = type === "WARN" || type === "CRIT" ? "#ff1744" : "#00e676";
    const div = document.createElement('div');
    div.innerHTML = `<span style="color:#58a6ff">[${time}]</span> <span style="color:${color}">[${type}]</span> ${msg}`;
    logConsole.appendChild(div);
    logConsole.scrollTop = logConsole.scrollHeight;
    if(logConsole.childElementCount > 50) logConsole.removeChild(logConsole.firstChild);
}

// --- ЛОГІКА АВТОРИЗАЦІЇ, РЕЄСТРАЦІЇ ТА НАДІЙНОСТІ ПАРОЛЯ ---
const loginOverlay = document.getElementById('login-overlay');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const regPasswordInput = document.getElementById('reg-password');
const pwdStrengthContainer = document.getElementById('pwd-strength-container');
const pwdStrengthBar = document.getElementById('pwd-strength-bar');
const pwdStrengthText = document.getElementById('pwd-strength-text');
const registerBtn = document.getElementById('register-btn');

// Логіка перемикання вікон
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.classList.add('d-none');
    registerSection.classList.remove('d-none');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
});

// АНАЛІЗ НАДІЙНОСТІ ПАРОЛЯ В РЕАЛЬНОМУ ЧАСІ (Строгі правила)
regPasswordInput.addEventListener('input', function() {
    const val = this.value;
    
    if (val.length > 0) {
        pwdStrengthContainer.classList.remove('d-none');
    } else {
        pwdStrengthContainer.classList.add('d-none');
        registerBtn.disabled = true;
        return;
    }

    // Регулярні вирази для перевірки умов
    const hasUpper = /[A-Z]/.test(val);          // Хоча б одна велика літера
    const hasNumber = /[0-9]/.test(val);         // Хоча б одна цифра
    const hasSpecial = /[^A-Za-z0-9]/.test(val); // Хоча б один спецсимвол
    const isLongEnough = val.length >= 8;        // Мінімум 8 символів

    // Збираємо масив того, чого бракує
    let missing = [];
    if (!isLongEnough) missing.push('8 символів');
    if (!hasUpper) missing.push('велику літеру');
    if (!hasNumber) missing.push('цифру');
    if (!hasSpecial) missing.push('спецсимвол (!@#)');

    // Візуалізація результату
    if (missing.length >= 3) {
        // Найслабший рівень
        pwdStrengthBar.style.width = '33%';
        pwdStrengthBar.className = 'progress-bar bg-danger';
        pwdStrengthText.innerText = 'Слабкий: додайте ' + missing[0];
        pwdStrengthText.className = 'fw-bold text-danger';
        registerBtn.disabled = true; // Забороняємо реєстрацію
    } else if (missing.length > 0) {
        // Середній рівень (щось одне чи два ще не виконано)
        pwdStrengthBar.style.width = '66%';
        pwdStrengthBar.className = 'progress-bar bg-warning';
        pwdStrengthText.innerText = 'Бракує: ' + missing.join(', ');
        pwdStrengthText.className = 'fw-bold text-warning';
        registerBtn.disabled = true; // Забороняємо реєстрацію, бо правила строгі
    } else {
        // Всі умови виконано
        pwdStrengthBar.style.width = '100%';
        pwdStrengthBar.className = 'progress-bar bg-success';
        pwdStrengthText.innerText = 'Надійний (Всі вимоги виконано)';
        pwdStrengthText.className = 'fw-bold text-success';
        registerBtn.disabled = false; // ТІЛЬКИ ТЕПЕР дозволяємо реєстрацію
    }
});

// Обробка форми Реєстрації
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value;
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;
    const regError = document.getElementById('reg-error');

    if (pass !== passConfirm) {
        regError.classList.remove('d-none');
        return;
    }
    
    regError.classList.add('d-none');
    document.getElementById('register-text').classList.add('d-none');
    document.getElementById('register-spinner').classList.remove('d-none');
    registerBtn.classList.add('disabled');

    setTimeout(() => {
        localStorage.setItem('scada_user', user);
        localStorage.setItem('scada_pass', pass);
        
        registerForm.reset();
        pwdStrengthContainer.classList.add('d-none');
        document.getElementById('register-text').classList.remove('d-none');
        document.getElementById('register-spinner').classList.add('d-none');
        registerBtn.classList.remove('disabled');

        registerSection.classList.add('d-none');
        loginSection.classList.remove('d-none');
        
        document.getElementById('login-success-msg').classList.remove('d-none');
        document.getElementById('login-error').classList.add('d-none');
    }, 1000);
});

// Обробка форми Входу
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const inputUser = document.getElementById('username').value;
    const inputPass = document.getElementById('password').value;

    const validUser = localStorage.getItem('scada_user') || 'admin';
    const validPass = localStorage.getItem('scada_pass') || 'admin';

    document.getElementById('login-error').classList.add('d-none');
    document.getElementById('login-success-msg').classList.add('d-none');
    document.getElementById('login-text').classList.add('d-none');
    document.getElementById('login-spinner').classList.remove('d-none');
    document.getElementById('login-btn').classList.add('disabled');

    setTimeout(() => {
        if ((inputUser === validUser && inputPass === validPass) || (inputUser === 'admin' && inputPass === 'admin')) {
            loginOverlay.classList.add('hidden');
            setTimeout(() => loginOverlay.remove(), 600); 
            
            addLog(`[AUTH] Оператор '${inputUser}' успішно авторизований.`, 'INFO');
            addLog(`[STREAM] Відкриття захищеного WebSocket з'єднання...`, 'INFO');
            
            startSimulation(); 
        } else {
            document.getElementById('login-error').classList.remove('d-none');
            document.getElementById('login-text').classList.remove('d-none');
            document.getElementById('login-spinner').classList.add('d-none');
            document.getElementById('login-btn').classList.remove('disabled');
        }
    }, 1500); 
});

// --- ЗАПУСК ДАНИХ (Викликається тільки після логіна) ---
function startSimulation() {
    setInterval(() => {
        let vibro = Math.abs(Math.sin(t) * 30 + Math.cos(t * 3.5) * 15) + (Math.random() * 5); 
        if (Math.random() > 0.95) vibro += 40 + Math.random() * 20;

        const sound = 65 + (Math.random() * 15);
        
        kpiVibro.innerText = vibro.toFixed(1);
        kpiSound.innerText = sound.toFixed(1);
        
        if (Math.random() > 0.7) kpiTemp.innerText = (42.0 + Math.random()).toFixed(1);
        if (Math.random() > 0.9) kpiRssi.innerText = Math.floor(-75 + Math.random() * 15);

        if (vibro > 75) {
            if (!isAlert) {
                alertCard.classList.add('alert-flash');
                alertIcon.classList.remove('d-none');
                addLog(`КРИТИЧНА ВІБРАЦІЯ: ${vibro.toFixed(2)} мм/с (Поріг 75.0)`, "CRIT");
                isAlert = true;
            }
        } else {
            if (isAlert) {
                alertCard.classList.remove('alert-flash');
                alertIcon.classList.add('d-none');
                addLog(`Вібрація стабілізувалась: ${vibro.toFixed(2)} мм/с`, "INFO");
                isAlert = false;
            }
        }

        const timeStr = new Date().getSeconds();
        mainVibroChart.data.labels.shift();
        mainVibroChart.data.labels.push(timeStr);
        mainVibroChart.data.datasets[0].data.shift();
        mainVibroChart.data.datasets[0].data.push(vibro);
        mainVibroChart.update();

        soundRadarChart.data.datasets[0].data = soundRadarChart.data.datasets[0].data.map(val => {
            let newVal = val + (Math.random() * 10 - 5);
            return Math.max(20, Math.min(100, newVal));
        });
        soundRadarChart.update();

        if (Math.random() > 0.85 && !isAlert) addLog(`Отримано пакет IoT_DATA_PAYLOAD від Node_1`);
        t += 0.2;
    }, 300);
}
