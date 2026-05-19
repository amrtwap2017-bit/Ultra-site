// LoadingScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/Logo.png';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut]                           = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile]                         = useState(false);
  const hasCompleted                                    = useRef(false);

  const hasVisited = useRef(
    typeof window !== 'undefined' &&
    !!sessionStorage.getItem('tb-loader')
  );

  // ── Skip if already visited ──
  useEffect(() => {
    if (hasVisited.current) onComplete();
  }, [onComplete]);

  // ── Reduced motion ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // ── Mobile detection ──
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // ── Simple timeline: show 2.2s → fade 0.5s ──
  useEffect(() => {
    if (hasVisited.current) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem('tb-loader', '1');
      setFadeOut(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reduced motion shortcut ──
  const r = prefersReducedMotion;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!fadeOut}
      onTransitionEnd={(e) => {
        if (
          fadeOut &&
          !hasCompleted.current &&
          e.target === e.currentTarget &&
          e.propertyName === 'opacity'
        ) {
          hasCompleted.current = true;
          onComplete();
        }
      }}
      className={`lb-root ${fadeOut ? 'lb-root--out' : ''}`}
    >
      {/* ── Axis lines ── */}
      <div className="lb-axis-layer" aria-hidden="true">
        <div className="lb-axis-vertical" />
        <div className="lb-axis-h1" />
        <div className="lb-axis-h2" />
        <div className="lb-axis-top" />
        <div className="lb-axis-bottom" />
      </div>

      {/* ── Centred stage ── */}
      <div className="lb-stage" aria-hidden="true">
        <div className="lb-symbol">

          {/* Ambient glow — desktop only, appears with logo */}
          {!isMobile && (
            <div 
              className="lb-glow-outer"
              style={{
                animation: r 
                  ? 'none' 
                  : 'glowCircleIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            />
          )}

          {/* Orbit ring — appears after all elements at 1.4s */}
          {!isMobile && (
            <svg
              viewBox="0 0 180 180"
              className="lb-orbit"
              fill="none"
              aria-hidden="true"
              style={{
                animation: r 
                  ? 'fadeOnly 0.2s ease forwards' 
                  : 'orbitShootIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards 1.4s',
              }}
            >
              <circle
                cx="90" cy="90" r="86"
                stroke="#C6A15B"
                strokeWidth="0.3"
                strokeDasharray="4 10"
                opacity="0.18"
              />
              <circle cx="90" cy="4" r="1.5" fill="#d4af37" opacity="0.4" />
            </svg>
          )}

          {/* ── Triangle SVG ── */}
          <svg
            viewBox="0 0 140 140"
            className="lb-triangle-svg"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#d4af37" stopOpacity="0.9" />
                <stop offset="50%"  stopColor="#F4B942" stopOpacity="1"   />
                <stop offset="100%" stopColor="#C6A15B" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Triangle draws fast — 0.7s */}
            <path
              d="M 70 18 L 118 108 L 22 108 Z"
              stroke="url(#triGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="lb-triangle-path"
              style={{
                animation: r
                  ? 'drawTriangleFast 0.3s ease forwards'
                  : 'drawTriangleSmooth 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
              }}
            />

            {/* Corner dots — appear immediately after triangle */}
            {[
              { cx: 70,  cy: 18,  delay: '0.5s' },
              { cx: 118, cy: 108, delay: '0.6s' },
              { cx: 22,  cy: 108, delay: '0.7s' },
            ].map(({ cx, cy, delay }, i) => (
              <g key={i} aria-hidden="true">
                <circle
                  cx={cx} cy={cy} r="5.5"
                  fill="none" stroke="#F4B942" strokeWidth="0.4"
                  className="lb-dot"
                  style={{ animation: `fadeInDot 0.3s ease forwards ${r ? '0s' : delay}` }}
                />
                <circle
                  cx={cx} cy={cy} r="3.5"
                  fill="none" stroke="#F4B942" strokeWidth="0.5"
                  className="lb-dot"
                  style={{ animation: `fadeInDot 0.3s ease forwards ${r ? '0s' : delay}` }}
                />
                <circle
                  cx={cx} cy={cy} r="1.8"
                  fill="#F4B942"
                  className="lb-dot"
                  style={{ animation: `fadeInDot 0.3s ease forwards ${r ? '0s' : delay}` }}
                />
              </g>
            ))}
          </svg>

          {/* ── Logo + glow — appears together at start ── */}
          <div className="lb-logo-wrap">
            <div
              className="lb-logo-glow"
              aria-hidden="true"
              style={{
                animation: r ? 'none' : 'glowPulseIn 0.6s ease-out forwards',
              }}
            />
            <img
              src={logo}
              alt="Triangle Black luxury brand logo"
              width={160}
              height={180}
              loading="eager"
              decoding="async"
              className="lb-logo-img"
              style={{
                animation: r
                  ? 'logoIn 0.2s ease forwards'
                  : 'logoIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
              }}
            />
          </div>
        </div>

        {/* ── Brand text — appears as logo settles ── */}
        <div className="lb-text-block">
          <h1
            className="lb-brand-name"
            style={{
              animation: r
                ? 'fadeOnly 0.2s ease forwards'
                : 'slideUp 0.4s ease forwards 0.6s',
            }}
          >
            TRIANGLE BLACK
          </h1>

          <div
            className="lb-divider"
            style={{
              animation: r
                ? 'fadeOnly 0.2s ease forwards'
                : 'lineGrow 0.4s ease forwards 0.8s',
            }}
          />

          <p
            className="lb-tagline"
            style={{
              animation: r
                ? 'fadeOnly 0.2s ease forwards'
                : 'slideUp 0.4s ease forwards 1.0s',
            }}
          >
            Hospitality Engineering Initialization
          </p>
        </div>
      </div>

      <span className="sr-only">Loading Triangle Black, please wait…</span>
    </div>
  );
};