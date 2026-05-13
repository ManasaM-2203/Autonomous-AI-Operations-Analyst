import requests
import json
import time

BACKEND_URL = "http://127.0.0.1:8000/api/process"
DATA_FILE = "testing/metrics.json"
DELAY = 2  # seconds between each data point

def run_simulation():
    with open(DATA_FILE, "r") as f:
        metrics = json.load(f)

    print(f"🚀 Starting simulation with {len(metrics)} data points...")
    print(f"⏱  Sending one every {DELAY} seconds\n")

    loop_count = 1

    while True:
        print(f"🔁 Loop {loop_count}")

        for i, entry in enumerate(metrics):
            payload = {
                "node_id": "SIM-NODE-01",
                "cpu": entry["cpu"],
                "temperature": entry["temperature"],
                "memory": entry["memory"],
                "log": entry["log"]
            }

            try:
                response = requests.post(BACKEND_URL, json=payload)
                data = response.json()
                level = data.get("decision", {}).get("level", "?")
                risk = data.get("decision", {}).get("risk_score", "?")
                print(f"  [{i+1}/{len(metrics)}] CPU={entry['cpu']}% MEM={entry['memory']}% → {level} (risk: {risk})")
            except Exception as e:
                print(f"  ❌ Error sending data: {e}")

            time.sleep(DELAY)

        print(f"\n✅ Loop {loop_count} complete. Restarting...\n")
        loop_count += 1

if __name__ == "__main__":
    run_simulation()