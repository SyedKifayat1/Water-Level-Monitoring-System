const router = require("express").Router();
const WaterLevel = require("../models/WaterLevel");

router.get("/latest/:deviceId", async (req, res) => {
  const data = await WaterLevel.findOne({ deviceId: req.params.deviceId })
    .sort({ createdAt: -1 });
  res.json(data);
});

router.get("/history/:deviceId", async (req, res) => {
  const data = await WaterLevel.find({ deviceId: req.params.deviceId })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(data);
});

module.exports = router;
