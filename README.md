# Autonomous AI Operations Analyst

An intelligent AI-powered IT Operations monitoring and predictive incident analysis platform that simulates real-world DevOps and infrastructure monitoring workflows.

The system continuously monitors infrastructure metrics, detects anomalies, predicts failures before they occur, and provides AI-driven operational insights using machine learning, rule-based fusion logic, and live dashboards.

---

# 🚀 Project Overview

Modern IT infrastructures generate massive amounts of logs, metrics, alerts, and operational events every second.

Manually monitoring these systems becomes difficult, error-prone, and reactive.

This project solves that problem by building an autonomous AI operations analyst that:

* Monitors system metrics in real time
* Detects anomalies and operational risks
* Predicts infrastructure failures using ML models
* Performs risk fusion from multiple signals
* Generates intelligent alerts
* Streams live operational telemetry to dashboards
* Simulates real-world AIOps workflows

---

# ✨ Features

## 🔌 Hardware Integration

* ESP32-based edge monitoring integration
* Real-time hardware telemetry collection
* IoT-enabled alert communication
* Edge device simulation and monitoring
* Hybrid cloud + edge AI workflow support

## 🔍 Real-Time Monitoring

* CPU usage tracking
* Memory usage tracking
* Temperature monitoring
* Infrastructure node simulation
* Live dashboard streaming

## 🤖 AI & ML Intelligence

* Machine Learning-based risk prediction
* Risk scoring engine
* Anomaly detection
* Predictive failure analysis
* Decision fusion system
* Operational state classification

## 📊 Interactive Dashboard

* Live metrics visualization
* CPU usage graphs
* Performance monitoring
* Incident dashboard
* Alert monitoring
* Historical process analysis

## ⚡ Alerting System

* High-risk detection
* Critical state classification
* Automated alert triggers
* Risk escalation logic
* Alert cooldown handling

## 🌐 Deployment Ready

* Frontend deployed on Vercel
* Backend deployed on Render
* Production environment support
* Environment variable integration

---

# 🏗️ System Architecture

```text
ESP32 Edge Device / Simulated Nodes
                ↓
Live Metrics & Telemetry Pipeline
                ↓
FastAPI Backend
                ↓
AI Risk Engine + ML Models
                ↓
Decision Fusion + Alerting System
                ↓
Frontend Dashboard (React + Vite)
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* shadcn/ui

## Backend

* FastAPI
* Python
* Uvicorn

## AI / ML

* Scikit-learn
* Joblib
* Pandas
* NumPy

## Hardware & IoT

* ESP32
* Edge telemetry communication
* Sensor-based monitoring simulation

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# 📂 Project Structure

```text
Autonomous-AI-Operations-Analyst/
│
├── backend/
│   ├── main.py
│   ├── simulate.py
│   ├── ml_models/
│   ├── routes/
│   ├── utils/
│   └── requirements.txt
│
├── frontend/
│   └── Edge-AI/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
│
└── README.md
```

---

# ⚙️ Local Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/ManasaM-2203/Autonomous-AI-Operations-Analyst.git
cd Autonomous-AI-Operations-Analyst
```

---

# 🔧 Backend Setup

## Create Virtual Environment

```bash
cd backend
python -m venv venv
```

## Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

# 🎨 Frontend Setup

## Install Dependencies

```bash
cd frontend/Edge-AI
npm install
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://127.0.0.1:8080
```

---

# 🌍 Environment Variables

## Frontend `.env`

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

---

# ☁️ Deployment

## Frontend Deployment (Vercel)

### Configuration

| Setting          | Value            |
| ---------------- | ---------------- |
| Framework        | Vite             |
| Root Directory   | frontend/Edge-AI |
| Build Command    | npm run build    |
| Install Command  | npm install      |
| Output Directory | dist             |

### Environment Variable

```env
VITE_BACKEND_URL=https://your-render-backend.onrender.com
```

---

## Backend Deployment (Render)

### Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port 10000
```

### Python Version

```text
3.11.9
```

---

# 📡 API Endpoints

## Process Metrics

```http
GET /api/process-history
```

## Process Analysis

```http
POST /api/process
```

## Health Check

```http
GET /
```

---

# 🔌 Hardware Workflow

1. ESP32 edge device generates telemetry data
2. Metrics are transmitted to backend services
3. Backend validates and processes telemetry
4. AI engine evaluates infrastructure health
5. Alerts are generated for abnormal conditions
6. Dashboard visualizes live edge-device activity

---

# 🧠 AI Workflow

1. Metrics are generated or collected
2. Risk engine evaluates infrastructure state
3. ML models compute predictive risk scores
4. Fusion engine combines all signals
5. System classifies operational severity
6. Alerts are generated for critical conditions
7. Dashboard updates in real time

---

# 📈 Sample Risk Levels

| Risk Score | Severity |
| ---------- | -------- |
| 0.0 - 0.3  | LOW      |
| 0.3 - 0.6  | MEDIUM   |
| 0.6 - 0.8  | HIGH     |
| 0.8 - 1.0  | CRITICAL |

---

# 🌐 Real-World Use Cases

* Smart infrastructure monitoring
* Edge AI monitoring systems
* DevOps & AIOps platforms
* Industrial IoT analytics
* Predictive maintenance systems
* Autonomous operational monitoring

---

# 🔥 Future Enhancements

* Multi-node distributed monitoring
* Kubernetes monitoring integration
* Log aggregation pipelines
* LLM-powered incident summarization
* Root cause analysis engine
* Real-time notification system
* Grafana integration
* Cloud infrastructure monitoring
* Agentic remediation workflows

---

# 👩‍💻 Author

**Manasa M**

Dayananda Sagar College of Engineering

---

