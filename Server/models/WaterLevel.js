const mongoose = require("mongoose");

const WaterLevelSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  distance: {
    type: Number,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  battery: {
    type: Number,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
WaterLevelSchema.index({ deviceId: 1, createdAt: -1 });

module.exports = mongoose.model("WaterLevel", WaterLevelSchema);
