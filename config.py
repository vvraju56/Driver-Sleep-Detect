import os

ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_NUMBER = os.environ.get("TWILIO_NUMBER", "")
TO_NUMBER = os.environ.get("TO_NUMBER", "")

SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
EMAIL_USER = os.environ.get("EMAIL_USER", "")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")
TO_EMAIL = os.environ.get("TO_EMAIL", "")

FACE_CASCADE_PATH = "haarcascade_frontalface_default.xml"
EYE_CASCADE_PATH = "haarcascade_eye.xml"
ALERT_SOUND_PATH = "alert_sound.mp3"
