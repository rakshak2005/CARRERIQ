import React from 'react';

interface ScoreMeterProps {
  score: number;
  size?: number;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({ score = 0, size = 180 }) => {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color theme based on score value
  let scoreColor = '#ef4444'; // Red (Default low)
  let glowColor = 'rgba(239, 68, 68, 0.4)';
  let gradientId = 'scoreGradLow';

  if (score >= 80) {
    scoreColor = '#10b981'; // Green
    glowColor = 'rgba(16, 185, 129, 0.4)';
    gradientId = 'scoreGradHigh';
  } else if (score >= 50) {
    scoreColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
    gradientId = 'scoreGradMid';
  }

  return (
    <div 
      className="score-meter-container" 
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="scoreGradHigh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="scoreGradMid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="scoreGradLow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          {/* Shadow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subcard)"
          strokeWidth={strokeWidth}
        />

        {/* Foreground animated value indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${glowColor})`
          }}
        />
      </svg>

      {/* Value Overlay */}
      <div 
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span 
          style={{
            fontSize: `${size * 0.22}px`,
            fontWeight: 800,
            color: 'var(--color-text-title)',
            lineHeight: 1
          }}
        >
          {score}
        </span>
        <span 
          style={{
            fontSize: `${size * 0.06}px`,
            fontWeight: 600,
            color: scoreColor,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: '4px'
          }}
        >
          {score >= 80 ? 'Job Ready' : score >= 50 ? 'Improving' : 'Needs Focus'}
        </span>
      </div>
    </div>
  );
};
