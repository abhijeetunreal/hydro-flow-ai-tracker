
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
      };
  });

  return (
    <div className="relative w-48 h-72 border-4 border-gray-300 rounded-t-xl rounded-b-lg flex items-end justify-center">
      {/* Water */}
      <div
        className="absolute bottom-0 w-full bg-primary transition-all duration-1000 ease-in-out"
        style={{ height: `${fillPercentage}%`, borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}
      >
        {/* Reflection */}
        <div className="absolute top-2 left-2 w-4 h-1/4 bg-white/30 rounded-full opacity-50 transform -rotate-12" />
      </div>

      {/* Log Markers */}
      {logMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute w-full flex items-center z-5"
          style={{ bottom: `${marker.level}%`, transform: 'translateY(50%)' }}
        >
          <div className="w-full h-px bg-primary-foreground/30"></div>
          <span className="absolute right-full mr-2 text-xs text-muted-foreground whitespace-nowrap">
            {marker.time}
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
