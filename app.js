// Ініціалізація графіків (Dark Theme)
Chart.defaults.color = '#8b949e';
Chart.defaults.borderColor = '#2d3243';

const ctxVibro = document.getElementById('mainVibroChart').getContext('2d');
const ctxSound = document.getElementById('soundRadarChart').getContext('2d');

// Градієнт для вібрації
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
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHitRadius: 10
        }] 
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: { legend: { display: false } },
        scales: { 
            x: { display: true, grid: { display: false } }, 
            y: { min: 0, max: 100, grid: { borderDash: [2, 4] } } 
        }
    }
});

// Графік звуку (спектр)
const soundRadarChart = new Chart(ctxSound, {
    type: 'bar',
    data: {
        labels: ['125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz'],
        datasets: [{
            label: 'Спектр',
            data: [45, 50, 65, 85, 60, 40, 35],
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
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
    
    // Тримаємо тільки останні 50 логів
    if(logConsole.childElementCount > 50) logConsole.removeChild(logConsole.firstChild);
}

setInterval(() => {
    // Симуляція складної вібрації (кілька гармонік) + випадкові скачки
    let vibro = Math.abs(Math.sin(t) * 30 + Math.cos(t * 3.5) * 15) + (Math.random() * 5); 
    
    // Штучний "пробій" показників кожні ~15 секунд
    if (Math.random() > 0.95) {
        vibro += 40 + Math.random() * 20;
    }

    const sound = 65 + (Math.random() * 15);
    
    // Оновлення KPI
    kpiVibro.innerText = vibro.toFixed(1);
    kpiSound.innerText = sound.toFixed(1);
    
    // Дрібне коливання температури і сигналу
    if (Math.random() > 0.7) kpiTemp.innerText = (42.0 + Math.random()).toFixed(1);
    if (Math.random() > 0.9) kpiRssi.innerText = Math.floor(-75 + Math.random() * 15);

    // Логіка тривоги (Alert)
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

    // Оновлення графіка вібрації
    const timeStr = new Date().getSeconds();
    mainVibroChart.data.labels.shift();
    mainVibroChart.data.labels.push(timeStr);
    mainVibroChart.data.datasets[0].data.shift();
    mainVibroChart.data.datasets[0].data.push(vibro);
    mainVibroChart.update();

    // Оновлення спектрального графіка (анімація стовпчиків)
    soundRadarChart.data.datasets[0].data = soundRadarChart.data.datasets[0].data.map(val => {
        let newVal = val + (Math.random() * 10 - 5);
        return Math.max(20, Math.min(100, newVal)); // тримаємо в межах 20-100
    });
    soundRadarChart.update();

    // Фоновий лог
    if (Math.random() > 0.85 && !isAlert) {
        addLog(`Отримано пакет IoT_DATA_PAYLOAD (64 bytes) від Node_1`);
    }

    t += 0.2;
}, 300);