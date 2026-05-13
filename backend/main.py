from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router
from routes.intelligence import router as intelligence_router

from services.intelligence import analyze_system
from services.ai_explainer import generate_ai_explanation
from services.alert_service import trigger_system_alert, alerts

from datetime import datetime 
import requests

app = FastAPI(
    title="AI Ops System",
    description="Multimodal AI-based Infrastructure Monitoring System",
    version="1.0"
)

# ===== 🔥 NEW: ACTIVE NODE STORAGE =====
active_node = {}
process_history = []

HISTORY_LIMIT = 500

# ===== ROUTES =====
app.include_router(predict_router, prefix="/predict", tags=["Prediction"])
app.include_router(intelligence_router, prefix="/intelligence", tags=["AI Intelligence"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== HEALTH =====
@app.get("/")
def home():
    return {"message": "AI Ops Backend Running 🚀", "status": "active"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Ops Backend"}


# ===== MAIN PIPELINE =====
@app.post("/api/process")
def process(data: dict):

    global active_node   # 🔥 IMPORTANT
    global process_history

    print("\n🔥 ===== PROCESS STARTED =====")
    print("📥 INPUT:", data)

    # 🧠 FULL PIPELINE
    result = analyze_system(data)

    decision = result["decision"]

    print("⚡ FINAL DECISION:", decision)

    # 🚨 ALERT SYSTEM
    if decision["level"] == "HIGH":

        print("🚨 HIGH RISK DETECTED")

        try:
            trigger_system_alert(
                "⚠️ System Risk Alert",
                f"High risk ({decision['risk_score']:.2f}) detected!",
                decision
            )
        except Exception as e:
            print("❌ ALERT FAILED:", e)

        # 🟢 ESP32 (optional)
        try:
            requests.post(
                "http://192.168.1.100/alert",
                json={"status": "HIGH", "risk": decision["risk_score"]},
                timeout=2,
            )
            print("🟢 ESP32 ALERT SENT")
        except Exception as e:
            print("⚠️ ESP32 ERROR:", e)

    else:
        print("✅ SYSTEM SAFE")

    # ===== 🔥 UPDATE ACTIVE NODE (CORE CHANGE) =====
    active_node = {
        "node_id": data.get("node_id", "Current-System"),
        "cpu": result["metrics"].get("cpu"),
        "memory": result["metrics"].get("memory"),
        "ml_risk": decision.get("risk_score"),
        "status": decision.get("level"),
        "crash_time": decision.get("crash_time"),
        "timestamp": datetime.now().isoformat()
    }

    print("🟢 ACTIVE NODE UPDATED:", active_node)

    # ===== RESPONSE =====
    ai_explanation = generate_ai_explanation(decision)

    response_body = {
        "metrics": result["metrics"],
        "log": result["log"],
        "fusion": result["fusion"],
        "decision": decision,
        "ai_explanation": ai_explanation,
        "timestamp": datetime.now().isoformat()
    }

    process_history.append({
        "input": data,
        "output": response_body,
        "created_at": datetime.now().isoformat(),
    })
    if len(process_history) > HISTORY_LIMIT:
        process_history = process_history[-HISTORY_LIMIT:]

    return response_body


# ===== 🔥 NEW: GET ACTIVE NODE =====
@app.get("/api/active-node")
def get_active_node():
    return active_node


@app.get("/api/process-history")
def get_process_history():
    return {
        "count": len(process_history),
        "items": process_history[::-1]
    }


# ===== ALERTS =====
@app.get("/api/alerts")
def get_alerts():
    print(f"\n🔥 ALERT COUNT: {len(alerts)}")
    return {
        "count": len(alerts),
        "alerts": alerts[::-1]
    }


@app.delete("/api/alerts")
def clear_alerts():
    alerts.clear()
    print("🧹 ALERTS CLEARED")
    return {"message": "All alerts cleared"}