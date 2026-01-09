# Water Level Monitor - ESP32 Arduino Code

This Arduino sketch monitors water level using an ultrasonic sensor (HC-SR04) and publishes the data to HiveMQ Cloud via MQTT.

## Hardware Requirements

- ESP32 Development Board
- HC-SR04 Ultrasonic Sensor
- Jumper wires
- Power supply for ESP32

## Wiring

### HC-SR04 to ESP32
- **VCC** → 5V (or 3.3V depending on your HC-SR04 version)
- **GND** → GND
- **TRIG** → GPIO 14
- **ECHO** → GPIO 15

### Optional: Battery Monitoring
- Connect battery voltage divider to GPIO 35 (ADC)
- Update the `getBatteryVoltage()` function with your voltage divider ratio

## Configuration

Before uploading, update these values in the code:

```cpp
// WiFi
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

// MQTT (HiveMQ Cloud)
const char* mqtt_server = "your-hivemq-broker.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "YourMQTTUsername";
const char* mqtt_pass = "YourMQTTPassword";

// Device
const char* deviceId = "tank1";

// Tank Configuration
const float TANK_DEPTH = 100.0;    // Adjust to your tank depth
const float TANK_HEIGHT = 200.0;   // Physical height for distance calculation
```

## Features

### ✅ Improved Error Handling
- WiFi connection timeout with auto-restart
- Detailed MQTT error messages
- Ultrasonic sensor timeout detection
- Invalid reading validation

### ✅ Robust Connection Management
- Automatic WiFi reconnection
- Automatic MQTT reconnection with retry limits
- Connection status monitoring

### ✅ Data Publishing
- Publishes distance, percentage, and battery voltage
- Retained messages for latest values
- Configurable publish interval (default: 5 seconds)

### ✅ Serial Output
- Clear status messages
- Debug information
- Connection status indicators

## Installation

1. Install required libraries:
   - ESP32 Board Support (Arduino IDE)
   - WiFi (included with ESP32)
   - WiFiClientSecure (included with ESP32)
   - PubSubClient (install via Library Manager)

2. Install PubSubClient:
   ```
   Arduino IDE → Tools → Manage Libraries → Search "PubSubClient" → Install
   ```

3. Select Board:
   ```
   Tools → Board → ESP32 Arduino → Your ESP32 Board
   ```

4. Configure:
   - Update WiFi credentials
   - Update MQTT server credentials
   - Adjust tank dimensions

5. Upload:
   ```
   Tools → Upload
   ```

## Serial Monitor

Open Serial Monitor at 115200 baud to see:
- Connection status
- Sensor readings
- MQTT publish status
- Error messages

## MQTT Topics

The device publishes to:
- `waterlevel/tank1/distance` - Distance in cm
- `waterlevel/tank1/percentage` - Water level percentage (0-100)
- `waterlevel/tank1/battery` - Battery voltage in V

## Troubleshooting

### WiFi Connection Issues
- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check signal strength

### MQTT Connection Issues
- Verify MQTT server address
- Check username and password
- Ensure port 8883 is accessible
- Check firewall settings

### Ultrasonic Sensor Issues
- Verify wiring connections
- Check power supply (5V for most HC-SR04)
- Ensure sensor is properly mounted
- Test with Serial Monitor output

### No Data Received on Server
- Check MQTT broker connection
- Verify device is publishing (check Serial Monitor)
- Check topic names match server subscription
- Verify server is subscribed to `waterlevel/+/+`

## Security Notes

### Development
The code uses `espClient.setInsecure()` which disables SSL certificate validation. This is fine for development but not secure for production.

### Production
For production use, enable certificate validation:
```cpp
// Remove: espClient.setInsecure();

// Add your CA certificate:
const char* root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"YOUR_CA_CERTIFICATE_HERE\n" \
"-----END CERTIFICATE-----\n";

espClient.setCACert(root_ca);
```

## Customization

### Change Publish Interval
```cpp
const unsigned long PUBLISH_INTERVAL = 10000; // 10 seconds
```

### Add Additional Sensors
Add sensor reading functions and publish to additional topics:
```cpp
float temperature = getTemperature();
char tempStr[10];
dtostrf(temperature, 4, 2, tempStr);
client.publish("waterlevel/tank1/temperature", tempStr, true);
```

### Change Ultrasonic Pins
```cpp
#define TRIG_PIN 2
#define ECHO_PIN 4
```

## License

This code is provided as-is for educational and development purposes.

