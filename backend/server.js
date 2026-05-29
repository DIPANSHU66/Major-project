const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const modelRoutes = require("./routes/modelRoutes");
const thingspeakRoutes = require("./routes/thingspeakRoutes");
const { loadModel, startRetraining } = require("./controllers/modelController");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use("/api/model", modelRoutes);
app.use("/api/thingspeak", thingspeakRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Load ML model on startup
loadModel();
startRetraining();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌞 Solar Monitor Backend running at http://localhost:${PORT}`);
});
