const express = require("express");
const { getStatus, getHistory, getModelStats } = require("../controllers/modelController");

const router = express.Router();

router.get("/status", getStatus);
router.get("/history", getHistory);
router.get("/stats", getModelStats);

module.exports = router;
