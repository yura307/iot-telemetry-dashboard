# Enterprise IoT Telemetry Dashboard (Full-Stack SCADA)

🇬🇧 **[English](#english)** | 🇺🇦 **[Українська](#українська)**

---

<a id="english"></a>
## 🇬🇧 English

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
