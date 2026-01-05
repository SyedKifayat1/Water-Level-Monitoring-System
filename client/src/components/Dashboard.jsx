import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Dashboard.css';
import WaterGauge from './WaterGauge';
import StatCard from './StatCard';
import HistoryChart from './HistoryChart';
import AlertsTable from './AlertsTable';

const Dashboard = () => {
    const [currentData, setCurrentData] = useState({ percentage: 0, distance: 0 });
    const [historyData, setHistoryData] = useState([]);

    // Mock Data for items not in DB yet
    const [mockStats] = useState({
        battery: 3.78,
        siteName: "Tank01",
        lastSeen: new Date().toISOString()
    });

    const [mockAlerts] = useState([
        { timestamp: "2025-12-09 04:15:00Z", type: "HIGH LEVEL", status: "Acknowledged" },
        { timestamp: "2025-12-08 12:30:00Z", type: "CONNECTION LOST", status: "Resolved" }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Current Data
                const latestRes = await axios.get("http://localhost:5000/api/water/latest/tank1");
                if (latestRes.data) {
                    setCurrentData({
                        percentage: latestRes.data.percentage || 0,
                        distance: latestRes.data.distance || 0
                    });
                }

                // Fetch History
                const historyRes = await axios.get("http://localhost:5000/api/water/history/tank1");
                if (historyRes.data) {
                    // Format for Recharts
                    const formattedHistory = historyRes.data.map(item => ({
                        time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        percentage: item.percentage
                    })).reverse(); // Reverse if server returns newest first

                    setHistoryData(formattedHistory);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="site-title">Site: {mockStats.siteName}</div>
                <div className="site-status">
                    Last seen: {new Date().toLocaleString()}
                    <div className="status-badge">
                        <span className="status-dot"></span> online
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Gauge */}
                <div className="gauge-card">
                    <WaterGauge percentage={currentData.percentage} />
                </div>

                {/* Right Column: Stats & Chart */}
                <div className="stats-column">
                    <div className="top-stats-row">
                        <StatCard
                            label="Distance:"
                            value={currentData.distance}
                            unit="cm"
                            type="distance"
                        />
                        <StatCard
                            label="Battery:"
                            value={mockStats.battery}
                            unit="V"
                            type="battery"
                        />
                    </div>

                    <HistoryChart data={historyData} />
                </div>

                {/* Bottom Row: Alerts */}
                <AlertsTable alerts={mockAlerts} />
            </div>
        </div>
    );
};

export default Dashboard;
