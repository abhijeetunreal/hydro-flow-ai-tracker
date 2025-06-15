
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
  const fillPercentage = Math.min((intake / goal) * 100, 100);

  let cumulativeIntake = 0;
  const logMarkers = logs.map(log => {
      cumulativeIntake += log.amount;
      const logIntakeLevel = Math.min((cumulativeIntake / goal) * 100, 100);
      return {
          level: logIntakeLevel,
          time: format(new Date(log.time), 'p'),
          amount: log.amount,
      };
  });

  const bubbles = React.useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
    left: `${Math.random() * 90 + 5}%`,
    duration: `${Math.random() * 5 + 3}s`,
    delay: `${Math.random() * 5}s`,
    size: `${Math.random() * 8 + 4}px`,
  })), []);

  return (
    <div className="relative w-48 h-72 rounded-t-3xl rounded-b-xl bg-white/10 border-t-8 border-x-2 border-b-4 border-white/20 shadow-xl backdrop-blur-sm flex items-end justify-center">
      {/* Water */}
      <div
        className="absolute bottom-0 w-full bg-primary/80 transition-all duration-1000 ease-in-out overflow-hidden"
        style={{ height: `${fillPercentage}%`, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}
      >
        {/* Bubbles */}
        {fillPercentage > 0 && bubbles.map((bubble, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-white/30 rounded-full animate-bubble-rise"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDuration: bubble.duration,
              animationDelay: bubble.delay,
            }}
          />
        ))}
        {/* Reflection */}
        <div className="absolute top-2 left-2 w-4 h-1/4 bg-white/30 rounded-full opacity-50 transform -rotate-12" />
      </div>

      {/* Log Markers */}
      {logMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute w-full flex items-center z-10"
          style={{ bottom: `${marker.level}%`, transform: 'translateY(50%)' }}
        >
          <div className="w-full h-px bg-primary-foreground/30"></div>
          <span className="absolute right-full mr-2 text-xs text-muted-foreground whitespace-nowrap">
            +{marker.amount}ml, {marker.time}
          </span>
        </div>
      ))}

      {/* Text Overlay */}
      <div className="relative z-10 text-center pb-8">
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

