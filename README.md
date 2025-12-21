# Driver Drowsiness Detection System

This project is a real-time driver drowsiness detection system that uses a webcam to monitor the driver's eyes. If the driver's eyes remain closed for a certain period, the system triggers an alert to wake them up.

## Features

*   **Real-time Eye Tracking:** The system uses OpenCV to detect faces and eyes in real-time from a webcam feed.
*   **Drowsiness Detection:** The system detects drowsiness by monitoring the duration for which the driver's eyes are closed.
*   **Multi-channel Alerts:** When drowsiness is detected, the system triggers a series of alerts:
    *   Plays an audible alarm.
    *   Sends an SMS notification using Twilio.
    *   Makes a phone call using Twilio.
    *   Sends an email notification.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vvraju56/Driver-Sleep-Detect.git
    ```
2.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Create a `config.py` file:**
    Create a `config.py` file in the project root and add your credentials for Twilio and your email account. You can use the `config.py.example` file as a template.

4.  **Provide an alert sound:**
    Add an alert sound file named `alert_sound.mp3` to the project directory.

5.  **Run the application:**
    ```bash
    python drivdect.py
    ```

## How it works

The script uses Haar cascade classifiers to detect faces and then eyes within the face region. It calculates the duration for which the eyes are closed. If the duration exceeds a certain threshold, it assumes that the driver is drowsy and triggers the alerts.

## Disclaimer

This is a proof-of-concept project and should not be used as a primary safety device.