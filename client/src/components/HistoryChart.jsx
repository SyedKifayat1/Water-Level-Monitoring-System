import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';

const HistoryChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <div className="tooltip-time">
                        <Clock size={14} />
                        {label}
                    </div>
                    <div className="tooltip-value">
                        <span className="tooltip-label">Water Level:</span>
                        <span className="tooltip-number">{payload[0].value.toFixed(1)}%</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return (
            <div className="chart-card">
                <div className="chart-header">
                    <TrendingUp size={20} />
                    <h3>Water Level History</h3>
                </div>
                <div className="chart-empty">
                    <p>No historical data available</p>
                    <span className="empty-subtitle">Data will appear here once readings are received</span>
                </div>
            </div>
        );
    }

    // Calculate average for reference line
    const average = data.reduce((sum, item) => sum + (item.percentage || 0), 0) / data.length;

    return (
        <div className="chart-card">
            <div className="chart-header">
                <h3>Water Level (%) - In seconds</h3>
            </div>
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 20,
                            left: 0,
                            bottom: 10,
                        }}
                    >
                        <defs>
                            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#e2e8f0" 
                            vertical={false}
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                            tickMargin={12}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                            domain={[0, 100]}
                            tickMargin={8}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine 
                            y={average} 
                            stroke="#94a3b8" 
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{ value: `Avg: ${average.toFixed(1)}%`, position: 'right', fill: '#64748b', fontSize: 11 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#waterGradient)"
                            dot={false}
                            activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoryChart;
