const mqtt = require("mqtt");
const WaterLevel = require("./models/WaterLevel");

// MQTT configuration with fallbacks for development
let mqttConfig = null;

if (process.env.MQTT_HOST) {
  const port = parseInt(process.env.MQTT_PORT) || 1883;
  // If port is 8883, use mqtts (SSL/TLS), otherwise use mqtt
  const defaultProtocol = port === 8883 ? "mqtts" : "mqtt";
  const protocol = (process.env.MQTT_PROTOCOL || defaultProtocol).toLowerCase();
  
  mqttConfig = {
    host: process.env.MQTT_HOST,
    port: port,
    protocol: protocol,
    reconnectPeriod: 5000, // Reconnect every 5 seconds
    connectTimeout: 10000, // 10 second timeout
    clientId: `waterlevel-${Math.random().toString(16).substr(2, 8)}`, // Unique client ID
    // For SSL/TLS connections, reject unauthorized certificates
    rejectUnauthorized: false // Set to true in production with valid certificates
  };
  
  // Add username and password only if provided
  if (process.env.MQTT_USER) {
    mqttConfig.username = process.env.MQTT_USER;
  }
  if (process.env.MQTT_PASS) {
    mqttConfig.password = process.env.MQTT_PASS;
  }
}

if (mqttConfig) {
  console.log("🔧 MQTT Configuration:");
  console.log(`   Host: ${mqttConfig.host}`);
  console.log(`   Port: ${mqttConfig.port}`);
  console.log(`   Protocol: ${mqttConfig.protocol}`);
  console.log(`   Username: ${mqttConfig.username ? '***' : 'Not set'}`);
  console.log(`   Password: ${mqttConfig.password ? '***' : 'Not set'}`);
  
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let mqttDisabled = false;

  const client = mqtt.connect(mqttConfig);

  client.on("connect", () => {
    reconnectAttempts = 0; // Reset on successful connection
    console.log("✅ MQTT Connected");
    client.subscribe("waterlevel/+/+", (err) => {
      if (err) {
        console.error("❌ MQTT Subscribe Error:", err);
      } else {
        console.log("📡 Subscribed to waterlevel/+/+");
      }
    });
  });

  client.on("error", (error) => {
    console.error("❌ MQTT Error:", error.message);
    if (error.message.includes("ECONNREFUSED") || error.message.includes("ENOTFOUND")) {
      if (reconnectAttempts >= maxReconnectAttempts && !mqttDisabled) {
        mqttDisabled = true;
        console.error("❌ MQTT: Max reconnection attempts reached. MQTT broker unreachable.");
        console.error("💡 Check your MQTT broker settings in .env file:");
        console.error(`   MQTT_HOST=${process.env.MQTT_HOST}`);
        console.error(`   MQTT_PORT=${process.env.MQTT_PORT || 1883}`);
        console.error("💡 To disable MQTT, remove MQTT_HOST from .env file");
        console.error("💡 Server will continue running in API-only mode.");
        client.end(true); // Force disconnect and stop reconnecting
      }
    }
  });

  client.on("close", () => {
    if (!mqttDisabled) {
      reconnectAttempts++;
      if (reconnectAttempts <= maxReconnectAttempts) {
        console.log(`⚠️ MQTT Connection Closed (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
      }
    }
  });

  client.on("reconnect", () => {
    if (!mqttDisabled && reconnectAttempts <= maxReconnectAttempts) {
      console.log(`🔄 MQTT Reconnecting... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    }
  });

  client.on("offline", () => {
    if (!mqttDisabled) {
      console.log("⚠️ MQTT Client went offline");
    }
  });

  // Message buffer to collect readings within a time window
  const messageBuffer = new Map(); // deviceId -> { data, timestamp }

  // Process buffered messages and save to database
  const processBuffer = async () => {
    const now = Date.now();
    const BUFFER_WINDOW = 2000; // 2 seconds window to collect all readings from Arduino

    for (const [deviceId, buffer] of messageBuffer.entries()) {
      // If buffer is older than window, save it
      if (now - buffer.timestamp > BUFFER_WINDOW) {
        try {
          const data = buffer.data;
          
          // Only process if we have at least one data field
          if (Object.keys(data).length === 0) {
            messageBuffer.delete(deviceId);
            continue;
          }
          
          // Find the latest record for this device within the last 10 seconds
          const latest = await WaterLevel.findOne({ deviceId })
            .sort({ createdAt: -1 })
            .lean();

          const nowDate = new Date();
          const shouldUpdate = latest && latest.createdAt && 
            (nowDate - new Date(latest.createdAt)) < 10000; // 10 second window

          if (shouldUpdate) {
            // Update existing record - merge with existing data
            const updateData = {
              ...latest, // Keep existing data
              ...data,   // Override with new data
              updatedAt: nowDate
            };
            // Remove _id and __v from update
            delete updateData._id;
            delete updateData.__v;
            
            await WaterLevel.findByIdAndUpdate(latest._id, updateData);
            console.log(`📊 Updated record for ${deviceId}:`, {
              distance: updateData.distance,
              percentage: updateData.percentage,
              battery: updateData.battery
            });
          } else {
            // Create new record
            const newRecord = {
              deviceId,
              ...data,
              createdAt: nowDate,
              updatedAt: nowDate
            };
            
            const created = await WaterLevel.create(newRecord);
            console.log(`📊 Created new record for ${deviceId}:`, {
              _id: created._id,
              distance: created.distance,
              percentage: created.percentage,
              battery: created.battery,
              createdAt: created.createdAt
            });
          }
          
          // Remove from buffer after processing
          messageBuffer.delete(deviceId);
        } catch (error) {
          console.error(`❌ Error saving data for ${deviceId}:`, error);
          messageBuffer.delete(deviceId); // Remove even on error to prevent infinite buffer
        }
      }
    }
  };

  // Process buffer every 500ms for faster response
  const bufferInterval = setInterval(processBuffer, 500);

  // Cleanup on process exit
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down... Processing remaining buffer...');
    clearInterval(bufferInterval);
    await processBuffer(); // Process any remaining buffered messages
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down... Processing remaining buffer...');
    clearInterval(bufferInterval);
    await processBuffer(); // Process any remaining buffered messages
    process.exit(0);
  });

  client.on("message", async (topic, message) => {
    try {
      const [_, deviceId, type] = topic.split("/");
      const value = parseFloat(message.toString());

      if (isNaN(value)) {
        console.warn(`⚠️ Invalid value received on topic ${topic}: ${message.toString()}`);
        return;
      }

      // Handle distance, percentage, and battery readings
      if (type === "distance" || type === "percentage" || type === "battery") {
        // Add to buffer
        if (!messageBuffer.has(deviceId)) {
          messageBuffer.set(deviceId, {
            data: {},
            timestamp: Date.now()
          });
        }

        const buffer = messageBuffer.get(deviceId);
        buffer.data[type] = value;
        buffer.timestamp = Date.now(); // Update timestamp on each message

        console.log(`📥 Buffered ${type} for ${deviceId}: ${value}${type === "percentage" ? "%" : type === "battery" ? "V" : "cm"}`);
      } else {
        console.warn(`⚠️ Unknown topic type: ${type} for device ${deviceId}`);
      }
    } catch (error) {
      console.error("❌ Error processing MQTT message:", error);
      console.error(`   Topic: ${topic}, Message: ${message.toString()}`);
    }
  });
} else {
  console.log("⚠️ MQTT not configured. Set MQTT_HOST in .env to enable MQTT.");
  console.log("💡 Running in API-only mode. You can still use the API endpoints.");
}
