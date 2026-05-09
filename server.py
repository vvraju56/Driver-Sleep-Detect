from flask import Flask, send_from_directory, jsonify, request
import subprocess
import threading
import sys
import os

app = Flask(__name__, static_folder="frontend")

detection_running = False
detection_process = None

API_BASE_URL = os.environ.get("API_BASE_URL", "")


@app.route("/")
def index():
    return send_from_directory("frontend", "index.html")


@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("frontend", path)


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
            detection_process.wait()
            detection_running = False
            detection_process = None

        threading.Thread(target=monitor_process, daemon=True).start()

        return jsonify(
            {
                "status": "started",
                "message": "Detection started successfully",
                "api_base_url": API_BASE_URL,
            }
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
    return jsonify({"running": detection_running, "api_base_url": API_BASE_URL})


if __name__ == "__main__":
    import sys

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
    print("=" * 50)
    print("DrivDect Web Interface")
    print("=" * 50)
    print(f"Open http://localhost:{port} in your browser")
    print("=" * 50)
    app.run(debug=True, port=port)
