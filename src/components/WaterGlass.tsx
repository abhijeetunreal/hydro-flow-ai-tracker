
import React from 'react';

interface WaterGlassProps {
  intake: number;
  goal: number;
}

const WaterGlass: React.FC<WaterGlassProps> = ({ intake, goal }) => {
  const fillPercentage = goal > 0 ? Math.min((intake / goal) * 100, 100) : 0;
  
  const glassPath = "M45,260 L35,40 C35,20 125,20 125,40 L115,260Z";
  const waterY = 270 * (1 - fillPercentage / 100);

  const crystals = React.useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    x: Math.random() * 70 + 45,
    duration: `${Math.random() * 5 + 6}s`,
    delay: `${Math.random() * 7}s`,
    size: Math.random() * 2 + 1,
  })), []);
  
  return (
    <div className="relative w-40 h-64 md:w-48 md:h-72">
      <svg viewBox="0 0 160 270" className="w-full h-full drop-shadow-[0_8px_12px_hsl(var(--primary)/0.15)]">
        <defs>
          <clipPath id="glassClip">
            <path d={glassPath} />
          </clipPath>
          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary)/0.8)" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>

        {/* Water and waves */}
        <g clipPath="url(#glassClip)">
          {/* Main water body */}
          <rect
            x="0"
            y={waterY}
            width="160"
            height={270 - waterY}
            fill="url(#waterGradient)"
            className="transition-all duration-1000 ease-in-out"
          />

           {/* Ice Crystals in SVG */}
          {fillPercentage > 0 && crystals.map((crystal, i) => (
            <g key={i} className="animate-ice-crystal-rise" style={{ animationDuration: crystal.duration, animationDelay: crystal.delay, transformBox: 'fill-box', transformOrigin: 'bottom' }}>
              <circle
                cx={crystal.x}
                cy="265"
                r={crystal.size}
                className="fill-white/40"
              />
            </g>
          ))}

          {/* Animated Wave */}
          {fillPercentage > 0 && (
            <path
              d={`M-160,${waterY + 5} Q-80,${waterY - 15}, 0,${waterY + 5} T160,${waterY + 5} T320,${waterY + 5} T480,${waterY + 5}`}
              fill="hsl(var(--primary) / 0.3)"
              className="animate-wave"
              style={{ width: '300%' }}
            />
          )}
        </g>
        
        {/* Glass Outline */}
        <path d={glassPath} className="stroke-primary/20 fill-blue-100/20 stroke-2" />

        {/* Metallic Rim */}
        <path d="M35,40 C35,20 125,20 125,40 C125,35 35,35 35,40" className="fill-slate-300/20" />
        <path d="M36,38 C36,22 124,22 124,38 C124,34 36,34 36,38" className="fill-slate-400/30" />

        {/* Glass Base */}
        <path d="M45,260 L115,260 L113,255 C90,240 70,240 47,255 Z" className="fill-primary/10" />

        {/* Reflection */}
        <path d="M55,50 L60,245" className="stroke-white/30 stroke-1 fill-none opacity-50" />
      </svg>
    </div>
  );
};

export default WaterGlass;
