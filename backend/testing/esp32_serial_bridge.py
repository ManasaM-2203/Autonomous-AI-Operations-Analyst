"""USB-serial bridge for the ESP32 hybrid pipeline.

Flow:
1. Laptop reads metric rows from metrics.json (or a custom file).
2. Laptop sends raw metrics to ESP32 as: cpu,temperature,memory\n
3. ESP32 preprocesses and returns: cpu_norm,load,flag\n
4. Laptop performs ML/AI work locally.
5. Laptop sends final result to ESP32 as: anomaly,severity\n
This script currently simulates the ML output with a lightweight rule set.
Replace simulate_ml_output() with your real model inference later.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import serial
import requests

DEFAULT_BAUD = 115200
DEFAULT_TIMEOUT = 1.0
DEFAULT_STEP_DELAY = 1.5
READY_TOKEN = "READY"
ERROR_TOKEN = "ERR"
API_URLS = [
    "http://127.0.0.1:8081/api/process",
    "http://127.0.0.1:8081/intelligence/analyze",
    "http://127.0.0.1:8081/analyze",
]


def load_metrics(metrics_file: Path) -> list[dict]:
    with metrics_file.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, list):
        raise ValueError("metrics file must contain a JSON list")
    return payload


def discover_metric_files(script_dir: Path) -> list[Path]:
    candidates = sorted(script_dir.glob("metrics*.json"))
    if not candidates:
        raise FileNotFoundError("no metrics*.json files found in testing directory")
    return candidates


def choose_metrics_file(script_dir: Path, provided_path: str | None) -> Path:
    if provided_path:
        return Path(provided_path)

    candidates = discover_metric_files(script_dir)

    print("[info] available metric files:")
    for idx, path in enumerate(candidates, start=1):
        print(f"  {idx}. {path.name}")

    default_idx = next((i for i, p in enumerate(candidates, start=1) if p.name == "metrics.json"), 1)

    try:
        choice = input(f"Select metrics file [default {default_idx}]: ").strip()
    except EOFError:
        choice = ""

    if not choice:
        return candidates[default_idx - 1]

    if choice.isdigit():
        selected = int(choice)
        if 1 <= selected <= len(candidates):
            return candidates[selected - 1]

    for path in candidates:
        if choice == path.name:
            return path

    raise ValueError(f"invalid metrics selection: {choice!r}")


def format_raw_metrics(item: dict) -> str:
    cpu = float(item.get("cpu", 0.0))
    temperature = float(item.get("temperature", 0.0))
    memory = float(item.get("memory", 0.0))
    return f"{cpu:.0f},{temperature:.0f},{memory:.0f}\n"


def parse_processed_line(line: str) -> tuple[float, float, int]:
    parts = [part.strip() for part in line.split(",")]
    if len(parts) != 3:
        raise ValueError(f"expected 3 values from ESP32, got: {line!r}")
    return float(parts[0]), float(parts[1]), int(parts[2])


def severity_to_code(state: str | None) -> int:
    mapping = {"SAFE": 0, "WARNING": 1, "CRITICAL": 2}
    return mapping.get(str(state or "SAFE").upper(), 0)


def call_backend_analysis(raw_item: dict) -> tuple[int, int, str]:
    """Call the real FastAPI backend and extract only the compact result.

    Returns:
        anomaly_code, severity_code, ai_explanation
    """
    payload = {
        "cpu": raw_item.get("cpu", 0.0),
        "memory": raw_item.get("memory", 0.0),
        "log": raw_item.get("log", ""),
    }

    last_error: Exception | None = None
    data: dict | None = None

    for api_url in API_URLS:
        try:
            response = requests.post(api_url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            break
        except Exception as exc:
            last_error = exc

    if data is None:
        raise RuntimeError(f"backend call failed for all endpoints: {last_error}")

    log_data = data.get("log") or {}
    decision = data.get("decision") or {}

    anomaly = 1 if bool(log_data.get("is_anomaly", False)) else 0
    severity = severity_to_code(decision.get("state"))
    explanation = str(data.get("ai_explanation", "")).strip()

    return anomaly, severity, explanation


def read_until_ready(ser: serial.Serial, timeout_s: float) -> None:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        raw = ser.readline()
        if not raw:
            continue
        text = raw.decode("utf-8", errors="ignore").strip()
        if text == READY_TOKEN:
            return
    print("[warn] ESP32 READY token not received before timeout; continuing anyway.")


def send_line(ser: serial.Serial, line: str) -> None:
    ser.write(line.encode("utf-8"))
    ser.flush()


def read_payload_line(ser: serial.Serial, timeout_s: float) -> str:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        raw = ser.readline()
        if not raw:
            continue
        text = raw.decode("utf-8", errors="ignore").strip()
        if not text:
            continue
        if text == ERROR_TOKEN:
            raise RuntimeError("ESP32 returned ERR")
        return text
    raise TimeoutError("timed out waiting for ESP32 response")


def run_bridge(port: str, baud: int, timeout_s: float, metrics_file: Path, step_delay_s: float) -> None:
    metrics = load_metrics(metrics_file)
    print(f"[info] loaded {len(metrics)} metric rows from {metrics_file}")

    with serial.Serial(port=port, baudrate=baud, timeout=timeout_s, write_timeout=timeout_s) as ser:
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        read_until_ready(ser, timeout_s=5.0)

        for index, item in enumerate(metrics, start=1):
            raw_line = format_raw_metrics(item)
            print(f"\n[{index}] laptop -> esp32 : {raw_line.strip()}")
            send_line(ser, raw_line)

            processed_line = read_payload_line(ser, timeout_s=timeout_s)
            cpu_norm, load, flag = parse_processed_line(processed_line)
            print(f"[{index}] esp32  -> laptop: {processed_line}")

            # Real backend call happens here. The request uses the original metrics,
            # not the ESP32-processed values, so the FastAPI /analyze endpoint performs
            # the heavy ML, fusion, risk, alert, and AI explanation work.
            try:
                anomaly, severity, explanation = call_backend_analysis(item)
            except Exception as exc:
                print(f"[{index}] backend error     : {exc} -> falling back to SAFE")
                anomaly, severity, explanation = 0, 0, "Backend unavailable; falling back to SAFE."

            result_line = f"{anomaly},{severity}\n"
            print(f"[{index}] laptop -> esp32 : {result_line.strip()}")
            send_line(ser, result_line)

            severity_label = {0: "SAFE", 1: "WARNING", 2: "CRITICAL"}.get(severity, "SAFE")
            print(f"[{index}] final result      : anomaly={anomaly}, severity={severity_label}")
            print(f"[{index}] ai explanation    : {explanation}")
            time.sleep(max(step_delay_s, 0.0))

    print("\n[done] serial session complete")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="USB serial bridge for the ESP32 hybrid AI system")
    parser.add_argument("--port", required=True, help="Serial port, for example COM5 or /dev/ttyUSB0")
    parser.add_argument("--baud", type=int, default=DEFAULT_BAUD, help="Baud rate for the serial link")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT, help="Read timeout in seconds")
    parser.add_argument(
        "--step-delay",
        type=float,
        default=DEFAULT_STEP_DELAY,
        help="Delay (seconds) between files so LCD updates are readable",
    )
    parser.add_argument(
        "--metrics-file",
        default=None,
        help="Path to the metrics JSON file. If omitted, you can choose interactively.",
    )
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    script_dir = Path(__file__).resolve().parent

    try:
        metrics_file = choose_metrics_file(script_dir=script_dir, provided_path=args.metrics_file)
        run_bridge(
            port=args.port,
            baud=args.baud,
            timeout_s=args.timeout,
            metrics_file=metrics_file,
            step_delay_s=args.step_delay,
        )
    except KeyboardInterrupt:
        print("\n[stopped] interrupted by user")
    except Exception as exc:
        print(f"[error] {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
