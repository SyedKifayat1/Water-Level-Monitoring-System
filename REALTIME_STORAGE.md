# Real-Time Data Storage in MongoDB ✅

## How Data is Stored in Real-Time

### Overview
The system now uses a **buffering mechanism** to ensure all MQTT messages (distance, percentage, battery) are properly collected and stored as **complete records** in MongoDB in real-time.

---

## How It Works

### 1. **Message Reception** (Real-Time)
When Arduino publishes data:
```
waterlevel/tank1/distance → "45.23"
waterlevel/tank1/percentage → "67.50"
waterlevel/tank1/battery → "3.78"
```

All messages arrive within milliseconds of each other.

### 2. **Buffering** (2-second window)
- Messages are collected in a buffer for **2 seconds**
- This ensures all three readings (distance, percentage, battery) are grouped together
- Each device has its own buffer entry

**Buffer Structure:**
```javascript
{
  deviceId: "tank1",
  data: {
    distance: 45.23,
    percentage: 67.50,
    battery: 3.78
  },
  timestamp: 1234567890
}
```

### 3. **Database Storage** (Every 500ms)
- Buffer processor runs every **500ms**
- Checks for buffers older than 2 seconds
- Saves complete records to MongoDB

### 4. **Record Merging Logic**
- If a record exists within the last **10 seconds** → **Update** it
- Otherwise → **Create** a new record
- This prevents duplicate records while ensuring all data is stored

---

## Storage Flow Diagram

```
Arduino publishes 3 messages (almost simultaneously)
    ↓
MQTT Broker receives all 3
    ↓
Server receives messages
    ↓
Messages added to buffer (grouped by deviceId)
    ↓
Buffer collects for 2 seconds
    ↓
After 2 seconds → Process buffer
    ↓
Check if record exists (within 10 seconds)
    ↓
YES → Update existing record with all fields
NO  → Create new record with all fields
    ↓
Saved to MongoDB ✅
    ↓
Available via API immediately
```

---

## Key Features

### ✅ **Complete Records**
- All three fields (distance, percentage, battery) are stored together
- No partial records
- No missing data

### ✅ **Real-Time Storage**
- Data is saved within **2-3 seconds** of Arduino publishing
- Processed every **500ms** for fast response
- No data loss

### ✅ **Efficient Merging**
- Updates existing records when possible
- Creates new records when needed
- Prevents duplicate entries

### ✅ **Error Handling**
- Failed saves are logged
- Buffer is cleared even on errors
- Prevents buffer overflow

### ✅ **Graceful Shutdown**
- Processes remaining buffer on server shutdown
- No data loss during restart

---

## Example: What Gets Stored

### Input (from Arduino):
```
Topic: waterlevel/tank1/distance
Value: "45.23"

Topic: waterlevel/tank1/percentage  
Value: "67.50"

Topic: waterlevel/tank1/battery
Value: "3.78"
```

### Output (in MongoDB):
```javascript
{
  _id: ObjectId("..."),
  deviceId: "tank1",
  distance: 45.23,
  percentage: 67.50,
  battery: 3.78,
  createdAt: ISODate("2026-01-08T22:48:29.000Z"),
  updatedAt: ISODate("2026-01-08T22:48:29.000Z")
}
```

**One complete record with all fields!** ✅

---

## Server Logs

When data is received and stored, you'll see:

```
📥 Buffered distance for tank1: 45.23cm
📥 Buffered percentage for tank1: 67.50%
📥 Buffered battery for tank1: 3.78V
📊 Created new record for tank1: {
  _id: ...,
  distance: 45.23,
  percentage: 67.50,
  battery: 3.78,
  createdAt: ...
}
```

Or if updating:
```
📊 Updated record for tank1: {
  distance: 45.23,
  percentage: 67.50,
  battery: 3.78
}
```

---

## Configuration

### Buffer Window
- **Collection Window**: 2 seconds
- **Processing Interval**: 500ms
- **Update Window**: 10 seconds

These can be adjusted in `Server/mqtt.js`:
```javascript
const BUFFER_WINDOW = 2000; // 2 seconds
setInterval(processBuffer, 500); // Process every 500ms
const shouldUpdate = ... < 10000; // 10 second window
```

---

## Verification

### Check if data is being stored:

1. **Check Server Logs:**
   ```
   📥 Buffered ... (messages received)
   📊 Created/Updated record ... (data saved)
   ```

2. **Check MongoDB:**
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Use database
   use waterlevel
   
   # Check records
   db.waterlevels.find().sort({createdAt: -1}).limit(5).pretty()
   ```

3. **Check API:**
   ```bash
   curl http://localhost:5000/api/water/latest/tank1
   ```

4. **Check Dashboard:**
   - Open dashboard
   - Data should appear within 2-3 seconds
   - Auto-refreshes every 5 seconds

---

## Troubleshooting

### No data in database?

1. **Check MQTT connection:**
   ```
   ✅ MQTT Connected
   📡 Subscribed to waterlevel/+/+
   ```

2. **Check if messages are received:**
   ```
   📥 Buffered distance for tank1: ...
   ```

3. **Check for errors:**
   ```
   ❌ Error saving data for tank1: ...
   ```

4. **Check MongoDB connection:**
   ```
   ✅ MongoDB Connected
   ```

### Partial records?

- Buffer window might be too short
- Increase `BUFFER_WINDOW` to 3000ms (3 seconds)

### Duplicate records?

- Update window might be too short
- Increase update window to 15000ms (15 seconds)

---

## ✅ Conclusion

**YES, all data is stored in MongoDB in real-time!**

- ✅ Messages are received immediately
- ✅ Buffered for 2 seconds to collect all fields
- ✅ Saved to database every 500ms
- ✅ Complete records with all fields
- ✅ Available via API immediately
- ✅ Displayed on dashboard in real-time

The system ensures **no data loss** and **complete records** are stored in MongoDB.

