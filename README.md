# Water Level Monitoring System

A real-time water level monitoring system with a modern React dashboard and Node.js/Express backend. Features MQTT integration for IoT devices, MongoDB for data storage, and a beautiful, responsive UI.

## Features

- 📊 **Real-time Water Level Monitoring** - Live gauge display with smooth animations
- 📈 **Historical Data Visualization** - Interactive charts showing water level trends
- 🔔 **Smart Alerts** - Automatic alerts for high/low water levels and connection issues
- 🔋 **Battery Status Tracking** - Monitor device battery levels
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Beautiful, professional interface with smooth animations
- ⚡ **Real-time Updates** - Auto-refreshes every 5 seconds
- 🔌 **MQTT Integration** - Connect IoT devices via MQTT protocol

## Tech Stack

### Frontend
- React 19
- Vite
- Recharts (for data visualization)
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- MQTT.js (for IoT device communication)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the Server directory:
```bash
cd Server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Server directory:
```env
MONGO_URI=mongodb://localhost:27017/waterlevel
PORT=5000

# Optional: MQTT Configuration
MQTT_HOST=your-mqtt-broker.com
MQTT_PORT=1883
MQTT_PROTOCOL=mqtt
MQTT_USER=your-username
MQTT_PASS=your-password
```

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

### Seed Sample Data (Optional)

To populate the database with sample data for the last 10 hours:

```bash
cd Server
npm run seed
```

Or manually:
```bash
node seedData.js
```

This will generate 120 sample readings (one every 5 minutes) for the last 10 hours, including:
- Realistic water level percentages (20% - 95%)
- Distance measurements
- Battery voltage levels
- Timestamps spread over the last 10 hours

**Note:** By default, this uses device ID `tank1`. You can set `DEVICE_ID` in your `.env` file to use a different device ID.

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional):
```env
VITE_API_URL=http://localhost:5000
VITE_DEVICE_ID=tank1
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

### GET `/api/health`
Health check endpoint

### GET `/api/water/latest/:deviceId`
Get the latest water level reading for a device

### GET `/api/water/history/:deviceId?limit=50`
Get historical water level readings (default limit: 50)

### GET `/api/water/devices`
Get list of all devices

### GET `/api/water/stats/:deviceId`
Get statistics for a device (average, min, max, count)

## MQTT Integration

The system subscribes to MQTT topics in the format: `waterlevel/{deviceId}/{type}`

Where:
- `deviceId` is the device identifier (e.g., "tank1")
- `type` is either "distance" or "percentage"

Example topics:
- `waterlevel/tank1/distance` - Distance reading in cm
- `waterlevel/tank1/percentage` - Water level percentage (0-100)

## Project Structure

```
Water-Level-Monitoring-System/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WaterGauge.jsx
│   │   │   ├── HistoryChart.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── AlertsTable.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── Server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── mqtt.js           # MQTT client
│   └── server.js         # Express server
└── README.md
```

## Usage

1. Start MongoDB (if running locally)
2. Start the backend server
3. Start the frontend development server
4. Open your browser to the frontend URL
5. The dashboard will automatically fetch and display water level data

## Features in Detail

### Water Gauge
- Color-coded based on water level (red: low, orange: medium, blue: high, green: very high)
- Smooth animations and transitions
- Real-time percentage display

### Statistics Cards
- Distance measurement in cm
- Battery voltage with visual indicator
- Trend indicators showing increase/decrease

### History Chart
- Interactive area chart
- Shows last 50 readings by default
- Average reference line
- Custom tooltips with detailed information

### Alerts System
- Automatic alert generation for:
  - High water level (>90%)
  - Low water level (<10%)
  - Connection delays (>5 minutes)
- Color-coded status badges
- Timestamp tracking

## Development

### Building for Production

Frontend:
```bash
cd client
npm run build
```

The built files will be in `client/dist/`

### Environment Variables

**Backend (.env)**
- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `MQTT_HOST` - MQTT broker hostname
- `MQTT_PORT` - MQTT broker port
- `MQTT_PROTOCOL` - Protocol (mqtt or mqtts)
- `MQTT_USER` - MQTT username
- `MQTT_PASS` - MQTT password

**Frontend (.env)**
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_DEVICE_ID` - Device ID to monitor (default: tank1)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.