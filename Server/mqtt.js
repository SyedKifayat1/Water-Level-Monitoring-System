const mqtt = require("mqtt");
const WaterLevel = require("./models/WaterLevel");

const client = mqtt.connect({
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
  protocol: "mqtts",
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
});

client.on("connect", () => {
  console.log("MQTT Connected");
  client.subscribe("waterlevel/+/+");
});

client.on("message", async (topic, message) => {
  const [_, deviceId, type] = topic.split("/");
  const value = parseFloat(message.toString());

  if (type === "distance" || type === "percentage") {
    await WaterLevel.create({
      deviceId,
      [type]: value
    });
  }
});
