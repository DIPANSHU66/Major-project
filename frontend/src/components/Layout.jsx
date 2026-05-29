import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Brain,
  Bell,
  Wrench,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "#f59e0b",
  },
  { to: "/live", icon: Activity, label: "Live Monitor", color: "#10b981" },
  { to: "/analysis", icon: BarChart3, label: "Analysis", color: "#3b82f6" },
  { to: "/models", icon: Brain, label: "ML Models", color: "#8b5cf6" },
  { to: "/alerts", icon: Bell, label: "Alerts", color: "#ef4444" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance", color: "#f97316" },
  { to: "/settings", icon: Settings, label: "Settings", color: "#6b7280" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentPage =
    navItems.find((n) => n.to === location.pathname)?.label || "SolarIQ";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 relative z-20 flex-shrink-0"
        style={{
          width: sidebarOpen ? "240px" : "64px",
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 solar-glow"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Sun size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div
                className="font-display font-bold text-lg leading-none"
                style={{ color: "var(--accent-solar-bright)" }}
              >
                SolarIQ
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Monitor & Predict
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${isActive ? "active-nav" : "hover:bg-white/5"}`
              }
              style={({ isActive }) => ({
                background: isActive ? `${color}18` : undefined,
                border: isActive
                  ? `1px solid ${color}30`
                  : "1px solid transparent",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? color : "var(--text-muted)",
                      flexShrink: 0,
                    }}
                  />
                  {sidebarOpen && (
                    <span
                      className="text-sm font-medium transition-colors"
                      style={{
                        color: isActive
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {label}
                    </span>
                  )}
                  {isActive && sidebarOpen && (
                    <ChevronRight
                      size={14}
                      style={{ marginLeft: "auto", color }}
                    />
                  )}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                      style={{ background: color }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Live indicator */}
        {sidebarOpen && (
          <div
            className="p-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
              <span
                className="text-xs font-medium"
                style={{ color: "#10b981" }}
              >
                Live Monitoring
              </span>
            </div>
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-bright)",
            color: "var(--text-secondary)",
          }}
        >
          {sidebarOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h1
              className="font-display font-semibold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {currentPage}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date().toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "medium",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {theme === "dark" ? (
                <Sun size={18} color="#f59e0b" />
              ) : (
                <Moon size={18} color="#6366f1" />
              )}
            </button>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg num text-xs"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                color: "#f59e0b",
              }}
            >
              <Zap size={12} />
              ThingSpeak Connected
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
