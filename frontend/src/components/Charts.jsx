import React from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

const THEME = {
  grid: "#1e2d4a",
  text: "#4a6080",
  tooltip: { background: "#0f1629", border: "#1e2d4a", color: "#e8f0fe" },
};

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: THEME.tooltip.background, border: `1px solid ${THEME.tooltip.border}`, color: THEME.tooltip.color }}>
      <div className="font-mono mb-1 opacity-60">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}: <strong>{formatter ? formatter(p.value, p.name) : p.value}</strong></span>
        </div>
      ))}
    </div>
  );
}

export function SensorLineChart({ data, dataKey, name, color, unit, height = 280 }) {
  const N = data.length;
  const interval = N > 0 ? Math.max(Math.floor(N / 12), 1) : 1;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
        <XAxis dataKey="time" interval={interval} angle={-40} textAnchor="end" tick={{ fill: THEME.text, fontSize: 10, fontFamily: "JetBrains Mono" }} height={55} />
        <YAxis tick={{ fill: THEME.text, fontSize: 10, fontFamily: "JetBrains Mono" }} width={50} tickFormatter={(v) => `${v}${unit || ""}`} />
        <Tooltip content={<CustomTooltip formatter={(v) => `${v} ${unit || ""}`} />} />
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2} dot={false} connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLineChart({ data, lines, height = 300 }) {
  const N = data.length;
  const interval = N > 0 ? Math.max(Math.floor(N / 12), 1) : 1;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
        <XAxis dataKey="time" interval={interval} angle={-40} textAnchor="end" tick={{ fill: THEME.text, fontSize: 10, fontFamily: "JetBrains Mono" }} height={55} />
        <YAxis tick={{ fill: THEME.text, fontSize: 10, fontFamily: "JetBrains Mono" }} width={50} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: "#8ba3c7", fontSize: 12 }} />
        {lines.map(({ key, name, color, dashed }) => (
          <Line key={key} type="monotone" dataKey={key} name={name} stroke={color}
            strokeWidth={2} strokeDasharray={dashed ? "4 2" : undefined} dot={false} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DeviationChart({ data, height = 300 }) {
  const N = data.length;
  const interval = N > 0 ? Math.max(Math.floor(N / 12), 1) : 1;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
        <XAxis dataKey="time" interval={interval} angle={-40} textAnchor="end" tick={{ fill: THEME.text, fontSize: 10, fontFamily: "JetBrains Mono" }} height={55} />
        <YAxis tick={{ fill: THEME.text, fontSize: 10 }} tickFormatter={(v) => `${v}%`} width={45} />
        <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
        <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Anomaly", fill: "#ef4444", fontSize: 10 }} />
        <Bar dataKey="deviation" name="Deviation %" fill="#f59e0b" radius={[2, 2, 0, 0]}
          style={{ cursor: "pointer" }}
          label={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ScatterPlot({ data, xKey, yKey, xLabel, yLabel, color = "#3b82f6", height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
        <XAxis dataKey={xKey} name={xLabel} tick={{ fill: THEME.text, fontSize: 10 }} label={{ value: xLabel, fill: THEME.text, fontSize: 11, position: "insideBottomRight", offset: -5 }} />
        <YAxis dataKey={yKey} name={yLabel} tick={{ fill: THEME.text, fontSize: 10 }} label={{ value: yLabel, fill: THEME.text, fontSize: 11, angle: -90, position: "insideLeft" }} />
        <Tooltip cursor={{ stroke: color, strokeWidth: 1 }} content={<CustomTooltip />} />
        <Scatter data={data} fill={color} opacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
