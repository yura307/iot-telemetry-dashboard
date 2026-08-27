# Enterprise IoT Telemetry Dashboard (Full-Stack SCADA)

## English

A professional, real-time Full-Stack dashboard designed for monitoring industrial IoT sensors (vibration, acoustics, temperature, network RSSI). This project demonstrates a modern SCADA (Supervisory Control and Data Acquisition) architecture, integrating a Python backend, real-time WebSockets, cloud database, and secure user authentication.

### Live Demo
**[Launch Live Dashboard](https://iot-telemetry-dashboard-2.onrender.com)** 
*(Hosted on Render. The initial load might take 30-50 seconds as the free-tier server spins up).*

### Key Features

* **Real-Time Data Streaming:** Utilizes WebSockets via FastAPI backend to stream high-frequency hardware telemetry directly to the client without HTTP overhead.
* **Cloud Database Persistence:** Integrated with **MongoDB Atlas** for secure, permanent storage of user accounts, roles, and profile settings.
* **Authentication System:** 
  * Fully functional UI for Login and Registration.
  * Real-time **password strength validation** (regex-based complexity scoring with visual progress bar).
* **Interactive Data Visualization:** Utilizes `Chart.js` for rendering smooth, real-time line charts (amplitude) and frequency spectrum bars.
* **Hardware Integration Ready:** The backend is structured to accept live data payloads from microcontrollers (e.g., ESP32/ESP8266 reading BME280 or vibration sensors) instead of simulated data.
* **Industrial UI/UX:** Built with Bootstrap 5, featuring a dark-themed, high-contrast interface typical of enterprise control rooms with real-time critical alert threshold logic.

### Tech Stack

**Backend:**
* Python 3.10+
* FastAPI & Uvicorn (REST API & WebSockets)
* PyMongo (MongoDB Cloud Integration)

**Frontend:**
* HTML5, CSS3, Bootstrap 5
* Vanilla JavaScript (ES6+)
* Chart.js (Real-time graphing)

### How to Run Locally

To run this complete Full-Stack environment on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
   ```

2. **Install Python dependencies:**
   Make sure you have Python installed, then run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up the Database environment variable:**
   Create an environment variable for your MongoDB connection string (or add it directly for local testing):
   ```bash
   # Windows (Command Prompt)
   set MONGO_URL=mongodb+srv://<username>:<password>@cluster0...
   ```

4. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access the Application:**
   Open your browser and navigate to `http://127.0.0.1:8000`

---

## Українська

Професійний Full-Stack дашборд реального часу, розроблений для моніторингу промислових IoT-датчиків (вібрація, акустика, температура, мережа RSSI). Цей проєкт демонструє сучасну архітектуру SCADA (Supervisory Control and Data Acquisition), інтегруючи Python-бекенд, WebSockets у реальному часі, хмарну базу даних та безпечну авторизацію користувачів.

### Live Demo (Жива демонстрація)
**[Запустити Live Dashboard](https://iot-telemetry-dashboard-2.onrender.com)** 
*(Розміщено на Render. Перше завантаження може тривати 30-50 секунд, поки запускається безкоштовний сервер).*

### Основні можливості

* **Передача даних у реальному часі:** Використовує WebSockets через FastAPI-бекенд для потокової передачі високочастотної телеметрії обладнання безпосередньо до клієнта без затримок HTTP.
* **Хмарна база даних:** Інтегровано з **MongoDB Atlas** для безпечного, постійного зберігання облікових записів користувачів, ролей та налаштувань профілів.
* **Система авторизації:** 
  * Повністю функціональний інтерфейс для входу та реєстрації.
  * Перевірка надійності пароля в реальному часі (оцінка складності за допомогою регулярних виразів з візуальним прогрес-баром).
* **Інтерактивна візуалізація даних:** Використовує `Chart.js` для плавного рендерингу лінійних графіків (амплітуда) та гістограм частотного спектра.
* **Готовність до інтеграції з обладнанням:** Бекенд побудований таким чином, щоб приймати реальні дані з мікроконтролерів (наприклад, ESP32/ESP8266 з підключеними датчиками мікроклімату або вібрації) замість симульованих даних.
* **Промисловий UI/UX:** Створено за допомогою Bootstrap 5, має темний, висококонтрастний інтерфейс, типовий для корпоративних диспетчерських пультів, з логікою спрацьовування критичних сповіщень.

### Технологічний стек

**Бекенд (Backend):**
* Python 3.10+
* FastAPI та Uvicorn (REST API та WebSockets)
* PyMongo (Інтеграція з MongoDB Cloud)

**Фронтенд (Frontend):**
* HTML5, CSS3, Bootstrap 5
* Vanilla JavaScript (ES6+)
* Chart.js (Графіки в реальному часі)

### Як запустити локально

Щоб запустити це Full-Stack середовище на вашому комп'ютері:

1. **Клонуйте репозиторій:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
   ```

2. **Встановіть залежності Python:**
   Переконайтеся, що у вас встановлено Python, потім виконайте:
   ```bash
   pip install -r requirements.txt
   ```

3. **Налаштуйте змінну середовища для бази даних:**
   Створіть змінну середовища для підключення до MongoDB (або додайте її безпосередньо у код для локального тестування):
   ```bash
   # Windows (Командний рядок)
   set MONGO_URL=mongodb+srv://<username>:<password>@cluster0...
   ```

4. **Запустіть сервер FastAPI:**
   ```bash
   uvicorn main:app --reload
   ```

5. **Відкрийте додаток:**
   Перейдіть у браузері за адресою `http://127.0.0.1:8000`
