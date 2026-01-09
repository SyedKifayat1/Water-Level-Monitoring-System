import React from 'react';
import { Droplet } from 'lucide-react';

const WaterGauge = ({ percentage }) => {
  // SVG configuration
  const size = 300;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // 270-degree arc (3/4 circle)
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;

  // Clamp percentage
  const progress = Math.max(0, Math.min(100, percentage || 0));

  // Dash offset: full arc → empty, zero offset → full
  const dashOffset = arcLength * (1 - progress / 100);

  // Color logic
  const getColor = (pct) => {
    if (pct <= 0) return '#ef4444';
    if (pct < 20) return '#ef4444';
    if (pct < 50) return '#f59e0b';
    if (pct < 80) return '#3b82f6';
    return '#10b981';
  };

  const gaugeColor = getColor(progress);

  // Needle rotation (-135° → +135°)
  const needleRotation = -135 + progress * 2.7;

  return (
    <div className="water-gauge-container">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="gauge-svg"
      >
        <defs>
          <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="gaugeShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(135 ${center} ${center})`}
          filter="url(#gaugeShadow)"
        />

        {/* Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(135 ${center} ${center})`}
          filter="url(#gaugeGlow)"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>

      {/* Needle */}
      <div
        className="gauge-needle"
        style={{
          transform: `translate(-50%, -50%) rotate(${needleRotation}deg)`,
        }}
      >
        <div className="needle-line" />
        <div className="needle-center" />
      </div>

      {/* Percentage Display */}
      <div className="gauge-display">
        <div className="gauge-percentage" style={{ color: gaugeColor }}>
          {progress.toFixed(1)}%
        </div>
        <div className="gauge-label">Water Level (%)</div>
      </div>

      {/* Scale Markers */}
      <div className="gauge-markers">
        <div className="marker marker-0">0</div>
        <div className="marker marker-25">25</div>
        <div className="marker marker-50">50</div>
        <div className="marker marker-75">75</div>
        <div className="marker marker-100">100</div>
      </div>
    </div>
  );
};

export default WaterGauge;
