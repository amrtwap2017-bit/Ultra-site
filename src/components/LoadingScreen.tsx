import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 600);
          }, 400);
          return 100;
        }
        const increment = prev < 60 ? 3 : prev < 85 ? 2 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-700 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── Grid / axis lines ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#d4af37]/15 to-transparent" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/10 to-transparent" />
        <div
          className="absolute left-0 w-full h-px"
          style={{
            top: 'calc(50% - 58px)',
            background:
              'linear-gradient(90deg, transparent 20%, rgba(212,175,55,0.15) 45%, rgba(212,175,55,0.3) 50%, rgba(212,175,55,0.15) 55%, transparent 80%)',
          }}
        />
        <div
          className="absolute left-0 w-full h-px"
          style={{
            top: 'calc(50% + 52px)',
            background:
              'linear-gradient(90deg, transparent 20%, rgba(212,175,55,0.08) 45%, rgba(212,175,55,0.15) 50%, rgba(212,175,55,0.08) 55%, transparent 80%)',
          }}
        />
        <div className="absolute top-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
        <div className="absolute bottom-[15%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
      </div>

      {/* ── Centered symbol ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-[140px] h-[140px] overflow-visible">

          {/* Deep outer blur */}
          <div
            className="absolute pointer-events-none animate-pulse"
            style={{
              top: '50%',
              left: '50%',
              width: 200,
              height: 200,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 50%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          {/* Inner warm glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: '55%',
              left: '50%',
              width: 80,
              height: 80,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(244,185,66,0.2) 0%, rgba(212,175,55,0.08) 50%, transparent 70%)',
              filter: 'blur(15px)',
              animation: 'pulseGlow 3s ease-in-out infinite',
            }}
          />

          {/* Triangle-shaped glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              width: 100,
              height: 90,
              transform: 'translate(-50%, -45%)',
              background: 'conic-gradient(from 210deg at 50% 35%, transparent 0deg, rgba(212,175,55,0.08) 60deg, transparent 120deg)',
              filter: 'blur(20px)',
              animation: 'pulseGlow 4s ease-in-out infinite 0.5s',
            }}
          />

          {/* Orbit ring */}
          <svg
            viewBox="0 0 140 140"
            className="absolute inset-0 w-full h-full pointer-events-none"
            fill="none"
            style={{ animation: 'spinCW 20s linear infinite' }}
          >
            <circle
              cx="70"
              cy="70"
              r="66"
              stroke="#C6A15B"
              strokeWidth="0.3"
              strokeDasharray="4 8"
              opacity="0.25"
            />
            <circle cx="70" cy="4" r="1.5" fill="#d4af37" opacity="0.6" />
          </svg>

          {/* ── Triangle SVG ── */}
          <svg
            viewBox="0 0 120 120"
            className="absolute z-10 pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              width: 140,
              height: 140,
              transform: 'translate(-50%, -50%)',
            }}
            fill="none"
          >
            <defs>
              <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F4B942" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#C6A15B" stopOpacity="0.7" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer triangle */}
            <polygon
              points="60,12 108,96 12,96"
              stroke="url(#triGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#glow)"
              style={{
                strokeDasharray: 280,
                strokeDashoffset: 280,
                animation: 'drawShape 2.5s cubic-bezier(0.16,1,0.3,1) forwards 0.3s',
              }}
            />

            {/* Corner dots */}
            {[
              { cx: 60, cy: 12, delay: '1.5s' },
              { cx: 108, cy: 96, delay: '1.9s' },
              { cx: 12, cy: 96, delay: '2.3s' },
            ].map(({ cx, cy, delay }, i) => (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="none"
                  stroke="#F4B942"
                  strokeWidth="0.3"
                  style={{
                    opacity: 0,
                    animation: `fadeInDot 0.6s ease forwards ${delay}`,
                  }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="1.5"
                  fill="#F4B942"
                  style={{
                    opacity: 0,
                    animation: `fadeInDot 0.5s ease forwards ${delay}`,
                  }}
                />
              </g>
            ))}

            {/* Center dot */}
            <circle
              cx="60"
              cy="68"
              r="1"
              fill="#C6A15B"
              style={{
                opacity: 0,
                animation: 'fadeInOpacity 1s ease forwards 2s',
              }}
            />
          </svg>

          {/* ── LOGO — sized to fill the triangle like one piece ── */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              width: 100,
              height: 100,
              transform: 'translate(-50%, -46%)',
            }}
          >
            <img
              src="https://ik.imagekit.io/xkzwx3aiw/Logo.png?tr=w-96,f-webp,q-75"
              alt="Triangle Black"
              width={100}
              height={100}
              loading="eager"
              decoding="async"
              className="select-none w-full h-full"
              style={{
                objectFit: 'contain',
                opacity: 0,
                transform: 'scale(0.5)',
                animation: 'logoIn 1s cubic-bezier(0.16,1,0.3,1) forwards 0.6s',
                filter: 'drop-shadow(0 0 15px rgba(212,175,55,0.45))',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Text below ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[85px] text-center px-2">
        <h1
          className="text-2xl sm:text-3xl font-bold leading-none tracking-[0.3em] text-[#d4af37] uppercase"
          style={{
            fontFamily: 'Georgia, serif',
            opacity: 0,
            animation: 'slideUp 0.4s ease forwards 0.9s',
          }}
        >
          TRIANGLE BLACK
        </h1>

        <div
          className="h-px mx-auto mt-2"
          style={{
            width: 220,
            background:
              'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
            opacity: 0,
            transform: 'scaleX(0)',
            animation: 'lineGrow 0.5s ease forwards 1.1s',
          }}
        />

        <p
          className="mt-2 text-[9px] sm:text-[10px] leading-none tracking-[0.35em] text-white/40 uppercase font-sans"
          style={{
            opacity: 0,
            animation: 'slideUp 0.4s ease forwards 1.3s',
          }}
        >
          Hospitality Engineering Initialization
        </p>
      </div>

      <style>{`
        @keyframes drawShape {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeInDot {
          to { opacity: 0.8; }
        }
        @keyframes fadeInOpacity {
          to { opacity: 0.35; }
        }
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spinCW {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          0%   { opacity: 0; transform: scaleX(0); }
          100% { opacity: 1; transform: scaleX(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};