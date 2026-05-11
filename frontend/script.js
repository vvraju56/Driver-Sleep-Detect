const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status-text');
const alertCount = document.getElementById('alert-count');
const alertOverlay = document.getElementById('alert-overlay');
const consoleLog = document.getElementById('console-log');

let stream = null;
let isRunning = false;
let alertCounter = 0;
let lastAlertTime = 0;
let faceDetectionInterval = null;

function log(message) {
    const time = new Date().toLocaleTimeString();
    consoleLog.innerHTML = `<div>[${time}] ${message}</div>` + consoleLog.innerHTML;
    consoleLog.scrollTop = consoleLog.scrollHeight;
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
        statusText.textContent = 'Camera: Active';
        log('Camera initialized successfully');
        return true;
    } catch (err) {
        log('Error accessing camera: ' + err.message);
        statusText.textContent = 'Camera: Error';
        return false;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    statusText.textContent = 'Camera: Inactive';
    log('Camera stopped');
}

function detectFace() {
    if (!isRunning) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const faceCascade = new window.faceDetection.MicroFeaturesFaceDetector();
    
    try {
        const faces = faceCascade.detect(canvas);
        
        if (faces && faces.length > 0) {
            for (const face of faces) {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.strokeRect(face.x, face.y, face.width, face.height);
                log(`Face detected at (${Math.round(face.x)}, ${Math.round(face.y)})`);
            }
        }
    } catch (e) {
        // Simple fallback - just show video
    }
    
    requestAnimationFrame(detectFace);
}

// Simple skin color-based detection as fallback
function simpleDetection() {
    if (!isRunning || !stream) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let skinPixels = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        if ((r > 95 && g > 40 && b > 20) &&
            (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
            (Math.abs(r - g) > 15) &&
            (r > g) && (r > b)) {
            skinPixels++;
        }
    }
    
    const skinRatio = skinPixels / totalPixels;
    
    if (skinRatio > 0.15) {
        log(`Face detected - skin ratio: ${(skinRatio * 100).toFixed(1)}%`);
    }
    
    requestAnimationFrame(simpleDetection);
}

async function startDetection() {
    const success = await startCamera();
    if (!success) return;
    
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    alertCounter = 0;
    alertCount.textContent = 'Alerts: 0';
    alertOverlay.classList.add('hidden');
    
    log('Detection started');
    
    simpleDetection();
}

function stopDetection() {
    isRunning = false;
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    
    stopCamera();
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    alertOverlay.classList.add('hidden');
    
    log('Detection stopped');
}

function triggerAlert() {
    const now = Date.now();
    if (now - lastAlertTime < 5000) return;
    
    lastAlertTime = now;
    alertCounter++;
    alertCount.textContent = `Alerts: ${alertCounter}`;
    alertOverlay.classList.remove('hidden');
    log('ALERT: Drowsiness detected!');
    
    setTimeout(() => {
        alertOverlay.classList.add('hidden');
    }, 3000);
}

startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

log('System ready');