import React from 'react';
import { Battery, Ruler, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ label, value, unit, type, trend, batteryLevel }) => {
    const getIcon = () => {
        switch (type) {
            case 'battery':
                return <Battery className="stat-icon" size={28} />;
            case 'distance':
                return <Ruler className="stat-icon" size={28} />;
            default:
                return null;
        }
    };

    const getBatteryColor = (voltage) => {
        if (!voltage || voltage === 'N/A') return '#6b7280';
        if (voltage >= 3.7) return '#10b981'; // Green
        if (voltage >= 3.3) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    const getTrendIcon = () => {
        if (!trend || trend === 0) return <Minus size={16} className="trend-icon neutral" />;
        if (trend > 0) return <TrendingUp size={16} className="trend-icon up" />;
        return <TrendingDown size={16} className="trend-icon down" />;
    };

    const iconColor = type === 'battery' && batteryLevel ? getBatteryColor(batteryLevel) : '#3b82f6';

    return (
        <div className="stat-card">
            <div className="stat-content">
                <h3>{label}</h3>
                <div className="stat-value">
                    {value}
                    <span className="stat-unit"> {unit}</span>
                </div>
            </div>
            <div className="stat-icon-wrapper" style={{ color: iconColor }}>
                {getIcon()}
            </div>
        </div>
    );
};

export default StatCard;
