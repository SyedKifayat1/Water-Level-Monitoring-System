const router = require("express").Router();
const WaterLevel = require("../models/WaterLevel");

// Get latest water level reading for a device
router.get("/latest/:deviceId", async (req, res) => {
  try {
    const data = await WaterLevel.findOne({ deviceId: req.params.deviceId })
      .sort({ createdAt: -1 })
      .lean();
    
    if (!data) {
      return res.status(404).json({ 
        error: "No data found", 
        message: `No readings found for device: ${req.params.deviceId}` 
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching latest data:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Get history of water level readings
router.get("/history/:deviceId", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await WaterLevel.find({ deviceId: req.params.deviceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Get all devices
router.get("/devices", async (req, res) => {
  try {
    const devices = await WaterLevel.distinct("deviceId");
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Get statistics for a device
router.get("/stats/:deviceId", async (req, res) => {
  try {
    const data = await WaterLevel.find({ deviceId: req.params.deviceId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    if (data.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }
    
    const percentages = data.map(d => d.percentage || 0);
    const distances = data.map(d => d.distance || 0);
    
    const stats = {
      latest: data[0],
      average: {
        percentage: percentages.reduce((a, b) => a + b, 0) / percentages.length,
        distance: distances.reduce((a, b) => a + b, 0) / distances.length
      },
      min: {
        percentage: Math.min(...percentages),
        distance: Math.min(...distances)
      },
      max: {
        percentage: Math.max(...percentages),
        distance: Math.max(...distances)
      },
      count: data.length
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

module.exports = router;
