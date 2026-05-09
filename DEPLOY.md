# DrivDect - Deployment Guide

## Deploy Backend on Render

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign in
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and deploy

### Option 2: Manual Deploy

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
5. Add Environment Variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_NUMBER`
   - `TO_NUMBER`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `TO_EMAIL`

---

## Deploy Frontend on Vercel

### Option 1: Using Vercel CLI

```bash
npm i -g vercel
cd vercel_frontend
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import project → Select your repo
3. Framework Preset: "Other"
4. Root Directory: `./vercel_frontend`
5. Build Command: Leave empty
6. Deploy

---

## Update Frontend API URL

After deploying backend, update the API base URL:
- Edit `vercel_frontend/index.html`
- Replace `window.API_BASE_URL` with your Render backend URL (e.g., `https://drivdect-api.onrender.com`)

Or set it via Vercel Environment Variables:
- Key: `REACT_APP_API_BASE_URL`
- Value: Your Render backend URL

---

## Important Notes

1. **Webcam Access**: The detection requires webcam which only works locally. For cloud deployment, you need a client-side WebRTC solution.

2. **Twilio Credentials**: Never commit real credentials. Use environment variables on Render.

3. **Free Tier**: Render's free tier sleeps after 15 min of inactivity. Consider upgrading for production.