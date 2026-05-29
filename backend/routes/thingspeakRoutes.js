const express = require("express");
const axios = require("axios");
const { parse } = require("csv-parse/sync");
require("dotenv").config();

const router = express.Router();

const THINGSPEAK_CHANNEL_ID = process.env.THINGSPEAK_CHANNEL_ID;
const THINGSPEAK_READ_KEY = process.env.THINGSPEAK_READ_KEY;

router.get("/live", async (req, res) => {
  try {
    const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_KEY}&results=1`;
    const response = await axios.get(url, { timeout: 8000 });
    const feed = response.data.feeds?.[0];
    if (!feed) return res.status(404).json({ error: "No data" });
    res.json({
      created_at: feed.created_at,
      voltage: parseFloat(feed.field1) || 0,
      current: parseFloat(feed.field2) || 0,
      irradiance: parseFloat(feed.field3) || 0,
      temperature: parseFloat(feed.field4) || 0,
      humidity: parseFloat(feed.field5) || 0,
      actual_power: (parseFloat(feed.field6) || 0) / 1000,
      dust: parseFloat(feed.field7) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/feeds", async (req, res) => {
  try {
    const results = parseInt(req.query.results) || 100;
    const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.csv?api_key=${THINGSPEAK_READ_KEY}&results=${results}`;
    const response = await axios.get(url, { timeout: 10000 });
    const records = parse(response.data, { columns: true, skip_empty_lines: true });
    const data = records.map((r) => ({
      created_at: r.created_at,
      date: r.created_at?.split("T")[0],
      time: r.created_at?.split("T")[1]?.replace("Z", ""),
      voltage: parseFloat(r.field1) || 0,
      current: parseFloat(r.field2) || 0,
      irradiance: parseFloat(r.field3) || 0,
      temperature: parseFloat(r.field4) || 0,
      humidity: parseFloat(r.field5) || 0,
      actual_power: (parseFloat(r.field6) || 0) / 1000,
      dust: parseFloat(r.field7) || 0,
    }));
    res.json({ data, count: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
