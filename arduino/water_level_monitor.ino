#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

/* ================= USER CONFIG ================= */

// WiFi Configuration
const char* ssid = "Test WiFi"; // add your own wifi ssid
const char* password = "test1234"; // add your own wifi password

// HiveMQ Cloud MQTT Configuration
const char* mqtt_server = "xxxxxxxxxxxxxxxxxxxxxxxx.s1.eu.hivemq.cloud"; // add your own hivemq cloud server address
const int mqtt_port = 8883;
const char* mqtt_user = "abc123"; // add your own hivemq cloud server username
const char* mqtt_pass = "abc123"; // add your own hivemq cloud server password

// Device Configuration
const char* deviceId = "tank1";

// Ultrasonic Sensor Pins (ESP32-CAM SAFE)
#define TRIG_PIN 14
#define ECHO_PIN 13

// Tank Configuration
const float TANK_DEPTH = 100.0;   // Actual water depth in cm
const float SENSOR_OFFSET = 0.0;  // Distance from sensor to tank top (cm)

// Timing Configuration
const unsigned long PUBLISH_INTERVAL = 5000;
const unsigned long RECONNECT_INTERVAL = 5000;

/* =============================================== */

WiFiClientSecure espClient;
PubSubClient client(espClient);

unsigned long lastPublish = 0;
unsigned long lastReconnectAttempt = 0;
bool mqttConnected = false;

/* ---------- WiFi Setup ---------- */
void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    attempts++;
    if (attempts > 30) ESP.restart();
  }
}

/* ---------- MQTT Reconnection ---------- */
void reconnectMQTT() {
  if (millis() - lastReconnectAttempt < RECONNECT_INTERVAL) return;
  lastReconnectAttempt = millis();

  if (client.connected()) {
    mqttConnected = true;
    return;
  }

  String clientId = String(deviceId) + "-" + String(random(0xffff), HEX);
  if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
    mqttConnected = true;
  } else {
    mqttConnected = false;
  }
}

/* ---------- Ultrasonic Sensor Reading ---------- */
float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1;

  float distance = (duration * 0.0343) / 2.0;
  if (distance < 2.0 || distance > 400.0) return -1;

  return distance;
}

/* ---------- Setup ---------- */
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  setupWiFi();

  espClient.setInsecure(); // Dev only
  client.setServer(mqtt_server, mqtt_port);
}

/* ---------- Main Loop ---------- */
void loop() {
  if (WiFi.status() != WL_CONNECTED) setupWiFi();
  if (!client.connected()) reconnectMQTT();
  client.loop();

  if (mqttConnected && millis() - lastPublish >= PUBLISH_INTERVAL) {
    lastPublish = millis();

    float distance = getDistance();
    if (distance < 0) return;

    // ✅ CORRECT WATER LEVEL CALCULATION
    float adjustedDistance = distance - SENSOR_OFFSET;
    float waterLevel = TANK_DEPTH - adjustedDistance;
    float percentage = (waterLevel / TANK_DEPTH) * 100.0;
    percentage = constrain(percentage, 0.0, 100.0);

    // MQTT Topics
    String baseTopic = "waterlevel/" + String(deviceId);
    client.publish((baseTopic + "/distance").c_str(), String(distance, 2).c_str(), true);
    client.publish((baseTopic + "/percentage").c_str(), String(percentage, 2).c_str(), true);

    // Serial Debug
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print(" cm | Level: ");
    Serial.print(percentage);
    Serial.println(" %");
  }

  delay(10);
}
