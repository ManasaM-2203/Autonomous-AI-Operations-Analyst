import json
import time
import sys
from pathlib import Path

import requests


BASE_URL = "http://127.0.0.1:8081"
ENDPOINT = f"{BASE_URL}/api/process"
METRICS_FILE = Path(__file__).parent / "metrics.json"


def main() -> None:
	metrics_file = METRICS_FILE
	if len(sys.argv) > 1:
		arg = Path(sys.argv[1])
		metrics_file = arg if arg.is_absolute() else (Path(__file__).parent / arg)

	if not metrics_file.exists():
		print(f"metrics file not found: {metrics_file}")
		return

	print(f"using metrics file: {metrics_file.name}")

	with metrics_file.open("r", encoding="utf-8") as f:
		metrics_list = json.load(f)

	for idx, payload in enumerate(metrics_list, start=1):
		body = {
			"cpu": payload.get("cpu"),
			"temperature": payload.get("temperature"),
			"memory": payload.get("memory"),
			"log": payload.get("log", ""),
		}

		try:
			response = requests.post(ENDPOINT, json=body, timeout=30)
			response.raise_for_status()
			result = response.json()
		except Exception as exc:
			print(f"Test number: {idx}")
			print(f"anomaly: false")
			print(f"state: error")
			print(f"final risk score: N/A")
			print(f"ai explanation: request failed - {exc}")
			print()
			time.sleep(1)
			continue

		log_data = result.get("log") or {}
		decision = result.get("decision") or {}
		risk_score = decision.get("risk_score", "N/A")
		explanation = result.get("ai_explanation") or decision.get("reason", "No decision reason provided")

		print(f"Test number: {idx}")
		print(f"Anomaly: {bool(log_data.get('is_anomaly', False))}")
		print(f"State: {str(decision.get('state', 'unknown')).lower()}")
		print(f"Final risk score: {risk_score}")
		print(f"AI Explanation : {explanation}")
		print("-" * 50)
		print()

		time.sleep(1)


if __name__ == "__main__":
	main()
