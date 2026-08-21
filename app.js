// --- Ініціалізація графіків ---
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
let t = 0; let isAlert = false; let simulationInterval;

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

// --- БАЗА ДАНИХ КОРИСТУВАЧІВ ---
let dbUsers = JSON.parse(localStorage.getItem('scada_users')) || {};
if (!dbUsers['admin']) { dbUsers['admin'] = { pass: 'admin', name: 'Системний Admin', role: 'Головний інженер', tfa: false }; localStorage.setItem('scada_users', JSON.stringify(dbUsers)); }
let activeUser = null; 

const loginOverlay = document.getElementById('login-overlay');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const otpSection = document.getElementById('otp-section'); // НОВА СЕКЦІЯ
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const regPasswordInput = document.getElementById('reg-password');
const pwdStrengthContainer = document.getElementById('pwd-strength-container');
const pwdStrengthBar = document.getElementById('pwd-strength-bar');
const pwdStrengthText = document.getElementById('pwd-strength-text');
const registerBtn = document.getElementById('register-btn');

document.getElementById('show-register').addEventListener('click', (e) => { e.preventDefault(); loginSection.classList.add('d-none'); registerSection.classList.remove('d-none'); });
document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); registerSection.classList.add('d-none'); loginSection.classList.remove('d-none'); });
document.getElementById('back-to-reg-from-otp').addEventListener('click', (e) => { e.preventDefault(); otpSection.classList.add('d-none'); registerSection.classList.remove('d-none'); });

window.addEventListener('DOMContentLoaded', () => {
    const savedLogin = localStorage.getItem('scada_remembered_user');
    const savedPass = localStorage.getItem('scada_remembered_pass');
    if (savedLogin && savedPass) {
        document.getElementById('username').value = savedLogin;
        document.getElementById('password').value = savedPass;
        document.getElementById('remember-me').checked = true;
    }
});

regPasswordInput.addEventListener('input', function() {
    const val = this.value;
    if (val.length > 0) { pwdStrengthContainer.classList.remove('d-none'); } else { pwdStrengthContainer.classList.add('d-none'); registerBtn.disabled = true; return; }
    let missing = [];
    if (val.length < 8) missing.push('8 символів'); if (!/[A-Z]/.test(val)) missing.push('велику літеру'); if (!/[0-9]/.test(val)) missing.push('цифру'); if (!/[^A-Za-z0-9]/.test(val)) missing.push('спецсимвол (!@#)');
    if (missing.length >= 3) { pwdStrengthBar.style.width = '33%'; pwdStrengthBar.className = 'progress-bar bg-danger'; pwdStrengthText.innerText = 'Слабкий: додайте ' + missing[0]; pwdStrengthText.className = 'fw-bold text-danger'; registerBtn.disabled = true; } 
    else if (missing.length > 0) { pwdStrengthBar.style.width = '66%'; pwdStrengthBar.className = 'progress-bar bg-warning'; pwdStrengthText.innerText = 'Бракує: ' + missing.join(', '); pwdStrengthText.className = 'fw-bold text-warning'; registerBtn.disabled = true; } 
    else { pwdStrengthBar.style.width = '100%'; pwdStrengthBar.className = 'progress-bar bg-success'; pwdStrengthText.innerText = 'Надійний (Всі вимоги виконано)'; pwdStrengthText.className = 'fw-bold text-success'; registerBtn.disabled = false; }
});

// --- ЗМІННІ ДЛЯ ТИМЧАСОВОГО ЗБЕРЕЖЕННЯ (OTP) ---
let tempRegUser = "";
let tempRegPass = "";
let generatedOTP = "";

// --- РЕЄСТРАЦІЯ ТА ВІДПРАВКА OTP ---
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('reg-username').value;
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;
    const regError = document.getElementById('reg-error');

    if (pass !== passConfirm) { regError.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i> Паролі не співпадають!'; regError.classList.remove('d-none'); return; }
    if (dbUsers[user]) { regError.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i> Обліковий запис вже існує!'; regError.classList.remove('d-none'); return; }
    
    regError.classList.add('d-none');
    document.getElementById('register-text').classList.add('d-none');
    document.getElementById('register-spinner').classList.remove('d-none');
    registerBtn.classList.add('disabled');

    // Імітація обробки даних
    setTimeout(() => {
        tempRegUser = user;
        tempRegPass = pass;
        
        // Генеруємо 6-значний код
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Визначаємо Email чи Телефон
        const isEmail = user.includes('@');
        
        // Налаштовуємо текст у вікні OTP
        const otpDesc = document.getElementById('otp-desc');
        if(isEmail) {
            otpDesc.innerHTML = `Ми відправили лист на <b>${user}</b>.`;
        } else {
            otpDesc.innerHTML = `Ми відправили SMS/Telegram на номер <b>${user}</b>.`;
        }
        
        // Перемикаємо вікна
        registerSection.classList.add('d-none');
        otpSection.classList.remove('d-none');
        document.getElementById('register-text').classList.remove('d-none');
        document.getElementById('register-spinner').classList.add('d-none');
        registerBtn.classList.remove('disabled');

        // ВИКЛИК СИМУЛЯЦІЇ СПОВІЩЕННЯ (Через 2 секунди)
        setTimeout(() => {
            const notifTitle = document.getElementById('notif-title');
            const notifIcon = document.getElementById('notif-icon');
            const notifBody = document.getElementById('notif-body');
            
            if(isEmail) {
                notifTitle.innerText = "Новий Email (Gmail)";
                notifIcon.className = "bi bi-envelope-fill text-danger me-2";
                notifBody.innerHTML = `Ваш код підтвердження SCADA: <b class="fs-4 ms-2">${generatedOTP}</b>`;
            } else {
                notifTitle.innerText = "Telegram / Viber";
                notifIcon.className = "bi bi-telegram text-info me-2";
                notifBody.innerHTML = `Код авторизації системи: <b class="fs-4 ms-2">${generatedOTP}</b> Нікому не повідомляйте його.`;
            }
            
            const toastElement = document.getElementById('mockNotification');
            const toast = new bootstrap.Toast(toastElement, { autohide: false });
            toast.show();
            
        }, 2000);

    }, 800);
});

