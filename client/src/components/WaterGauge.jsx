import React from 'react';

const WaterGauge = ({ percentage }) => {
    // SVG configuration
    const size = 250;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    // Angle calculations for a 270-degree gauge (-135 to +135 degrees)
    // Total circumference for calculations
    const circumference = 2 * Math.PI * radius;

    // We want a partial circle (open at bottom)
    // Let's use a simpler approach for the arc: 
    // Start from bottom-left (135deg) to bottom-right (45deg is 360+45, so 405deg?) 
    // Actually, let's just do a standard CSS dashoffset trick or SVG path.
    // Standard Gauge: 0% is at -225deg, 100% is at 45deg (270 degree span)

    const offset = circumference - ((percentage / 100) * (circumference * 0.75));
    const emptyOffset = circumference * 0.25; // Hide the bottom 25%

    // Rotation to position the gap at the bottom
    const rotation = 'rotate(135deg)';

    return (
        <div style={{ position: 'relative', width: size, height: size, textAlign: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
                {/* Background Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={emptyOffset}
                    strokeLinecap="round"
                />
                {/* Progress Arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset > emptyOffset ? offset : emptyOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>

            {/* Needle/Pointer - Visual only, pointing based on percentage */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: `rotate(${-135 + (percentage * 2.7)}deg)`,
                    transition: 'transform 0.5s ease-in-out',
                    pointerEvents: 'none'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    width: 6,
                    height: '35%',
                    background: '#1e3a8a',
                    transform: 'translateX(-50%)',
                    borderRadius: '4px 4px 0 0',
                    transformOrigin: 'bottom center'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 16,
                    height: 16,
                    background: '#1e3a8a',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%'
                }} />
            </div>

            <div style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: '#1f2937' }}>
                    {percentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: '1rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Water Level
                </div>
            </div>
        </div>
    );
};

export default WaterGauge;
