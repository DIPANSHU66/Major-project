import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LiveMonitor from "./pages/LiveMonitor";
import Analysis from "./pages/Analysis";
import MLModels from "./pages/MLModels";
import Alerts from "./pages/Alerts";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        theme="dark"
        toastStyle={{ background: "#131d35", border: "1px solid #1e2d4a", color: "#e8f0fe" }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="live" element={<LiveMonitor />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="models" element={<MLModels />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
