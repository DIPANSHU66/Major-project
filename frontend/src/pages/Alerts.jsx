import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle, Bell, BellOff, TrendingDown, Thermometer, Droplets } from "lucide-react";
import { useHistory, useLiveStatus } from "../hooks/useSolarData";
import { DeviationChart } from "../components/Charts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Alerts() {
  const { data: history } = useHistory(200);
  const { data: status } = useLiveStatus(10000);

  const anomalies = useMemo(() => history.filter((d) => d.is_anomaly).reverse(), [history]);

  // Count by type
  const highDeviation = history.filter((d) => d.deviation > 20).length;
  const highTemp = history.filter((d) => d.temperature > 70).length;
  const lowPower = history.filter((d) => d.actual_power < 0.1 && d.irradiance > 5000).length;
  const highHumidity = history.filter((d) => d.humidity > 90).length;

  // Anomaly frequency by hour
  const anomalyByHour = Array(24).fill(0).map((_, h) => {
    const count = history.filter((d) => {
      const hour = d.time ? parseInt(d.time.split(":")[0]) : -1;
      return hour === h && d.is_anomaly;
    }).length;
    return { hour: `${h}h`, count };
  }).filter((h) => h.count > 0);

  const alertTypes = [
    { icon: TrendingDown, label: "High Power Deviation (>20%)", count: highDeviation, color: "#ef4444", severity: "Critical" },
    { icon: Thermometer, label: "High Temperature (>70°C)", count: highTemp, color: "#f97316", severity: "Warning" },
    { icon: TrendingDown, label: "Low Power (irr >5k lux)", count: lowPower, color: "#f59e0b", severity: "Warning" },
    { icon: Droplets, label: "High Humidity (>90%)", count: highHumidity, color: "#3b82f6", severity: "Info" },
  ];

  return (
    <div className="space-y-5">
      {/* Current status */}
      {status && (
        <div className="px-5 py-4 rounded-xl flex items-center gap-4"
          style={{
            background: status.is_anomaly ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${status.is_anomaly ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.3)"}`,
          }}>
          {status.is_anomaly ? <AlertTriangle size={24} color="#ef4444" /> : <CheckCircle size={24} color="#10b981" />}
          <div>
            <div className="font-semibold font-display">{status.status}</div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Deviation: <span className="num font-bold" style={{ color: status.deviation > 20 ? "#ef4444" : "#10b981" }}>{status.deviation}%</span>
              {" · "}Threshold: 20%
            </div>
          </div>
          {status.is_anomaly && (
            <div className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium badge-anomaly">🔔 Alert Active</div>
          )}
        </div>
      )}

      {/* Alert summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {alertTypes.map((a) => (
          <div key={a.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <a.icon size={15} style={{ color: a.color }} />
              <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ background: `${a.color}15`, color: a.color }}>{a.severity}</span>
            </div>
            <div className="text-2xl font-bold num" style={{ color: "var(--text-primary)" }}>{a.count}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{a.label}</div>
          </div>
        ))}
      </div>

      {/* Deviation chart */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Anomaly Detection — Deviation Chart</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Red reference line = 20% threshold. Bars above = anomalies detected</p>
        <DeviationChart data={history.slice(-80)} height={260} />
      </div>

      {/* Anomaly frequency */}
      {anomalyByHour.length > 0 && (
        <div className="card p-4">
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Anomaly Frequency by Hour</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={anomalyByHour} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="hour" tick={{ fill: "#4a6080", fontSize: 10 }} />
              <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} formatter={(v) => [v, "Anomalies"]} />
              <Bar dataKey="count" name="Anomalies" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Alert log */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
            Alert Log <span className="text-sm font-normal num" style={{ color: "var(--text-muted)" }}>({anomalies.length} anomalies)</span>
          </h3>
          {anomalies.length === 0 && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#10b981" }}>
              <BellOff size={14} />
              All clear
            </div>
          )}
        </div>
        {anomalies.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle size={40} style={{ color: "#10b981", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)" }}>No anomalies detected in current data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                  {["Timestamp", "Temp(°C)", "Irradiance", "Voltage(V)", "Current(mA)", "Actual(W)", "Predicted(W)", "Deviation", "Severity"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anomalies.slice(0, 50).map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: "rgba(239,68,68,0.04)" }}>
                    <td className="px-3 py-2 num" style={{ color: "var(--text-muted)" }}>{r.date} {r.time}</td>
                    <td className="px-3 py-2 num" style={{ color: "#ef4444" }}>{r.temperature?.toFixed(1)}</td>
                    <td className="px-3 py-2 num" style={{ color: "#f59e0b" }}>{r.irradiance?.toFixed(0)}</td>
                    <td className="px-3 py-2 num">{r.voltage?.toFixed(2)}</td>
                    <td className="px-3 py-2 num">{r.current?.toFixed(1)}</td>
                    <td className="px-3 py-2 num font-semibold" style={{ color: "#f97316" }}>{r.actual_power?.toFixed(3)}</td>
                    <td className="px-3 py-2 num">{r.predicted_power?.toFixed(3)}</td>
                    <td className="px-3 py-2 num font-bold" style={{ color: "#ef4444" }}>{r.deviation?.toFixed(1)}%</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${r.deviation > 40 ? "badge-anomaly" : "badge-warning"}`}>
                        {r.deviation > 40 ? "Critical" : "Warning"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {anomalies.length > 50 && (
              <div className="px-4 py-2 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
                Showing 50 of {anomalies.length} anomalies
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
