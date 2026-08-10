import React from 'react';
import { motion } from 'motion/react';

interface CygnusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showText?: boolean;
}

export const CygnusLogo: React.FC<CygnusLogoProps> = ({
  size = 'md',
  animated = true,
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    sm: { box: 'w-6 h-6', svg: 18, text: 'text-xs' },
    md: { box: 'w-8 h-8', svg: 24, text: 'text-sm' },
    lg: { box: 'w-12 h-12', svg: 36, text: 'text-lg' },
    xl: { box: 'w-20 h-20', svg: 56, text: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${currentSize.box} flex items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-950 via-indigo-950 to-slate-900 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 group overflow-hidden`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/10 opacity-70 group-hover:opacity-100 transition-opacity blur-xs" />
        
        {/* Cygnus SVG Constellation Wing Logo */}
        <motion.svg
          width={currentSize.svg}
          height={currentSize.svg}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 text-cyan-400"
          animate={animated ? { rotate: [0, 2, -2, 0] } : {}}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Main Cygnus Wing paths */}
          <path
            d="M16 3L20 12L29 16L20 20L16 29L12 20L3 16L12 12L16 3Z"
            fill="url(#cygnus-gradient)"
            opacity="0.9"
          />
          {/* Inner core diamond */}
          <path
            d="M16 9L18.5 14.5L24 16L18.5 17.5L16 23L13.5 17.5L8 16L13.5 14.5L16 9Z"
            fill="#38BDF8"
          />
          {/* Constellation Nodes */}
          <circle cx="16" cy="3" r="1.5" fill="#E0F2FE" />
          <circle cx="29" cy="16" r="1.5" fill="#E0F2FE" />
          <circle cx="3" cy="16" r="1.5" fill="#E0F2FE" />
          <circle cx="16" cy="29" r="1.5" fill="#E0F2FE" />
          <circle cx="16" cy="16" r="2" fill="#FFFFFF" />

          <defs>
            <linearGradient id="cygnus-gradient" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 uppercase ${currentSize.text}`}>
            CYGNUS<span className="text-cyan-400 font-light ml-1">AI</span>
          </span>
        </div>
      )}
    </div>
  );
};
