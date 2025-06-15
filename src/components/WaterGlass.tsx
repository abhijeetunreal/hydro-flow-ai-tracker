
import React from 'react';

interface WaterGlassProps {
  intake: number;
  goal: number;
}

const WaterGlass: React.FC<WaterGlassProps> = ({ intake, goal }) => {
  const fillPercentage = Math.min((intake / goal) * 100, 100);

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
