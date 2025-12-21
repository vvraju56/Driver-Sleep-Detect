import cv2
import time
from playsound import playsound
import threading
from twilio.rest import Client
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import config

# Twilio credentials
client = Client(config.ACCOUNT_SID, config.AUTH_TOKEN)

# Load Haar cascades for face and eye detection
face_cascade = cv2.CascadeClassifier(config.FACE_CASCADE_PATH)
eye_cascade = cv2.CascadeClassifier(config.EYE_CASCADE_PATH)

# Initialize variables
closed_eyes_frames = 0
frame_threshold = 20
alert_played = False
eye_closed_threshold = 0.5

# Function to play alert sound asynchronously
def play_alert():
    playsound(config.ALERT_SOUND_PATH)

# Function to send SMS via Twilio
def send_sms():
    message = client.messages.create(
        body="ALERT: Driver appears to be drowsy!",
        from_=config.TWILIO_NUMBER,
        to=config.TO_NUMBER
    )
    print(f"SMS SID: {message.sid}")

# Function to send an email via SMTP
def send_email():
    try:
        msg = MIMEMultipart()
        msg['From'] = config.EMAIL_USER
        msg['To'] = config.TO_EMAIL
        msg['Subject'] = 'Driver Drowsiness Alert'

        body = 'ALERT: Driver appears to be drowsy. Immediate attention required!'
        msg.attach(MIMEText(body, 'plain'))

        # Establish connection to the server
        server = smtplib.SMTP(config.SMTP_SERVER, config.SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(config.EMAIL_USER, config.EMAIL_PASSWORD)  # Login to the email account
        text = msg.as_string()
        server.sendmail(config.EMAIL_USER, config.TO_EMAIL, text)  # Send email
        server.quit()  # Close the connection

        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

# Function that will be called when the alert is triggered
def alert_callback():
    print("ALERT ACTIVATED: Driver seems to be drowsy!")

    # Make a phone call using Twilio API
    call = client.calls.create(
        twiml='<Response><Say>SOS. Driver appears to be drowsy.</Say></Response>',
        to=config.TO_NUMBER,
        from_=config.TWILIO_NUMBER
    )
    print(f"Call SID: {call.sid}")  # Log the Call SID

    # Send SMS
    send_sms()

    # Send email
    send_email()

# Start video capture (usually camera 0)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture video")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detect faces in the image
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    print(f"Detected faces: {len(faces)}")

    eyes_closed_count = 0  # Count frames where eyes are closed
    
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
        roi_gray = gray[y:y + h, x:x + w]
        roi_color = frame[y:y + h, x:x + w]

        # Detect eyes within the region of the face
        eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 3)
        print(f"Detected eyes: {len(eyes)}")

        if len(eyes) >= 2:
            closed_eyes_frames = 0
            alert_played = False
        else:
            eyes_closed_count += 1
            closed_eyes_frames += 1

        for (ex, ey, ew, eh) in eyes:
            cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2)

    if eyes_closed_count > 0:
        closed_percentage = eyes_closed_count / len(faces)

        if closed_percentage >= eye_closed_threshold:
            if not alert_played:
                print("Driver is sleeping! Alert!")
                threading.Thread(target=play_alert, daemon=True).start()
                alert_played = True
                alert_callback()  # Call the alert callback when alert is triggered

    cv2.imshow('Driver Drowsiness Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the video capture and close windows
cap.release()
cv2.destroyAllWindows()
