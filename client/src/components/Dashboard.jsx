import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Dashboard.css';
import WaterGauge from './WaterGauge';
import StatCard from './StatCard';
import HistoryChart from './HistoryChart';
import AlertsTable from './AlertsTable';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEVICE_ID = import.meta.env.VITE_DEVICE_ID || 'tank1';

const Dashboard = () => {
    const [currentData, setCurrentData] = useState({ percentage: 0, distance: 0, battery: null });
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [siteInfo] = useState({
        siteName: DEVICE_ID.toUpperCase(),
    });

    const [alerts, setAlerts] = useState([]);

    const fetchData = async (showLoading = false) => {
        if (showLoading) setIsRefreshing(true);
        
        try {
            setError(null);
            
            // Fetch Current Data
            const latestRes = await axios.get(`${API_BASE_URL}/api/water/latest/${DEVICE_ID}`);
            if (latestRes.data) {
                setCurrentData({
                    percentage: latestRes.data.percentage || 0,
                    distance: latestRes.data.distance || 0,
                    battery: latestRes.data.battery || null
                });
                setLastUpdate(new Date(latestRes.data.createdAt || new Date()));
                setIsOnline(true);
            }

            // Fetch History
            const historyRes = await axios.get(`${API_BASE_URL}/api/water/history/${DEVICE_ID}?limit=50`);
            if (historyRes.data && historyRes.data.length > 0) {
                // Format for Recharts - reverse to show chronological order
                const formattedHistory = historyRes.data
                    .map(item => ({
                        time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        percentage: item.percentage || 0,
                        distance: item.distance || 0,
                        timestamp: new Date(item.createdAt)
                    }))
                    .reverse();

                setHistoryData(formattedHistory);

                // Generate alerts based on data
                generateAlerts(formattedHistory, latestRes.data);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch data");
            setIsOnline(false);
            setLoading(false);
        } finally {
            if (showLoading) setIsRefreshing(false);
        }
    };

    const generateAlerts = (history, latest) => {
        const newAlerts = [];
        const now = new Date();

        // Check for high level (>90%)
        if (latest && latest.percentage > 90) {
            newAlerts.push({
                timestamp: new Date(latest.createdAt).toISOString(),
                type: "HIGH WATER LEVEL",
                status: "Active",
                severity: "warning"
            });
        }

        // Check for low level (<10%)
        if (latest && latest.percentage < 10) {
            newAlerts.push({
                timestamp: new Date(latest.createdAt).toISOString(),
                type: "LOW WATER LEVEL",
                status: "Active",
                severity: "danger"
            });
        }

        // Check for connection issues (no data in last 5 minutes)
        if (latest) {
            const lastUpdateTime = new Date(latest.createdAt);
            const minutesSinceUpdate = (now - lastUpdateTime) / (1000 * 60);
            if (minutesSinceUpdate > 5) {
                newAlerts.push({
                    timestamp: lastUpdateTime.toISOString(),
                    type: "CONNECTION DELAY",
                    status: "Warning",
                    severity: "warning"
                });
            }
        }

        setAlerts(newAlerts.slice(0, 10)); // Keep last 10 alerts
    };

    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchData(true);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1 className="site-title">Water Level Monitoring System</h1>
                    <p className="site-subtitle">Site: {siteInfo.siteName}</p>
                </div>
                <div className="site-status">
                    <div className="last-seen">
                        Last seen: {lastUpdate.toISOString().replace('T', ' ').slice(0, 19)}Z
                    </div>
                    <div className="status-badge">
                        <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
                            {isOnline ? 'online' : 'offline'}
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {loading && historyData.length === 0 ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading water level data...</p>
                </div>
            ) : (
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
                                value={currentData.distance.toFixed(1)}
                                unit="cm"
                                type="distance"
                                trend={historyData.length > 1 ? 
                                    (historyData[historyData.length - 1]?.distance - historyData[0]?.distance) : 0
                                }
                            />
                            <StatCard
                                label="Battery:"
                                value={currentData.battery !== null ? currentData.battery.toFixed(2) : 'N/A'}
                                unit="V"
                                type="battery"
                                batteryLevel={currentData.battery}
                            />
                        </div>

                        <HistoryChart data={historyData} />
                    </div>

                    {/* Bottom Row: Alerts */}
                    <AlertsTable alerts={alerts} />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
