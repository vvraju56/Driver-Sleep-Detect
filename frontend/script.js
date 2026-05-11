const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status-text');
const alertCount = document.getElementById('alert-count');
const alertOverlay = document.getElementById('alert-overlay');
const consoleLog = document.getElementById('console-log');

let isRunning = false;
let alertCounter = 0;
let lastAlertTime = 0;
let pollInterval = null;

function log(message) {
    const time = new Date().toLocaleTimeString();
    consoleLog.innerHTML = `<div>[${time}] ${message}</div>` + consoleLog.innerHTML;
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

async function checkStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        if (data.running && !isRunning) {
            isRunning = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusText.textContent = 'Status: Detection Running';
            log('Detection started from backend');
        } else if (!data.running && isRunning) {
            isRunning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusText.textContent = 'Status: Stopped';
            log('Detection stopped from backend');
        }
    } catch (err) {
        log('Error checking status: ' + err.message);
    }
}

async function startDetection() {
    try {
        const res = await fetch('/api/start-detection', { method: 'POST' });
        const data = await res.json();
        
        if (data.status === 'started') {
            isRunning = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusText.textContent = 'Status: Detection Running';
            alertCount.textContent = 'Alerts: 0';
            log('Detection started successfully');
            log('Running detection on server...');
            log('Note: Camera must be connected to server');
        } else if (data.status === 'already_running') {
            log('Detection already running');
        } else {
            log('Error: ' + data.message);
        }
    } catch (err) {
        log('Error starting detection: ' + err.message);
    }
}

async function stopDetection() {
    try {
        const res = await fetch('/api/stop-detection', { method: 'POST' });
        const data = await res.json();
        
        if (data.status === 'stopped') {
            isRunning = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusText.textContent = 'Status: Stopped';
            alertOverlay.classList.add('hidden');
            log('Detection stopped');
        } else {
            log('Error: ' + data.message);
        }
    } catch (err) {
        log('Error stopping detection: ' + err.message);
    }
}

function triggerAlert() {
    const now = Date.now();
    if (now - lastAlertTime < 5000) return;
    
    lastAlertTime = now;
    alertCounter++;
    alertCount.textContent = `Alerts: ${alertCounter}`;
    alertOverlay.classList.remove('hidden');
    log('ALERT: Drowsiness detected!');
    log('SMS/Email sent to emergency contacts');
    
    setTimeout(() => {
        alertOverlay.classList.add('hidden');
    }, 3000);
}

startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

checkStatus();
setInterval(checkStatus, 2000);

log('System ready');
log('Click "Start Detection" to begin');
log('Backend: Python/OpenCV detection running on server');