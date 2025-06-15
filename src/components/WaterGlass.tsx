
import React from 'react';
import { format } from 'date-fns';

type Log = {
  amount: number;
  time: string;
};

interface WaterGlassProps {
  intake: number;
  goal: number;
  logs: Log[];
}

const WaterGlass: React.FC<WaterGlassProps> = ({ intake, goal, logs = [] }) => {
  const fillPercentage = goal > 0 ? Math.min((intake / goal) * 100, 100) : 0;

  let cumulativeIntake = 0;
  const logMarkers = logs.map(log => {
      cumulativeIntake += log.amount;
      const logIntakeLevel = goal > 0 ? Math.min((cumulativeIntake / goal) * 100, 100) : 0;
      return {
          level: logIntakeLevel,
          time: format(new Date(log.time), 'p'),
          amount: log.amount,
      };
  });

  const bubbles = React.useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    x: Math.random() * 70 + 45, // Random x within the glass body
    duration: `${Math.random() * 5 + 4}s`,
    delay: `${Math.random() * 5}s`,
    size: Math.random() * 3 + 1,
  })), []);
  
  const glassPath = "M45,260 L35,10 L125,10 L115,260Z";

  return (
    <div className="relative w-48 h-72">
      <svg viewBox="0 0 160 270" className="w-full h-full drop-shadow-lg">
        <defs>
          <clipPath id="glassClip">
            <path d={glassPath} />
          </clipPath>
        </defs>

        {/* Water and bubbles */}
        <g clipPath="url(#glassClip)">
          <rect
            x="0"
            y={270 * (1 - fillPercentage / 100)}
            width="160"
            height={270 * (fillPercentage / 100)}
            className="fill-primary/80 transition-all duration-1000 ease-in-out"
          />

          {/* Bubbles in SVG */}
          {fillPercentage > 0 && bubbles.map((bubble, i) => (
            <g key={i} className="animate-bubble-rise" style={{ animationDuration: bubble.duration, animationDelay: bubble.delay, transformBox: 'fill-box', transformOrigin: 'bottom' }}>
              <circle
                cx={bubble.x}
                cy="265"
                r={bubble.size}
                className="fill-white/30"
              />
            </g>
          ))}
        </g>
        
        {/* Glass Outline */}
        <path d={glassPath} className="stroke-white/20 fill-white/10 stroke-2" />

        {/* Glass Base */}
        <path d="M45,260 L115,260 L113,255 C90,240 70,240 47,255 Z" className="fill-white/20" />

        {/* Reflection */}
        <path d="M45,15 L50,255" className="stroke-white/20 stroke-2 fill-none opacity-70" />
        <path d="M115,15 L110,255" className="stroke-white/20 stroke-2 fill-none opacity-70" />
      </svg>
      
      {/* Log Markers */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {logMarkers.map((marker, index) => (
          <div
            key={index}
            className="absolute w-[calc(100%-20px)] left-[10px] flex items-center z-10"
            style={{ 
              bottom: `${marker.level}%`, 
              transform: 'translateY(50%)',
            }}
          >
            <div className="w-full h-px bg-primary-foreground/30"></div>
            <span className="absolute right-full mr-2 text-xs text-muted-foreground whitespace-nowrap bg-background/50 px-1 rounded pointer-events-auto">
              +{marker.amount}ml, {marker.time}
            </span>
          </div>
        ))}
      </div>

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center pb-8 pointer-events-none">
        <p className="text-4xl font-bold text-primary-foreground drop-shadow-md">
          {Math.round(fillPercentage)}%
        </p>
        <p className="text-sm text-primary-foreground/80 drop-shadow-md">
          {intake} / {goal} ml
        </p>
      </div>
    </div>
  );
};

export default WaterGlass;
