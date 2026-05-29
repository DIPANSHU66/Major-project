import React from "react";
import { useHistory } from "../hooks/useSolarData";
import { SensorLineChart, DeviationChart, ScatterPlot, MultiLineChart } from "../components/Charts";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Area
} from "recharts";

export default function Analysis() {
  const { data, loading } = useHistory(200);

  // Group by hour for energy heatmap
  const hourlyEnergy = Array(24).fill(0).map((_, h) => {
    const hour_data = data.filter((d) => d.time && parseInt(d.time.split(":")[0]) === h);
    const avg_power = hour_data.length ? hour_data.reduce((a, b) => a + (b.actual_power || 0), 0) / hour_data.length : 0;
    return { hour: `${h}:00`, avg_power: +avg_power.toFixed(3), count: hour_data.length };
  });

  // Temperature efficiency correlation
  const tempEff = data
    .filter((d) => d.temperature > 0 && d.actual_power > 0 && d.irradiance > 100)
    .map((d) => ({ x: d.temperature, y: d.actual_power, temperature: d.temperature, power: d.actual_power }))
    .slice(0, 200);

  // Irradiance vs power scatter
  const irradPower = data
    .filter((d) => d.irradiance > 0 && d.actual_power > 0)
    .map((d) => ({ x: d.irradiance, y: d.actual_power }))
    .slice(0, 200);

  // Dust impact
  const dustGroups = { low: [], mid: [], high: [] };
  data.forEach((d) => {
    if (d.dust < 30) dustGroups.low.push(d.actual_power || 0);
    else if (d.dust < 70) dustGroups.mid.push(d.actual_power || 0);
    else dustGroups.high.push(d.actual_power || 0);
  });
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const dustImpact = [
    { label: "Clean (0-30%)", avg_power: +avg(dustGroups.low).toFixed(3), dust: "Low", fill: "#10b981" },
    { label: "Moderate (30-70%)", avg_power: +avg(dustGroups.mid).toFixed(3), dust: "Mid", fill: "#f59e0b" },
    { label: "Heavy (70-100%)", avg_power: +avg(dustGroups.high).toFixed(3), dust: "High", fill: "#ef4444" },
  ];

  // Weekly efficiency (last 7 'days' worth of data, using groups of ~28 points if 5-min interval)
  const weeklyEff = Array(7).fill(0).map((_, i) => {
    const chunk = data.slice(i * 28, (i + 1) * 28);
    const eff = chunk.length ? chunk.reduce((a, b) => a + (b.actual_power || 0), 0) / chunk.length : 0;
    const pred = chunk.length ? chunk.reduce((a, b) => a + (b.predicted_power || 0), 0) / chunk.length : 0;
    return { day: `D${i + 1}`, actual: +eff.toFixed(3), predicted: +pred.toFixed(3) };
  });

  return (
    <div className="space-y-5">
      {/* Deviation Analysis */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Power Deviation Over Time</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>% difference between predicted and actual power — values above 20% indicate anomaly</p>
        {loading ? <div className="skeleton h-60" /> : <DeviationChart data={data.slice(-80)} height={260} />}
      </div>

      {/* Scatter plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-display font-semibold mb-1 text-sm" style={{ color: "var(--text-primary)" }}>Irradiance vs Power Output</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Higher irradiance → higher power generation</p>
          {loading ? <div className="skeleton h-56" /> : <ScatterPlot data={irradPower} xKey="x" yKey="y" xLabel="Irradiance (lux)" yLabel="Power (W)" color="#f59e0b" height={240} />}
        </div>

        <div className="card p-4">
          <h3 className="font-display font-semibold mb-1 text-sm" style={{ color: "var(--text-primary)" }}>Temperature vs Power (Efficiency Loss)</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Higher temperature reduces panel efficiency</p>
          {loading ? <div className="skeleton h-56" /> : <ScatterPlot data={tempEff} xKey="x" yKey="y" xLabel="Temperature (°C)" yLabel="Power (W)" color="#ef4444" height={240} />}
        </div>
      </div>

      {/* Dust impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-display font-semibold mb-1 text-sm" style={{ color: "var(--text-primary)" }}>Dust Impact on Power</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Average power output by dust accumulation level</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dustImpact} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="label" tick={{ fill: "#4a6080", fontSize: 10 }} />
              <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} tickFormatter={(v) => `${v}W`} />
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} />
              <Bar dataKey="avg_power" name="Avg Power (W)" radius={[4, 4, 0, 0]}>
                {dustImpact.map((e, i) => (
                  <rect key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-display font-semibold mb-1 text-sm" style={{ color: "var(--text-primary)" }}>Hourly Energy Profile</h3>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Average power output by hour of day</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyEnergy.filter((h) => h.count > 0)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="hour" tick={{ fill: "#4a6080", fontSize: 9 }} angle={-40} textAnchor="end" height={45} />
              <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} tickFormatter={(v) => `${v}W`} />
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} formatter={(v) => [`${v} W`, "Avg Power"]} />
              <Bar dataKey="avg_power" name="Avg Power (W)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly efficiency */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Weekly Efficiency — Actual vs Predicted</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Grouped segments of available data</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={weeklyEff} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
            <XAxis dataKey="day" tick={{ fill: "#4a6080", fontSize: 11 }} />
            <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} tickFormatter={(v) => `${v}W`} />
            <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#8ba3c7" }} />
            <Bar dataKey="actual" name="Actual (W)" fill="#f59e0b" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="predicted" name="Predicted (W)" stroke="#3b82f6" strokeWidth={2} dot strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity vs Irradiance */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Humidity & Irradiance Over Time</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>High humidity correlates with reduced irradiance (cloud cover)</p>
        <MultiLineChart data={data.slice(-80)} lines={[
          { key: "humidity", name: "Humidity (%)", color: "#3b82f6" },
          { key: "irradiance", name: "Irradiance (lux)", color: "#f59e0b" },
        ]} height={280} />
      </div>
    </div>
  );
}
