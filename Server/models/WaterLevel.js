const mongoose = require("mongoose");

const WaterLevelSchema = new mongoose.Schema({
  deviceId: String,
  distance: Number,
  percentage: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WaterLevel", WaterLevelSchema);
