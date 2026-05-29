import React, { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function Settings() {
  const [channelId, setChannelId] = useState(localStorage.getItem("ts_channel") || "");
  const [apiKey, setApiKey] = useState(localStorage.getItem("ts_key") || "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Thresholds
  const [thresholds, setThresholds] = useState({
    deviation: parseInt(localStorage.getItem("thresh_deviation")) || 20,
    temperature: parseInt(localStorage.getItem("thresh_temp")) || 70,
    humidity: parseInt(localStorage.getItem("thresh_humidity")) || 90,
    dust: parseInt(localStorage.getItem("thresh_dust")) || 50,
  });

  const [refreshInterval, setRefreshInterval] = useState(parseInt(localStorage.getItem("refresh_interval")) || 10);

  const save = () => {
    localStorage.setItem("ts_channel", channelId);
    localStorage.setItem("ts_key", apiKey);
    localStorage.setItem("thresh_deviation", thresholds.deviation);
    localStorage.setItem("thresh_temp", thresholds.temperature);
    localStorage.setItem("thresh_humidity", thresholds.humidity);
    localStorage.setItem("thresh_dust", thresholds.dust);
    localStorage.setItem("refresh_interval", refreshInterval);
    toast.success("Settings saved successfully!");
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=1`;
      const res = await axios.get(url, { timeout: 8000 });
      if (res.data?.feeds?.length > 0) {
        setTestResult({ ok: true, msg: `✅ Connected! Channel: "${res.data.channel?.name || channelId}" — Last entry: ${res.data.feeds[0]?.created_at}` });
        toast.success("ThingSpeak connected successfully!");
      } else {
        setTestResult({ ok: false, msg: "No data returned. Check channel ID and API key." });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Connection failed: ${e.message}` });
      toast.error("Connection failed. Check your credentials.");
    } finally {
      setTesting(false);
    }
  };

  const fields = [
    { label: "Field 1", desc: "Voltage (V)" },
    { label: "Field 2", desc: "Current (mA)" },
    { label: "Field 3", desc: "Irradiance (lux)" },
    { label: "Field 4", desc: "Temperature (°C)" },
    { label: "Field 5", desc: "Humidity (%)" },
    { label: "Field 6", desc: "Power (mW)" },
    { label: "Field 7", desc: "Dust Level (%)" },
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* ThingSpeak config */}
      <div className="card p-5">
        <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          ThingSpeak Configuration
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Channel ID</label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="e.g. 2987654"
              className="w-full px-4 py-2.5 rounded-lg text-sm num focus:outline-none"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Read API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. XXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-lg text-sm num focus:outline-none pr-10"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {testResult && (
            <div className="px-4 py-2.5 rounded-lg text-sm flex items-start gap-2"
              style={{
                background: testResult.ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${testResult.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: testResult.ok ? "#10b981" : "#ef4444",
              }}>
              {testResult.ok ? <CheckCircle size={15} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />}
              {testResult.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={testConnection} disabled={!channelId || !apiKey || testing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6" }}>
              <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
              {testing ? "Testing..." : "Test Connection"}
            </button>
            <button onClick={save}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
              <Save size={14} />
              Save & Apply
            </button>
          </div>
        </div>
      </div>

      {/* Field mapping */}
      <div className="card p-5">
        <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>ThingSpeak Field Mapping</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <span className="text-xs font-mono font-bold" style={{ color: "#f59e0b" }}>{f.label}</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{f.desc}</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          Field mapping is fixed based on your ThingSpeak channel setup. Edit the backend .env to remap fields.
        </p>
      </div>

      {/* Alert thresholds */}
      <div className="card p-5">
        <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Alert Thresholds</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "deviation", label: "Power Deviation (%)", unit: "%", color: "#ef4444", min: 5, max: 50 },
            { key: "temperature", label: "Max Temperature", unit: "°C", color: "#f97316", min: 40, max: 100 },
            { key: "humidity", label: "Max Humidity", unit: "%", color: "#3b82f6", min: 50, max: 100 },
            { key: "dust", label: "Max Dust Level", unit: "%", color: "#78716c", min: 10, max: 100 },
          ].map(({ key, label, unit, color, min, max }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
                <span className="text-sm num font-bold" style={{ color }}>{thresholds[key]}{unit}</span>
              </div>
              <input
                type="range" min={min} max={max} value={thresholds[key]}
                onChange={(e) => setThresholds((p) => ({ ...p, [key]: +e.target.value }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${color} ${((thresholds[key] - min) / (max - min)) * 100}%, var(--border) 0%)` }}
              />
              <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                <span>{min}{unit}</span><span>{max}{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh interval */}
      <div className="card p-5">
        <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Data Refresh Interval</h3>
        <div className="flex items-center gap-3">
          {[5, 10, 15, 30, 60].map((s) => (
            <button key={s} onClick={() => setRefreshInterval(s)}
              className="px-3 py-1.5 rounded-lg text-sm num transition-all"
              style={{
                background: refreshInterval === s ? "rgba(245,158,11,0.2)" : "var(--bg-secondary)",
                border: `1px solid ${refreshInterval === s ? "rgba(245,158,11,0.5)" : "var(--border)"}`,
                color: refreshInterval === s ? "#f59e0b" : "var(--text-secondary)",
              }}>
              {s}s
            </button>
          ))}
        </div>
      </div>

      {/* Save all */}
      <button onClick={save}
        className="w-full py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "white" }}>
        <Save size={16} />
        Save All Settings
      </button>
    </div>
  );
}
