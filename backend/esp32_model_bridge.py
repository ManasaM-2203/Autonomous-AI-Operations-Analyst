import argparse
import json
import time

import serial

from services.predictor import predict_log
from utils.severity_loader import load_severity_models


def _to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_predict(model, features):
    try:
        return model.predict([features])[0]
    except Exception as exc:
        return f"error: {exc}"


def build_severity(payload, log_pred, early_model, final_model):
    if not log_pred.get("is_anomaly", False):
        return None

    cpu = _to_float(payload.get("cpu", 0.0))
    memory = _to_float(payload.get("memory", 0.0))
    disk = _to_float(payload.get("disk", 0.0))
    network = _to_float(payload.get("network", 0.0))
    tstamp = _to_float(payload.get("time", 0.0))
    log_severity = _to_float(payload.get("log_severity", 0.0))
    cpu_spike = _to_float(payload.get("cpu_spike", 0.0))
    memory_spike = _to_float(payload.get("memory_spike", 0.0))
    stress_score = _to_float(payload.get("stress_score", 0.0))
    log_score = _to_float(log_pred.get("score", 0.0))
    anomaly_flag = int(bool(log_pred.get("is_anomaly", False)))

    ratio = cpu / memory if memory else 0.0

    early_features = [cpu, memory, anomaly_flag]
    final_features = [
        cpu,
        memory,
        disk,
        network,
        tstamp,
        anomaly_flag,
        log_score,
        log_severity,
        ratio,
        cpu_spike,
        memory_spike,
        stress_score,
    ]

    return {
        "early_severity": _safe_predict(early_model, early_features),
        "final_severity": _safe_predict(final_model, final_features),
    }


def handle_payload(payload, early_model, final_model):
    if payload.get("type") == "ping":
        return {"type": "pong", "ok": True}

    log_text = payload.get("log", "")
    log_pred = predict_log(log_text)
    severity = build_severity(payload, log_pred, early_model, final_model)

    return {
        "type": "model_result",
        "log_risk": float(log_pred.get("log_risk", 0.0)),
        "is_anomaly": bool(log_pred.get("is_anomaly", False)),
        "score": float(log_pred.get("score", 0.0)),
        "severity": severity,
        "cleaned_log": log_pred.get("cleaned_log", ""),
    }


def run_bridge(port, baud, timeout_s):
    early_model, final_model = load_severity_models()

    with serial.Serial(port=port, baudrate=baud, timeout=timeout_s) as ser:
        print(f"[bridge] connected on {port} @ {baud}")
        print("[bridge] waiting for JSON lines from ESP32...")

        while True:
            raw = ser.readline()
            if not raw:
                continue

            line = raw.decode("utf-8", errors="ignore").strip()
            if not line:
                continue

            try:
                payload = json.loads(line)
                response = handle_payload(payload, early_model, final_model)
            except Exception as exc:
                response = {"type": "error", "message": str(exc)}

            wire = (json.dumps(response) + "\n").encode("utf-8")
            ser.write(wire)
            ser.flush()

            print(f"[in ] {line}")
            print(f"[out] {response}")
            time.sleep(0.02)


def main():
    parser = argparse.ArgumentParser(description="ESP32 serial bridge for local .pkl model inference")
    parser.add_argument("--port", required=True, help="Serial port, for example COM5")
    parser.add_argument("--baud", type=int, default=115200, help="Serial baud rate")
    parser.add_argument("--timeout", type=float, default=0.5, help="Serial read timeout in seconds")
    args = parser.parse_args()

    run_bridge(port=args.port, baud=args.baud, timeout_s=args.timeout)


if __name__ == "__main__":
    main()