// --- ПІДТВЕРДЖЕННЯ OTP ТА СТВОРЕННЯ АКАУНТА ---
document.getElementById('verify-otp-btn').addEventListener('click', function() {
    const inputOTP = document.getElementById('otp-input').value;
    const otpError = document.getElementById('otp-error');
    
    if(inputOTP === generatedOTP) {
        // Код вірний! Створюємо акаунт в базі
        otpError.classList.add('d-none');
        
        dbUsers[tempRegUser] = { pass: tempRegPass, name: '', role: '', tfa: false };
        localStorage.setItem('scada_users', JSON.stringify(dbUsers));
        
        // Ховаємо тост, якщо він відкритий
        const toastEl = document.getElementById('mockNotification');
        const toast = bootstrap.Toast.getInstance(toastEl);
        if(toast) toast.hide();

        // Скидаємо форми і йдемо на логін
        registerForm.reset(); 
        document.getElementById('otp-input').value = "";
        pwdStrengthContainer.classList.add('d-none');
        
        otpSection.classList.add('d-none'); 
        loginSection.classList.remove('d-none');
        document.getElementById('login-success-msg').classList.remove('d-none'); 
    } else {
        otpError.classList.remove('d-none');
    }
});


// --- ВХІД З БАЗИ ДАНИХ ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const inputUser = document.getElementById('username').value;
    const inputPass = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    document.getElementById('login-error').classList.add('d-none');
    document.getElementById('login-success-msg').classList.add('d-none');
    document.getElementById('login-text').classList.add('d-none');
    document.getElementById('login-spinner').classList.remove('d-none');
    document.getElementById('login-btn').classList.add('disabled');

    setTimeout(() => {
        if (dbUsers[inputUser] && dbUsers[inputUser].pass === inputPass) {
            activeUser = inputUser; 
            
            if (rememberMe) {
                localStorage.setItem('scada_remembered_user', inputUser);
                localStorage.setItem('scada_remembered_pass', inputPass);
            } else {
                localStorage.removeItem('scada_remembered_user');
                localStorage.removeItem('scada_remembered_pass');
            }

            const savedName = dbUsers[activeUser].name || activeUser;
            const savedRole = dbUsers[activeUser].role || 'Черговий оператор';
            
            document.getElementById('nav-username').innerText = savedName;
            document.getElementById('nav-role').innerText = savedRole;
            document.getElementById('user-profile-menu').classList.remove('d-none');
            document.getElementById('user-profile-menu').classList.add('d-flex');

            loginOverlay.classList.add('hidden');
            setTimeout(() => loginOverlay.style.display = 'none', 600); 
            addLog(`[AUTH] Оператор '${inputUser}' успішно авторизований.`, 'INFO');
            if(dbUsers[activeUser].tfa === true) { addLog(`[SECURITY] 2FA верифікацію пройдено успішно.`, 'INFO'); }
            addLog(`[STREAM] Відкриття захищеного WebSocket з'єднання...`, 'INFO');
            startSimulation(); 
            
            document.getElementById('profile-name').value = dbUsers[activeUser].name || '';
            document.getElementById('profile-role').value = dbUsers[activeUser].role || '';
            if(dbUsers[activeUser].tfa === true) {
                document.getElementById('tfa-switch').checked = true;
                document.getElementById('tfa-setup-block').classList.remove('d-none');
                document.getElementById('tfa-code-input').disabled = true;
                document.getElementById('tfa-verify-btn').classList.add('d-none');
                document.getElementById('tfa-success-msg').classList.remove('d-none');
            } else {
                document.getElementById('tfa-switch').checked = false;
                document.getElementById('tfa-setup-block').classList.add('d-none');
                document.getElementById('tfa-code-input').disabled = false;
                document.getElementById('tfa-code-input').value = '';
                document.getElementById('tfa-verify-btn').classList.remove('d-none');
                document.getElementById('tfa-success-msg').classList.add('d-none');
            }
        } else {
            document.getElementById('login-error').classList.remove('d-none');
            document.getElementById('login-text').classList.remove('d-none');
            document.getElementById('login-spinner').classList.add('d-none');
            document.getElementById('login-btn').classList.remove('disabled');
        }
    }, 1500); 
});

