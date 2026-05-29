import axios from "axios";

const BASE = "/api";

export const api = {
  getStatus: () => axios.get(`${BASE}/model/status`),
  getHistory: (results = 200) => axios.get(`${BASE}/model/history?results=${results}`),
  getModelStats: () => axios.get(`${BASE}/model/stats`),
  getLive: () => axios.get(`${BASE}/thingspeak/live`),
  getFeeds: (results = 200) => axios.get(`${BASE}/thingspeak/feeds?results=${results}`),
};

// Demo data generator for when backend isn't running
export function generateDemoData(count = 100) {
  const data = [];
  const now = new Date();
  for (let i = count; i >= 0; i--) {
    const t = new Date(now - i * 5 * 60 * 1000);
    const hour = t.getHours();
    const solar = Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 25000 + (Math.random() - 0.5) * 3000);
    const temp = 25 + solar * 0.0005 + (Math.random() - 0.5) * 5;
    const voltage = 12 + Math.random() * 6;
    const current = solar > 0 ? (solar / 1000) * 0.5 + Math.random() * 200 : Math.random() * 50;
    const power = (voltage * current) / 1000;
    const anomaly = Math.random() < 0.05;

    data.push({
      created_at: t.toISOString(),
      date: t.toISOString().split("T")[0],
      time: t.toTimeString().split(" ")[0],
      voltage: +voltage.toFixed(2),
      current: +current.toFixed(2),
      irradiance: +solar.toFixed(2),
      temperature: +temp.toFixed(2),
      humidity: +(50 + (Math.random() - 0.5) * 40).toFixed(2),
      actual_power: anomaly ? +(power * 0.5).toFixed(3) : +power.toFixed(3),
      predicted_power: +power.toFixed(3),
      rf_pred: +(power * (1 + (Math.random() - 0.5) * 0.1)).toFixed(3),
      ann_pred: +(power * (1 + (Math.random() - 0.5) * 0.08)).toFixed(3),
      xgb_pred: +(power * (1 + (Math.random() - 0.5) * 0.06)).toFixed(3),
      dust: +(Math.random() * 100).toFixed(1),
      deviation: anomaly ? +(40 + Math.random() * 30).toFixed(2) : +(Math.random() * 15).toFixed(2),
      is_anomaly: anomaly,
    });
  }
  return data;
}

export function generateDemoStatus() {
  const hour = new Date().getHours();
  const solar = Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 25000);
  const voltage = +(12 + Math.random() * 6).toFixed(2);
  const current = +(solar > 0 ? solar / 2000 + Math.random() * 200 : Math.random() * 50).toFixed(2);
  const power = +((voltage * current) / 1000).toFixed(3);

  return {
    voltage,
    current,
    irradiance: +solar.toFixed(2),
    temperature: +(30 + Math.random() * 15).toFixed(2),
    humidity: +(55 + Math.random() * 30).toFixed(2),
    actual_power: power,
    dust: +(Math.random() * 80).toFixed(1),
    predictions: {
      random_forest: +(power * 1.02).toFixed(3),
      ann: +(power * 0.98).toFixed(3),
      xgboost: +(power * 1.01).toFixed(3),
      ensemble: +(power * 1.005).toFixed(3),
    },
    deviation: +(Math.random() * 12).toFixed(2),
    status: "✅ Normal",
    is_anomaly: false,
    created_at: new Date().toISOString(),
  };
}
