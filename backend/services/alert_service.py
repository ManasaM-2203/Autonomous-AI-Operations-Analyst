import time
import platform
import os
from datetime import datetime

# 🔥 SHARED ALERT STORAGE
alerts = []

# 🔥 cooldown tracker
last_alert_time = 0


def should_alert():
    """Prevent alert spam (30 sec cooldown)"""
    global last_alert_time

    current_time = time.time()

    if current_time - last_alert_time > 30:
        last_alert_time = current_time
        return True

    return False


def trigger_system_alert(title, message, risk_data=None):
    """
    Trigger system notification + store alert
    """

    print(f"\n🚨 ALERT FUNCTION CALLED: {title} - {message}")

    # ⏳ cooldown check
    if not should_alert():
        print("⏳ ALERT BLOCKED - COOLDOWN ACTIVE")
        return False

    # 🟡 STORE ALERT (for dashboard)
    alert_entry = {
        "title": title,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "risk": risk_data.get("level") if risk_data else None,
        "risk_score": risk_data.get("risk_score") if risk_data else None
    }

    alerts.append(alert_entry)
    print("🟡 ALERT STORED:", alert_entry)

    system = platform.system()

    # ===== 🍎 MACOS (PRIMARY) =====
    if system == "Darwin":
        try:
            safe_message = message.replace('"', '\\"')
            safe_title = title.replace('"', '\\"')

            os.system(
                f'osascript -e \'display notification "{safe_message}" with title "{safe_title}"\''
            )

            print("🍎 MACOS ALERT SENT")
            return True

        except Exception as e:
            print(f"❌ MAC ALERT FAILED: {e}")
            return False

    # ===== 🐧 LINUX =====
    elif system == "Linux":
        try:
            os.system(f'notify-send "{title}" "{message}"')
            print("🐧 LINUX ALERT SENT")
            return True

        except Exception as e:
            print(f"❌ LINUX ALERT FAILED: {e}")
            return False

    # ===== 🖥️ WINDOWS =====
    elif system == "Windows":
        try:
            from plyer import notification

            notification.notify(
                title=title,
                message=message,
                timeout=5
            )

            print("🪟 WINDOWS ALERT SENT")
            return True

        except Exception as e:
            print(f"❌ WINDOWS ALERT FAILED: {e}")
            print(f"🔔 FALLBACK: {title} - {message}")
            return False

    # ===== DEFAULT FALLBACK =====
    else:
        print("🔔 GENERIC ALERT:", title, "-", message)
        return True