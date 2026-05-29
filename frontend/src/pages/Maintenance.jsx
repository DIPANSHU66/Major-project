import React from "react";
import { Wrench, CheckCircle, AlertTriangle, Clock, Zap, Sun, Wind } from "lucide-react";
import { useHistory, useLiveStatus } from "../hooks/useSolarData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PANELS = ["Panel A1", "Panel A2", "Panel B1", "Panel B2", "Panel C1", "Panel C2", "Panel D1", "Panel D2"];

export default function Maintenance() {
  const { data: history } = useHistory(200);
  const { data: status } = useLiveStatus(10000);

  // Compute panel health scores
  const anomalyRate = history.length > 0 ? history.filter((d) => d.is_anomaly).length / history.length : 0;
  const avgDeviation = history.length > 0 ? history.reduce((a, b) => a + (b.deviation || 0), 0) / history.length : 0;

  const panelHealth = PANELS.map((name, i) => {
    const baseHealth = 95 - i * 2 - anomalyRate * 20 - avgDeviation * 0.3;
    const health = Math.max(50, Math.min(99, baseHealth + (Math.random() * 6 - 3)));
    return {
      name,
      health: +health.toFixed(0),
      status: health > 85 ? "Good" : health > 70 ? "Fair" : "Poor",
      color: health > 85 ? "#10b981" : health > 70 ? "#f59e0b" : "#ef4444",
      lastCleaned: `${Math.floor(i * 3 + 5)} days ago`,
      nextService: `${Math.floor(30 - i * 2)} days`,
    };
  });

  const recommendations = [
    {
      icon: Sun,
      color: "#f59e0b",
      title: "Clean panels if dust > 50%",
      desc: `Current dust level: ${status?.dust?.toFixed(0) || "N/A"}%. Cleaning recommended when above 50%.`,
      priority: (status?.dust || 0) > 50 ? "High" : "Low",
    },
    {
      icon: Zap,
      color: "#3b82f6",
      title: "Check wiring for voltage drops",
      desc: `Voltage reading: ${status?.voltage?.toFixed(2) || "N/A"}V. Inspect connections if voltage drops below 10V.`,
      priority: (status?.voltage || 20) < 10 ? "High" : "Normal",
    },
    {
      icon: Wind,
      color: "#8b5cf6",
      title: "Inspect panels for physical damage",
      desc: "Regular visual inspection recommended every 30 days. Check for cracks, bird damage, or debris.",
      priority: "Scheduled",
    },
    {
      icon: AlertTriangle,
      color: "#ef4444",
      title: "High anomaly rate detected",
      desc: `${(anomalyRate * 100).toFixed(1)}% of readings are anomalies. Investigate power output consistency.`,
      priority: anomalyRate > 0.1 ? "Urgent" : "Normal",
    },
  ];

  const priorityColor = { Urgent: "#ef4444", High: "#f97316", Normal: "#10b981", Low: "#3b82f6", Scheduled: "#8b5cf6" };

  // Maintenance timeline
  const timeline = [
    { date: "Today", event: "Real-time monitoring active", type: "ongoing" },
    { date: "Last week", event: "ML models retrained", type: "done" },
    { date: "15 days ago", event: "Panel cleaning completed", type: "done" },
    { date: "30 days ago", event: "Wiring inspection", type: "done" },
    { date: "Due in 15 days", event: "Scheduled panel cleaning", type: "upcoming" },
    { date: "Due in 30 days", event: "Full system inspection", type: "upcoming" },
  ];

  return (
    <div className="space-y-5">
      {/* Panel health */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Panel Health Scores</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={panelHealth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="name" tick={{ fill: "#4a6080", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#4a6080", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} formatter={(v) => [`${v}%`, "Health"]} />
            <Bar dataKey="health" radius={[4, 4, 0, 0]}>
              {panelHealth.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Panel cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {panelHealth.map((p) => (
          <div key={p.name} className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium`}
                style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>
                {p.status}
              </span>
            </div>
            <div className="text-2xl font-bold num mb-1" style={{ color: p.color }}>{p.health}%</div>
            <div className="h-1.5 rounded-full mb-2" style={{ background: "var(--border)" }}>
              <div className="h-1.5 rounded-full" style={{ width: `${p.health}%`, background: p.color }} />
            </div>
            <div className="text-xs space-y-0.5" style={{ color: "var(--text-muted)" }}>
              <div>Cleaned: {p.lastCleaned}</div>
              <div>Next: {p.nextService}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>AI Maintenance Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((r, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${r.color}18`, border: `1px solid ${r.color}30` }}>
                <r.icon size={15} style={{ color: r.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{r.title}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${priorityColor[r.priority]}15`, color: priorityColor[r.priority] }}>
                    {r.priority}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Maintenance Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: "var(--border)" }} />
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-4 items-start pl-10 relative">
                <div className={`absolute left-3 w-2.5 h-2.5 rounded-full border-2 mt-1 flex-shrink-0`}
                  style={{
                    background: t.type === "done" ? "#10b981" : t.type === "ongoing" ? "#f59e0b" : "var(--bg-card)",
                    borderColor: t.type === "done" ? "#10b981" : t.type === "ongoing" ? "#f59e0b" : "#3b82f6",
                  }} />
                <div>
                  <div className="text-xs font-medium num" style={{ color: t.type === "upcoming" ? "#3b82f6" : "var(--text-muted)" }}>{t.date}</div>
                  <div className="text-sm mt-0.5" style={{ color: "var(--text-primary)" }}>{t.event}</div>
                </div>
                {t.type === "upcoming" && (
                  <Clock size={13} style={{ color: "#3b82f6", marginLeft: "auto", flexShrink: 0, marginTop: 2 }} />
                )}
                {t.type === "done" && (
                  <CheckCircle size={13} style={{ color: "#10b981", marginLeft: "auto", flexShrink: 0, marginTop: 2 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
