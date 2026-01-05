import React from 'react';

const AlertsTable = ({ alerts }) => {
    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'active': return 'danger';
            case 'acknowledged': return 'success';
            default: return 'warning';
        }
    };

    return (
        <div className="alerts-card">
            <div className="alerts-header">
                Recent Alerts
            </div>
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
                        <tr key={index}>
                            <td>{alert.timestamp}</td>
                            <td>{alert.type}</td>
                            <td>
                                <span className={`status-pill ${getStatusClass(alert.status)}`}>
                                    {alert.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AlertsTable;
