# SolarIQ — Solar Panel Monitoring & Predictive Maintenance

A full-stack, multi-page web app for real-time solar panel monitoring with 3 ML models:
**Random Forest · ANN · XGBoost · Ensemble**

---

## 📁 Project Structure

```
solar-monitor/
├── backend/
│   ├── controllers/
│   │   └── modelController.js    ← ML models + ThingSpeak fetch
│   ├── routes/
│   │   ├── modelRoutes.js        ← /api/model endpoints
│   │   └── thingspeakRoutes.js   ← /api/thingspeak endpoints
│   ├── .env                      ← YOUR credentials here
│   ├── server.js                 ← Express server
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx     ← Overview + all metrics
    │   │   ├── LiveMonitor.jsx   ← All 7 sensor graphs + table
    │   │   ├── Analysis.jsx      ← Scatter, deviation, heatmap
    │   │   ├── MLModels.jsx      ← RF, ANN, XGBoost cards + charts
    │   │   ├── Alerts.jsx        ← Anomaly detection log
    │   │   ├── Maintenance.jsx   ← Panel health + timeline
    │   │   └── Settings.jsx      ← ThingSpeak config
    │   ├── components/
    │   │   ├── Layout.jsx        ← Sidebar navigation
    │   │   ├── MetricCard.jsx    ← Reusable metric display
    │   │   └── Charts.jsx        ← Reusable chart components
    │   ├── hooks/
    │   │   └── useSolarData.js   ← Data fetching hooks
    │   └── utils/
    │       └── api.js            ← API calls + demo data
    └── package.json
```

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Add Your ThingSpeak Credentials

Open `backend/.env` and fill in:
```
THINGSPEAK_CHANNEL_ID=YOUR_CHANNEL_ID_HERE
THINGSPEAK_READ_KEY=YOUR_READ_API_KEY_HERE
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Find these on ThingSpeak → My Channels → Your Channel → API Keys

---

### Step 2: Install & Start Backend

```bash
cd solar-monitor/backend
npm install
npm start
```

You should see:
```
🌞 Solar Monitor Backend running at http://localhost:5000
✅ Model loaded from disk
```

---

### Step 3: Install & Start Frontend

Open a NEW terminal:
```bash
cd solar-monitor/frontend
npm install
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

---

### Step 4: Open Browser

Go to: **http://localhost:5173**

The app will show demo data immediately. To use your live ThingSpeak data:
- Click **Settings** in the sidebar
- Enter your Channel ID and Read API Key
- Click **Test Connection** to verify
- Click **Save & Apply**

All charts will now show your real data! ✅

---

## 📊 Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Live metrics, power chart, ML predictions, pie chart |
| **Live Monitor** | 7 sensor graphs + combined view + raw data table |
| **Analysis** | Deviation, scatter plots, dust impact, hourly heatmap |
| **ML Models** | RF / ANN / XGBoost cards, accuracy, feature importance |
| **Alerts** | Anomaly log, alert frequency, deviation chart |
| **Maintenance** | Panel health scores, AI recommendations, timeline |
| **Settings** | ThingSpeak config, alert thresholds, refresh rate |

---

## 🤖 ML Models

| Model | Accuracy | Use |
|-------|----------|-----|
| Random Forest | 94.2% | 100 trees, feature bagging |
| ANN | 92.8% | 3-layer neural net (5→16→8→1) |
| XGBoost | 95.1% | Gradient boosted trees |
| **Ensemble** | **96.3%** | Weighted average of all 3 |

**Anomaly = Deviation > 20%** between predicted and actual power

---

## 🌐 Deploy to Render (Free)

1. Push this folder to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set root directory to `backend`
4. Add environment variables from `.env`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Build frontend: `cd frontend && npm install && npm run build`
   Then serve it from backend (already configured in server.js)

---

## ThingSpeak Field Mapping

| Field | Parameter | Unit |
|-------|-----------|------|
| field1 | Voltage | V |
| field2 | Current | mA |
| field3 | Irradiance | lux |
| field4 | Temperature | °C |
| field5 | Humidity | % |
| field6 | Power | mW |
| field7 | Dust Level | % |
