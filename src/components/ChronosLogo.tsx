import React from 'react';
import chronosLogoImg from '../assets/images/chronos_logo_1791986871032.jpg';

interface ChronosLogoProps {
  className?: string;
  size?: number;
  accent?: string;
  accentLight?: string;
  dynamic?: boolean;
  showGlow?: boolean;
}

export const ChronosLogo: React.FC<ChronosLogoProps> = ({
  className = '',
  size = 32,
  accent,
  accentLight,
  dynamic = true,
  showGlow = true,
}) => {
  const primaryAccent = accent || 'var(--theme-accent, #d97736)';
  const secondaryAccent = accentLight || 'var(--theme-accent-light, #f39c55)';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none group ${className}`}
      style={{ width: size, height: size }}
      title="Chronos Astronomical Operating System"
    >
      {/* Outer Dynamic Radial Ambient Aura */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 transition-opacity duration-700 group-hover:opacity-80 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${secondaryAccent} 0%, ${primaryAccent} 50%, transparent 80%)`,
            transform: 'scale(1.25)',
          }}
        />
      )}

      {/* Dynamic Pulsing Orbit Ring */}
      {dynamic && (
        <div
          className="absolute inset-[-2px] rounded-full border border-dashed transition-all duration-500 pointer-events-none"
          style={{
            borderColor: primaryAccent,
            opacity: 0.35,
            animation: 'chronos-orbit 60s linear infinite',
          }}
        />
      )}

      {/* Main Dynamic Rotating Astronomical Chronometer Disk */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl flex items-center justify-center border transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          borderColor: `rgba(217, 119, 54, 0.4)`,
          boxShadow: `0 0 16px rgba(217, 119, 54, 0.25), inset 0 0 8px rgba(0, 0, 0, 0.6)`,
        }}
      >
        <img
          src={chronosLogoImg}
          alt="Chronos Ancient Astronomical Mechanism"
          className={`w-full h-full object-cover rounded-full pointer-events-none ${
            dynamic ? 'animate-chronos-mechanism' : ''
          }`}
          style={{
            filter: 'contrast(1.1) brightness(1.05)',
            willChange: 'transform',
          }}
        />

        {/* Dynamic Glass Shimmer Reflection */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)',
          }}
        />

        {/* Inner Fine Brass Bevel Border */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none border"
          style={{
            borderColor: 'rgba(255, 215, 0, 0.25)',
          }}
        />
      </div>
    </div>
  );
};
