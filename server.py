from flask import Flask, jsonify
import subprocess
import threading
import sys
import os

app = Flask(__name__)


@app.route("/api/start-detection", methods=["POST"])
def start_detection():
    global detection_running, detection_process

    if detection_running:
        return jsonify(
            {"status": "already_running", "message": "Detection already running"}
        )

    try:
        detection_process = subprocess.Popen(
            [sys.executable, "drivdect.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        detection_running = True

        def monitor_process():
            global detection_running, detection_process
            detection_process.wait()  # type: ignore[attr-defined]
            detection_running = False
            detection_process = None

        threading.Thread(target=monitor_process, daemon=True).start()

        return jsonify(
            {"status": "started", "message": "Detection started successfully"}
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/stop-detection", methods=["POST"])
def stop_detection():
    global detection_running, detection_process

    if not detection_running or detection_process is None:
        return jsonify({"status": "not_running", "message": "Detection not running"})

    try:
        detection_process.terminate()
        detection_process = None
        detection_running = False
        return jsonify({"status": "stopped", "message": "Detection stopped"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"running": detection_running})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print("=" * 50)
    print("DrivDect Web Interface")
    print("=" * 50)
    print(f"Open http://localhost:{port} in your browser")
    print("=" * 50)
    app.run(debug=True, host="0.0.0.0", port=port)
