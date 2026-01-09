import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const AlertsTable = ({ alerts }) => {
    const getStatusClass = (status, severity) => {
        if (severity === 'danger') return 'danger';
        if (severity === 'warning') return 'warning';
        if (status.toLowerCase() === 'acknowledged' || status.toLowerCase() === 'resolved') return 'success';
        return 'warning';
    };

    if (!alerts || alerts.length === 0) {
        return (
            <div className="alerts-card">
                <div className="alerts-header">
                    <AlertTriangle size={16} className="alert-icon" />
                    <span>Recent Alerts</span>
                </div>
                <div className="alerts-empty">
                    <CheckCircle size={48} className="empty-icon" />
                    <p>No alerts at this time</p>
                    <span className="empty-subtitle">All systems operating normally</span>
                </div>
            </div>
        );
    }

    return (
        <div className="alerts-card">
            <div className="alerts-header">
                <AlertTriangle size={16} className="alert-icon" />
                <span>Recent Alerts</span>
            </div>
            <div className="alerts-table-wrapper">
                <table className="alerts-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((alert, index) => (
                            <tr key={index} className="alert-row">
                                <td className="alert-time">
                                    {new Date(alert.timestamp).toISOString().replace('T', ' ').slice(0, 19)}Z
                                </td>
                                <td className="alert-type">{alert.type}</td>
                                <td>
                                    <span className={`status-pill ${getStatusClass(alert.status, alert.severity)}`}>
                                        {alert.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlertsTable;
