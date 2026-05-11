const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status-text');
const eyeStatus = document.getElementById('eye-status');
const alertCount = document.getElementById('alert-count');
const alertOverlay = document.getElementById('alert-overlay');
const consoleLog = document.getElementById('console-log');
const loading = document.getElementById('loading');

let stream = null;
let isRunning = false;
let alertCounter = 0;
let lastAlertTime = 0;
let modelsLoaded = false;

const EYE_CLOSED_FRAMES = 30;
const ALERT_COOLDOWN = 5000;
let closedFrames = 0;

function log(message) {
    const time = new Date().toLocaleTimeString();
    consoleLog.innerHTML = `<div>[${time}] ${message}</div>` + consoleLog.innerHTML;
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

async function loadModels() {
    try {
        log('Loading face-api.js models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/');
        modelsLoaded = true;
        loading.style.display = 'none';
        startBtn.disabled = false;
        statusText.textContent = 'Ready - Click Start';
        log('Models loaded successfully');
    } catch (err) {
        log('Error loading models: ' + err.message);
        statusText.textContent = 'Model loading failed';
    }
}

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 640, height: 480 } 
        });
        video.srcObject = stream;
        await video.play();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        log('Camera started');
        return true;
    } catch (err) {
        log('Camera error: ' + err.message);
        statusText.textContent = 'Camera access denied';
        return false;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getEyeAspectRatio(landmarks, leftEye, rightEye) {
    const getEyeRatio = (eye) => {
        const top = Math.abs(landmarks[eye[1]].y - landmarks[eye[5]].y);
        const bottom = Math.abs(landmarks[eye[0]].x - landmarks[eye[3]].x);
        return bottom > 0 ? top / bottom : 1;
    };
    return (getEyeRatio(leftEye) + getEyeRatio(rightEye)) / 2;
}

async function detectDrowsiness() {
    if (!isRunning || !stream) return;

    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (detection) {
        const landmarks = detection.landmarks.positions;
        
        const leftEye = [36, 37, 38, 39, 40, 41];
        const rightEye = [42, 43, 44, 45, 46, 47];

        let leftEyeOpen = true;
        let rightEyeOpen = true;

        const leftEAR = getEyeAspectRatio(landmarks, leftEye, leftEye);
        const rightEAR = getEyeAspectRatio(landmarks, rightEye, rightEye);
        const avgEAR = (leftEAR + rightEAR) / 2;

        if (avgEAR < 0.25) {
            leftEyeOpen = false;
            rightEyeOpen = false;
            closedFrames++;
        } else {
            closedFrames = 0;
        }

        faceapi.draw.drawFaceLandmarks(canvas, detection);

        if (leftEyeOpen && rightEyeOpen) {
            eyeStatus.textContent = 'Eyes: Open';
            eyeStatus.style.color = '#0f9b0f';
        } else {
            eyeStatus.textContent = 'Eyes: Closed';
            eyeStatus.style.color = '#e94560';
        }

        if (closedFrames >= EYE_CLOSED_FRAMES) {
            triggerAlert();
            closedFrames = 0;
        }
    } else {
        eyeStatus.textContent = 'Eyes: No face';
        eyeStatus.style.color = '#f59e0b';
        closedFrames = 0;
    }

    if (isRunning) {
        setTimeout(detectDrowsiness, 100);
    }
}

function triggerAlert() {
    const now = Date.now();
    if (now - lastAlertTime < ALERT_COOLDOWN) return;

    lastAlertTime = now;
    alertCounter++;
    alertCount.textContent = `Alerts: ${alertCounter}`;
    alertOverlay.classList.remove('hidden');
    log('ALERT: Drowsiness detected!');
    
    try {
        const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
        audio.play();
    } catch (e) {}

    setTimeout(() => {
        alertOverlay.classList.add('hidden');
    }, 3000);
}

async function startDetection() {
    const success = await startCamera();
    if (!success) return;

    isRunning = true;
    closedFrames = 0;
    alertCounter = 0;
    alertCount.textContent = 'Alerts: 0';
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = 'Detection Running';
    alertOverlay.classList.add('hidden');

    log('Detection started');
    detectDrowsiness();
}

function stopDetection() {
    isRunning = false;
    stopCamera();
    
    startBtn.disabled = !modelsLoaded;
    stopBtn.disabled = true;
    statusText.textContent = 'Ready';
    eyeStatus.textContent = 'Eyes: --';
    alertOverlay.classList.add('hidden');

    log('Detection stopped');
}

startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

loadModels();