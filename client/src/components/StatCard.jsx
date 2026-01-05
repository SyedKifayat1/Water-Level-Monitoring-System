import React from 'react';
import { Battery, Signal } from 'lucide-react';

const StatCard = ({ label, value, unit, type }) => {
    const getIcon = () => {
        switch (type) {
            case 'battery':
                return <Battery className="stat-icon" size={24} />;
            case 'distance':
                return <Signal className="stat-icon" size={24} />;
            default:
                return null;
        }
    };

    return (
        <div className="stat-card">
            <div className="stat-content">
                <h3>{label}</h3>
                <div className="stat-value">
                    {value}
                    <span className="stat-unit">{unit}</span>
                </div>
            </div>
            {getIcon()}
        </div>
    );
};

export default StatCard;
