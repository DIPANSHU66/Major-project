import React from "react";
import { Thermometer, Droplets, Sun, Zap, Activity, Wind, BarChart2, AlertTriangle } from "lucide-react";
import { useLiveStatus, useHistory } from "../hooks/useSolarData";
import MetricCard from "../components/MetricCard";
import { SensorLineChart, MultiLineChart } from "../components/Charts";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";

export default function Dashboard() {
  const { data: status, loading, isDemo } = useLiveStatus(10000);
  const { data: history } = useHistory(100);

  const metrics = status ? [
    { icon: Thermometer, label: "Temperature", value: status.temperature?.toFixed(1), unit: "°C", color: "#ef4444", sub: "Panel surface" },
    { icon: Droplets, label: "Humidity", value: status.humidity?.toFixed(1), unit: "%", color: "#3b82f6", sub: "Relative humidity" },
    { icon: Sun, label: "Irradiance", value: status.irradiance?.toFixed(0), unit: "lux", color: "#f59e0b", sub: "Solar intensity" },
    { icon: Zap, label: "Voltage", value: status.voltage?.toFixed(2), unit: "V", color: "#a855f7", sub: "Output voltage" },
    { icon: Activity, label: "Current", value: status.current?.toFixed(1), unit: "mA", color: "#10b981", sub: "Output current" },
    { icon: BarChart2, label: "Actual Power", value: status.actual_power?.toFixed(3), unit: "W", color: "#f97316", sub: "Measured" },
    { icon: BarChart2, label: "Predicted Power", value: status.predictions?.ensemble?.toFixed(3), unit: "W", color: "#06b6d4", sub: "Ensemble ML" },
    { icon: Wind, label: "Dust Level", value: status.dust?.toFixed(1), unit: "%", color: "#78716c", sub: "Panel surface" },
  ] : [];

  // Radar chart for model accuracy
  const radarData = [
    { subject: "Accuracy", RF: 94, ANN: 93, XGB: 95 },
    { subject: "Speed", RF: 80, ANN: 75, XGB: 90 },
    { subject: "Stability", RF: 92, ANN: 88, XGB: 91 },
    { subject: "Low Data", RF: 85, ANN: 70, XGB: 87 },
    { subject: "Generalize", RF: 88, ANN: 92, XGB: 86 },
  ];

  // Status pie
  const anomalyCount = history.filter((d) => d.is_anomaly).length;
  const normalCount = history.length - anomalyCount;
  const pieData = [
    { name: "Normal", value: normalCount, color: "#10b981" },
    { name: "Anomaly", value: anomalyCount, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
          <AlertTriangle size={15} />
          Demo mode — configure ThingSpeak credentials in Settings to use live data
        </div>
      )}

      {/* Status banner */}
      {status && (
        <div className="px-5 py-4 rounded-xl flex items-center justify-between"
          style={{
            background: status.is_anomaly ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${status.is_anomaly ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.25)"}`,
          }}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.is_anomaly ? "bg-red-500" : "bg-green-400 pulse-dot"}`} />
            <div>
              <div className="font-semibold">{status.status}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Last reading: {status.created_at ? new Date(status.created_at).toLocaleString("en-IN") : "—"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm num" style={{ color: "var(--text-secondary)" }}>Deviation</div>
            <div className="text-xl font-bold num" style={{ color: status.deviation > 20 ? "#ef4444" : "#10b981" }}>
              {status.deviation}%
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading
          ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton h-28" />)
          : metrics.map((m) => <MetricCard key={m.label} {...m} />)
        }
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Power Output Over Time</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Actual vs Predicted (Ensemble)</p>
          <MultiLineChart data={history.slice(-60)} lines={[
            { key: "actual_power", name: "Actual (W)", color: "#f59e0b" },
            { key: "predicted_power", name: "Predicted (W)", color: "#3b82f6", dashed: true },
          ]} height={260} />
        </div>

        <div className="card p-4">
          <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Irradiance vs Time</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Solar intensity (lux) over last 60 readings</p>
          <SensorLineChart data={history.slice(-60)} dataKey="irradiance" name="Irradiance" color="#f59e0b" unit="lux" height={260} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>ML Model Comparison</h3>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2d4a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#4a6080", fontSize: 11 }} />
              <Radar name="Random Forest" dataKey="RF" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} />
              <Radar name="ANN" dataKey="ANN" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.12} />
              <Radar name="XGBoost" dataKey="XGB" stroke="#10b981" fill="#10b981" fillOpacity={0.12} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8ba3c7" }} />
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#8ba3c7" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center text-sm num mt-1" style={{ color: "var(--text-muted)" }}>
            {history.length} readings analyzed
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Predictions vs Actual</h3>
          <div className="space-y-3">
            {status?.predictions && Object.entries({
              "Random Forest": { val: status.predictions.random_forest, color: "#f59e0b" },
              "ANN": { val: status.predictions.ann, color: "#8b5cf6" },
              "XGBoost": { val: status.predictions.xgboost, color: "#10b981" },
              "Ensemble": { val: status.predictions.ensemble, color: "#3b82f6" },
            }).map(([name, { val, color }]) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                  <span className="num" style={{ color }}>{val} W</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((val / (status.predictions.ensemble * 1.5)) * 100, 100)}%`, background: color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Actual Power</span>
                <span className="num font-bold" style={{ color: "#f59e0b" }}>{status?.actual_power?.toFixed(3)} W</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
