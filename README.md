# Enterprise IoT Telemetry Dashboard (SCADA Prototype)

A professional, real-time frontend dashboard designed for monitoring industrial IoT sensors (vibration, acoustics, temperature). This project serves as a high-fidelity prototype demonstrating modern SCADA (Supervisory Control and Data Acquisition) interface design, client-side state management, and real-time data visualization.

## Live Demo
https://yura307.github.io/iot-telemetry-dashboard/

## Key Features

* **Real-Time Data Simulation:** Includes a custom built-in JavaScript engine that simulates high-frequency hardware telemetry (vibration harmonics and acoustic noise) without needing a physical backend.
* **Interactive Data Visualization:** Utilizes `Chart.js` for rendering smooth, real-time line charts (amplitude) and bar charts (frequency spectrum).
* **Advanced Auth System (Mock):** 
  * Fully functional UI for Login and Registration.
  * Real-time **password strength validation** (regex-based complexity scoring with visual progress bar).
  * State persistence using browser `localStorage` to simulate backend session management.
* **Critical Alerts Engine:** Dynamic threshold monitoring. If vibration exceeds a critical limit (75.0 mm/s), the UI triggers visual alarms and logs the event.
* **Industrial UI/UX (Dark Mode):** Built with Bootstrap 5, featuring a dark-themed, high-contrast interface typical of enterprise control rooms.
* **WebSocket Terminal Log:** A simulated live terminal displaying incoming data payloads and system authorization events.

## Tech Stack

* **Structure & Styling:** HTML5, CSS3, Bootstrap 5
* **Logic & State:** Vanilla JavaScript (ES6+), `localStorage` API
* **Charting:** Chart.js
* **Icons:** Bootstrap Icons

## How to Run Locally

This is a dependency-free static project. No `npm install` or backend server is required for the simulation.

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
