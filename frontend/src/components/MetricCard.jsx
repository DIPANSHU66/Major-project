import React from "react";

export default function MetricCard({ icon: Icon, label, value, unit, color, sub, trend }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
            <Icon size={15} style={{ color }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
        </div>
        {trend !== undefined && (
          <span className="text-xs num px-1.5 py-0.5 rounded"
            style={{
              background: trend >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
              color: trend >= 0 ? "#10b981" : "#ef4444"
            }}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold num" style={{ color: "var(--text-primary)" }}>{value ?? "--"}</span>
        {unit && <span className="text-sm mb-0.5" style={{ color: "var(--text-secondary)" }}>{unit}</span>}
      </div>
      {sub && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}
