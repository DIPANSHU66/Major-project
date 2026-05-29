import React, { useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { useHistory } from "../hooks/useSolarData";
import { SensorLineChart, MultiLineChart } from "../components/Charts";

const SENSORS = [
  { key: "temperature", name: "Temperature", unit: "°C", color: "#ef4444" },
  { key: "humidity", name: "Humidity", unit: "%", color: "#3b82f6" },
  { key: "irradiance", name: "Irradiance", unit: "lux", color: "#f59e0b" },
  { key: "voltage", name: "Voltage", unit: "V", color: "#a855f7" },
  { key: "current", name: "Current", unit: "mA", color: "#10b981" },
  { key: "actual_power", name: "Actual Power", unit: "W", color: "#f97316" },
  { key: "dust", name: "Dust Level", unit: "%", color: "#78716c" },
];

export default function LiveMonitor() {
  const { data, loading, refetch, isDemo } = useHistory(200, 30000);
  const [activeTab, setActiveTab] = useState("graphs");
  const [resultsCount, setResultsCount] = useState(100);

  const recent = data.slice(-resultsCount);

  const downloadCSV = () => {
    const headers = ["Date", "Time", "Voltage(V)", "Current(mA)", "Irradiance(lux)", "Temp(°C)", "Humidity(%)", "Power(W)", "Predicted(W)", "Deviation(%)", "Status"];
    const rows = recent.map((r) => [r.date, r.time, r.voltage, r.current, r.irradiance, r.temperature, r.humidity, r.actual_power, r.predicted_power, r.deviation, r.is_anomaly ? "Anomaly" : "Normal"]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solar_data_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {["graphs", "combined", "table"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all"
              style={{
                background: activeTab === tab ? "var(--accent-solar)" : "transparent",
                color: activeTab === tab ? "#0a0e1a" : "var(--text-secondary)",
              }}>
              {tab === "combined" ? "All Sensors" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select value={resultsCount} onChange={(e) => setResultsCount(+e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
          </select>
          <button onClick={refetch} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6" }}>
            <RefreshCw size={13} />
            Refresh
          </button>
          <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
            <Download size={13} />
            CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : activeTab === "graphs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SENSORS.map((s) => (
            <div key={s.key} className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {s.name} ({s.unit}) vs Time
                </h3>
                <span className="text-xs num px-2 py-0.5 rounded" style={{ background: `${s.color}18`, color: s.color }}>
                  {recent[recent.length - 1]?.[s.key]?.toFixed(2)} {s.unit}
                </span>
              </div>
              <SensorLineChart data={recent} dataKey={s.key} name={s.name} color={s.color} unit={s.unit} height={240} />
            </div>
          ))}
        </div>
      ) : activeTab === "combined" ? (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Actual Power vs Predicted (All Models)</h3>
            <MultiLineChart data={recent} lines={[
              { key: "actual_power", name: "Actual (W)", color: "#f59e0b" },
              { key: "rf_pred", name: "Random Forest", color: "#ef4444", dashed: true },
              { key: "ann_pred", name: "ANN", color: "#8b5cf6", dashed: true },
              { key: "xgb_pred", name: "XGBoost", color: "#10b981", dashed: true },
            ]} height={320} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-display font-semibold mb-3 text-sm" style={{ color: "var(--text-primary)" }}>Temperature & Humidity</h3>
              <MultiLineChart data={recent} lines={[
                { key: "temperature", name: "Temp (°C)", color: "#ef4444" },
                { key: "humidity", name: "Humidity (%)", color: "#3b82f6" },
              ]} height={240} />
            </div>
            <div className="card p-4">
              <h3 className="font-display font-semibold mb-3 text-sm" style={{ color: "var(--text-primary)" }}>Voltage & Current</h3>
              <MultiLineChart data={recent} lines={[
                { key: "voltage", name: "Voltage (V)", color: "#a855f7" },
                { key: "current", name: "Current (mA)", color: "#10b981" },
              ]} height={240} />
            </div>
          </div>
        </div>
      ) : (
        // Table view
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Time", "Temp(°C)", "Humidity(%)", "Irradiance(lux)", "Voltage(V)", "Current(mA)", "Power(W)", "Predicted(W)", "Deviation(%)", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium num" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.slice().reverse().map((r, i) => (
                  <tr key={i} style={{
                    borderBottom: "1px solid var(--border)",
                    background: r.is_anomaly ? "rgba(239,68,68,0.05)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"
                  }}>
                    <td className="px-3 py-2 num" style={{ color: "var(--text-muted)" }}>{r.date}</td>
                    <td className="px-3 py-2 num" style={{ color: "var(--text-secondary)" }}>{r.time}</td>
                    <td className="px-3 py-2 num" style={{ color: "#ef4444" }}>{r.temperature?.toFixed(1)}</td>
                    <td className="px-3 py-2 num" style={{ color: "#3b82f6" }}>{r.humidity?.toFixed(1)}</td>
                    <td className="px-3 py-2 num" style={{ color: "#f59e0b" }}>{r.irradiance?.toFixed(0)}</td>
                    <td className="px-3 py-2 num" style={{ color: "#a855f7" }}>{r.voltage?.toFixed(2)}</td>
                    <td className="px-3 py-2 num" style={{ color: "#10b981" }}>{r.current?.toFixed(1)}</td>
                    <td className="px-3 py-2 num font-semibold" style={{ color: "#f97316" }}>{r.actual_power?.toFixed(3)}</td>
                    <td className="px-3 py-2 num" style={{ color: "#06b6d4" }}>{r.predicted_power?.toFixed(3)}</td>
                    <td className="px-3 py-2 num" style={{ color: r.deviation > 20 ? "#ef4444" : "var(--text-secondary)" }}>{r.deviation?.toFixed(2)}%</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.is_anomaly ? "badge-anomaly" : "badge-normal"}`}>
                        {r.is_anomaly ? "⚠ Anomaly" : "✓ Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
            Showing {recent.length} records {isDemo ? "(demo data)" : "from ThingSpeak"}
          </div>
        </div>
      )}
    </div>
  );
}
