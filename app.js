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
            label: 'Амплітуда (мм/с)',
            data: Array(30).fill(0), 
            borderColor: '#0d6efd', 
            backgroundColor: gradientVibro,
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

// --- ЛОГІКА АВТОРИЗАЦІЇ ТА РЕЄСТРАЦІЇ ---
const loginOverlay = document.getElementById('login-overlay');

// Секції
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');

// Форми
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Повідомлення
const loginError = document.getElementById('login-error');
const loginSuccessMsg = document.getElementById('login-success-msg');
const regError = document.getElementById('reg-error');

// Кнопки
const loginBtn = document.getElementById('login-btn');
const loginText = document.getElementById('login-text');
const loginSpinner = document.getElementById('login-spinner');

const registerBtn = document.getElementById('register-btn');
const registerText = document.getElementById('register-text');
const registerSpinner = document.getElementById('register-spinner');

// Перемикання між вікнами Входу і Реєстрації
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

// Обробка форми Реєстрації
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('reg-username').value;
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;

    // Перевірка на співпадіння паролів
    if (pass !== passConfirm) {
        regError.classList.remove('d-none');
        return;
    }
    
    regError.classList.add('d-none');
    registerText.classList.add('d-none');
    registerSpinner.classList.remove('d-none');
    registerBtn.classList.add('disabled');

    // Імітуємо відправку на сервер (затримка 1 секунда)
    setTimeout(() => {
        // Зберігаємо нового користувача в пам'ять браузера (localStorage)
        localStorage.setItem('scada_user', user);
        localStorage.setItem('scada_pass', pass);
        
        // Скидаємо форму реєстрації
        registerForm.reset();
        registerText.classList.remove('d-none');
        registerSpinner.classList.add('d-none');
        registerBtn.classList.remove('disabled');

        // Перемикаємося назад на сторінку входу
        registerSection.classList.add('d-none');
        loginSection.classList.remove('d-none');
        
        // Показуємо повідомлення про успіх
        loginSuccessMsg.classList.remove('d-none');
        loginError.classList.add('d-none');
    }, 1000);
});

// Обробка форми Входу
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    const inputUser = document.getElementById('username').value;
    const inputPass = document.getElementById('password').value;

    // Дістаємо дані з пам'яті браузера, або залишаємо admin/admin як запасний варіант
    const validUser = localStorage.getItem('scada_user') || 'admin';
    const validPass = localStorage.getItem('scada_pass') || 'admin';

    loginError.classList.add('d-none');
    loginSuccessMsg.classList.add('d-none');
    loginText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    loginBtn.classList.add('disabled');

    // Імітація перевірки в базі даних (1.5 секунди)
    setTimeout(() => {
        if (inputUser === validUser && inputPass === validPass) {
            loginOverlay.classList.add('hidden');
            setTimeout(() => loginOverlay.remove(), 600); 
            
            addLog(`[AUTH] Оператор '${inputUser}' успішно авторизований.`, 'INFO');
            addLog(`[STREAM] Відкриття захищеного WebSocket з'єднання...`, 'INFO');
            
            startSimulation(); 
        } else {
            loginError.classList.remove('d-none');
            loginText.classList.remove('d-none');
            loginSpinner.classList.add('d-none');
            loginBtn.classList.remove('disabled');
        }
    }, 1500); 
});

// --- ЗАПУСК ДАНИХ ---
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
