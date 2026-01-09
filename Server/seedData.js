require("dotenv").config();
const mongoose = require("mongoose");
const WaterLevel = require("./models/WaterLevel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/waterlevel";
const DEVICE_ID = process.env.DEVICE_ID || "tank1"; // Use 'tank1' or 'TANK1' based on your frontend config

// Generate realistic water level data for the last 10 hours
async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data for this device (optional - comment out if you want to keep existing data)
    const deleted = await WaterLevel.deleteMany({ deviceId: DEVICE_ID });
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing records for device: ${DEVICE_ID}`);

    const now = new Date();
    const records = [];
    
    // Generate data for the last 10 hours (every 5 minutes = 120 records)
    const numberOfRecords = 120; // 10 hours * 60 minutes / 5 minutes
    const intervalMinutes = 5;
    
    // Start with a realistic water level (around 60-70%)
    let currentPercentage = 65 + Math.random() * 10; // Start between 65-75%
    const baseDistance = 120; // Base distance in cm (assuming tank height of 200cm, so 120cm from top = 40% empty)
    
    for (let i = numberOfRecords; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
      
      // Simulate realistic water level changes
      // Water level can increase (filling) or decrease (draining) slightly
      const changeRate = (Math.random() - 0.45) * 0.5; // Small random changes (-0.225% to +0.225% per interval)
      currentPercentage += changeRate;
      
      // Keep percentage within realistic bounds (20% to 95%)
      currentPercentage = Math.max(20, Math.min(95, currentPercentage));
      
      // Calculate distance based on percentage
      // Assuming tank height is 200cm: 0% = 200cm distance, 100% = 0cm distance
      const tankHeight = 200;
      const distance = tankHeight - (currentPercentage / 100) * tankHeight;
      
      // Battery voltage (decreases slowly over time)
      const batteryVoltage = 3.8 - (i / numberOfRecords) * 0.1 + (Math.random() - 0.5) * 0.05;
      const battery = Math.max(3.3, Math.min(4.2, batteryVoltage));
      
      // Add some variation every few readings to make it more realistic
      if (Math.random() > 0.7) {
        currentPercentage += (Math.random() - 0.5) * 2;
        currentPercentage = Math.max(20, Math.min(95, currentPercentage));
      }
      
      records.push({
        deviceId: DEVICE_ID,
        percentage: Math.round(currentPercentage * 10) / 10, // Round to 1 decimal
        distance: Math.round(distance * 10) / 10,
        battery: Math.round(battery * 100) / 100, // Round to 2 decimals
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    // Insert all records
    const result = await WaterLevel.insertMany(records);
    console.log(`✅ Successfully inserted ${result.length} records for device: ${DEVICE_ID}`);
    console.log(`📊 Data range: ${new Date(records[0].createdAt).toISOString()} to ${new Date(records[records.length - 1].createdAt).toISOString()}`);
    console.log(`💧 Percentage range: ${Math.min(...records.map(r => r.percentage)).toFixed(1)}% - ${Math.max(...records.map(r => r.percentage)).toFixed(1)}%`);
    
    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedData();

