import React from "react";
import { Brain, TrendingUp, Cpu, Layers } from "lucide-react";
import { useModelStats, useHistory } from "../hooks/useSolarData";
import { MultiLineChart } from "../components/Charts";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from "recharts";

const MODEL_INFO = {
  random_forest: {
    name: "Random Forest",
    icon: Layers,
    color: "#f59e0b",
    desc: "Ensemble of 100 decision trees with random feature bagging. Robust to noise and overfitting. Best for tabular sensor data.",
    pros: ["Handles non-linear relationships", "Feature importance ranking", "Robust to missing data"],
    params: "n_estimators=100, max_depth=10, min_samples_split=5",
  },
  ann: {
    name: "Artificial Neural Network",
    icon: Brain,
    color: "#8b5cf6",
    desc: "3-layer feedforward network (5→16→8→1). Uses tanh activation with Adam optimizer. Captures complex non-linear patterns.",
    pros: ["Learns complex mappings", "Adapts to data distribution", "High accuracy with sufficient data"],
    params: "layers=[5,16,8,1], activation=tanh, optimizer=Adam, lr=0.001",
  },
  xgboost: {
    name: "XGBoost",
    icon: TrendingUp,
    color: "#10b981",
    desc: "Gradient-boosted trees with regularization. Sequentially improves weak learners. Industry-standard for structured data.",
    pros: ["Built-in regularization", "Handles sparse data", "Fast training & inference"],
    params: "n_estimators=200, learning_rate=0.05, max_depth=6, subsample=0.8",
  },
  ensemble: {
    name: "Ensemble (RF+ANN+XGB)",
    icon: Cpu,
    color: "#3b82f6",
    desc: "Weighted average of all three models (RF:35%, ANN:35%, XGB:30%). Reduces individual model variance and bias.",
    pros: ["Best overall accuracy", "Robust to single model failures", "Stable predictions"],
    params: "weights=[0.35, 0.35, 0.30]",
  },
};

export default function MLModels() {
  const { data: stats, loading: statsLoading } = useModelStats();
  const { data: history } = useHistory(100);

  const featureImportance = [
    { feature: "Irradiance", RF: 38, ANN: 32, XGB: 41 },
    { feature: "Voltage", RF: 28, ANN: 25, XGB: 26 },
    { feature: "Current", RF: 18, ANN: 22, XGB: 17 },
    { feature: "Temperature", RF: 10, ANN: 13, XGB: 11 },
    { feature: "Humidity", RF: 6, ANN: 8, XGB: 5 },
  ];

  const accuracyData = stats ? [
    { name: "Random Forest", accuracy: stats.random_forest.accuracy, color: "#f59e0b" },
    { name: "ANN", accuracy: stats.ann.accuracy, color: "#8b5cf6" },
    { name: "XGBoost", accuracy: stats.xgboost.accuracy, color: "#10b981" },
    { name: "Ensemble", accuracy: stats.ensemble.accuracy, color: "#3b82f6" },
  ] : [];

  return (
    <div className="space-y-5">
      {/* Model cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(MODEL_INFO).map(([key, m]) => {
          const s = stats?.[key];
          return (
            <div key={key} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}18`, border: `1px solid ${m.color}30` }}>
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{m.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{m.desc}</div>
                </div>
              </div>

              {/* Accuracy bar */}
              {s && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--text-secondary)" }}>Accuracy</span>
                    <span className="num font-bold" style={{ color: m.color }}>{s.accuracy}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${s.accuracy}%`, background: `linear-gradient(90deg, ${m.color}88, ${m.color})` }} />
                  </div>
                </div>
              )}

              {/* Metrics */}
              {s && key !== "ensemble" && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[["MAE", s.mae], ["RMSE", s.rmse], ["R²", s.r2]].map(([label, val]) => (
                    <div key={label} className="text-center py-1.5 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
                      <div className="text-sm font-bold num" style={{ color: "var(--text-primary)" }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pros */}
              <div className="space-y-1">
                {m.pros.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    {p}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{m.params}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accuracy comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Model Accuracy Comparison</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={accuracyData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis type="number" domain={[85, 100]} tick={{ fill: "#4a6080", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8ba3c7", fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Feature Importance (All Models)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={featureImportance} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="feature" tick={{ fill: "#4a6080", fontSize: 10 }} />
              <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#8ba3c7" }} />
              <Bar dataKey="RF" name="Random Forest" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="ANN" name="ANN" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="XGB" name="XGBoost" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All models vs actual live chart */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-1" style={{ color: "var(--text-primary)" }}>All Models — Predictions vs Actual</h3>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Live comparison of all 3 ML models against measured power output</p>
        <MultiLineChart data={history.slice(-60)} lines={[
          { key: "actual_power", name: "Actual (W)", color: "#ffffff" },
          { key: "rf_pred", name: "Random Forest", color: "#f59e0b", dashed: true },
          { key: "ann_pred", name: "ANN", color: "#8b5cf6", dashed: true },
          { key: "xgb_pred", name: "XGBoost", color: "#10b981", dashed: true },
        ]} height={300} />
      </div>

      {/* Radar comparison */}
      <div className="card p-4">
        <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Multi-Dimensional Model Profile</h3>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={[
            { subject: "Accuracy", RF: 94, ANN: 93, XGB: 95, ENS: 96 },
            { subject: "Speed", RF: 80, ANN: 72, XGB: 91, ENS: 75 },
            { subject: "Stability", RF: 92, ANN: 88, XGB: 90, ENS: 95 },
            { subject: "Small Data", RF: 85, ANN: 65, XGB: 87, ENS: 82 },
            { subject: "Generalize", RF: 88, ANN: 92, XGB: 86, ENS: 93 },
            { subject: "Interpretable", RF: 85, ANN: 45, XGB: 75, ENS: 60 },
          ]}>
            <PolarGrid stroke="#1e2d4a" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#4a6080", fontSize: 11 }} />
            <Radar name="Random Forest" dataKey="RF" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            <Radar name="ANN" dataKey="ANN" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
            <Radar name="XGBoost" dataKey="XGB" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            <Radar name="Ensemble" dataKey="ENS" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#8ba3c7" }} />
            <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", color: "#e8f0fe", fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {statsLoading && <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading model stats from backend...</p>}
      {stats && (
        <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Stats computed on {stats.samples_used} ThingSpeak samples
        </div>
      )}
    </div>
  );
}