document.getElementById('logout-btn').addEventListener('click', function() { location.reload(); });

// --- ЛОГІКА ПРОФІЛЮ ТА 2FA ДЛЯ ПОТОЧНОГО КОРИСТУВАЧА ---
document.getElementById('profile-details-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newName = document.getElementById('profile-name').value;
    const newRole = document.getElementById('profile-role').value;
    
    dbUsers[activeUser].name = newName;
    dbUsers[activeUser].role = newRole;
    localStorage.setItem('scada_users', JSON.stringify(dbUsers));
    
    document.getElementById('nav-username').innerText = newName || activeUser;
    document.getElementById('nav-role').innerText = newRole || 'Черговий оператор';
    
    document.getElementById('profile-save-msg').classList.remove('d-none');
    setTimeout(() => document.getElementById('profile-save-msg').classList.add('d-none'), 3000);
});

document.getElementById('tfa-switch').addEventListener('change', function() {
    const setupBlock = document.getElementById('tfa-setup-block');
    if (this.checked) { setupBlock.classList.remove('d-none'); } 
    else {
        setupBlock.classList.add('d-none'); dbUsers[activeUser].tfa = false; localStorage.setItem('scada_users', JSON.stringify(dbUsers));
        document.getElementById('tfa-success-msg').classList.add('d-none'); document.getElementById('tfa-code-input').disabled = false;
        document.getElementById('tfa-code-input').value = ''; document.getElementById('tfa-verify-btn').classList.remove('d-none');
    }
});

document.getElementById('tfa-verify-btn').addEventListener('click', function() {
    const code = document.getElementById('tfa-code-input').value;
    if(code.length === 6) {
        dbUsers[activeUser].tfa = true; localStorage.setItem('scada_users', JSON.stringify(dbUsers));
        this.classList.add('d-none'); document.getElementById('tfa-code-input').disabled = true; document.getElementById('tfa-success-msg').classList.remove('d-none');
    } else { alert("Будь ласка, введіть 6-значний код."); }
});

document.getElementById('delete-account-btn').addEventListener('click', function() {
    if (activeUser === 'admin') { alert("Помилка доступу: Системний обліковий запис 'admin' неможливо видалити."); return; }
    if (confirm("УВАГА! Ви впевнені, що хочете назавжди видалити цей обліковий запис? Цю дію неможливо скасувати.")) {
        delete dbUsers[activeUser]; localStorage.setItem('scada_users', JSON.stringify(dbUsers));
        if (localStorage.getItem('scada_remembered_user') === activeUser) {
            localStorage.removeItem('scada_remembered_user'); localStorage.removeItem('scada_remembered_pass');
        }
        location.reload();
    }
});

// --- Симуляція Даних ---
function startSimulation() {
    simulationInterval = setInterval(() => {
        let vibro = Math.abs(Math.sin(t) * 30 + Math.cos(t * 3.5) * 15) + (Math.random() * 5); 
        if (Math.random() > 0.95) vibro += 40 + Math.random() * 20;
        const sound = 65 + (Math.random() * 15);
        kpiVibro.innerText = vibro.toFixed(1); kpiSound.innerText = sound.toFixed(1);
        if (Math.random() > 0.7) kpiTemp.innerText = (42.0 + Math.random()).toFixed(1);
        if (Math.random() > 0.9) kpiRssi.innerText = Math.floor(-75 + Math.random() * 15);
        if (vibro > 75) { if (!isAlert) { alertCard.classList.add('alert-flash'); alertIcon.classList.remove('d-none'); addLog(`КРИТИЧНА ВІБРАЦІЯ: ${vibro.toFixed(2)} мм/с (Поріг 75.0)`, "CRIT"); isAlert = true; } } else { if (isAlert) { alertCard.classList.remove('alert-flash'); alertIcon.classList.add('d-none'); addLog(`Вібрація стабілізувалась: ${vibro.toFixed(2)} мм/с`, "INFO"); isAlert = false; } }
        const timeStr = new Date().getSeconds();
        mainVibroChart.data.labels.shift(); mainVibroChart.data.labels.push(timeStr);
        mainVibroChart.data.datasets[0].data.shift(); mainVibroChart.data.datasets[0].data.push(vibro);
        mainVibroChart.update();
        soundRadarChart.data.datasets[0].data = soundRadarChart.data.datasets[0].data.map(val => {
            let newVal = val + (Math.random() * 10 - 5); return Math.max(20, Math.min(100, newVal));
        });
        soundRadarChart.update();
        if (Math.random() > 0.85 && !isAlert) addLog(`Отримано пакет IoT_DATA_PAYLOAD від Node_1`);
        t += 0.2;
    }, 300);
}
