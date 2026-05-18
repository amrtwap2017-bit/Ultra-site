import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translation, Lang } from '../data/content';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  t: Translation;
  setActiveTab: (tab: string) => void;
  currentLang: Lang;
}

interface BackgroundOption {
  id: string;
  nameKey: string;
  url: string;
  srcSet: string;
}

const backgroundOptions: BackgroundOption[] = [
  {
    id: 'corridor',
    nameKey: 'sceneDelivery',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1024&q=55&fm=webp',
    srcSet: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&q=50&fm=webp 640w',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1024&q=55&fm=webp 1024w',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1440&q=60&fm=webp 1440w',
    ].join(', '),
  },
  {
    id: 'hvac',
    nameKey: 'sceneQuality',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1024&q=55&fm=webp',
    srcSet: [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=640&q=50&fm=webp 640w',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1024&q=55&fm=webp 1024w',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1440&q=60&fm=webp 1440w',
    ].join(', '),
  },
  {
    id: 'lounge',
    nameKey: 'sceneTrusted',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1024&q=55&fm=webp',
    srcSet: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=640&q=50&fm=webp 640w',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1024&q=55&fm=webp 1024w',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1440&q=60&fm=webp 1440w',
    ].join(', '),
  },
];

const SLIDE_DURATION = 9000;
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/* ─────────────────────────────────────────────
   BRAND TRIANGLES — Dynamic Golden Outlines
   Premium living logo marks with subtle fill,
   continuous rotation + breathing scale.
   10 triangles total (7 larger + 3 extra small)
───────────────────────────────────────────── */
interface TriData {
  id: string;
  size: number;
  x: string;
  y: string;
  strokeWidth: number;
  baseOpacity: number;
  peakOpacity: number;
  rotateSpeed: number;      // degrees per cycle
  scaleRange: [number, number];
  driftX: number[];
  driftY: number[];
  duration: number;
  delay: number;
}

const TRIANGLES: TriData[] = [
  // Large anchor — top-left
  { id: 't0', size: 58, x: '10%', y: '14%', strokeWidth: 1.1, baseOpacity: 0.05, peakOpacity: 0.14, rotateSpeed: 18, scaleRange: [0.96, 1.04], driftX: [0, 14, 0], driftY: [0, -10, 0], duration: 22, delay: 0 },
  // Medium — top-right
  { id: 't1', size: 42, x: '86%', y: '18%', strokeWidth: 0.95, baseOpacity: 0.06, peakOpacity: 0.16, rotateSpeed: -22, scaleRange: [0.95, 1.05], driftX: [0, -12, 0], driftY: [0, 12, 0], duration: 26, delay: 1.5 },
  // Small accent — far left
  { id: 't2', size: 24, x: '5%', y: '55%', strokeWidth: 0.75, baseOpacity: 0.04, peakOpacity: 0.11, rotateSpeed: 32, scaleRange: [0.94, 1.06], driftX: [0, 9, 0], driftY: [0, -16, 0], duration: 18, delay: 3 },
  // Medium — bottom-right
  { id: 't3', size: 48, x: '91%', y: '70%', strokeWidth: 1.05, baseOpacity: 0.05, peakOpacity: 0.13, rotateSpeed: -28, scaleRange: [0.96, 1.04], driftX: [0, -16, 0], driftY: [0, 9, 0], duration: 24, delay: 0.8 },
  // Tiny — center-top
  { id: 't4', size: 18, x: '34%', y: '9%', strokeWidth: 0.65, baseOpacity: 0.035, peakOpacity: 0.1, rotateSpeed: 45, scaleRange: [0.93, 1.07], driftX: [0, 7, 0], driftY: [0, -8, 0], duration: 16, delay: 4 },
  // Medium — bottom-left
  { id: 't5', size: 36, x: '16%', y: '82%', strokeWidth: 0.9, baseOpacity: 0.05, peakOpacity: 0.14, rotateSpeed: -35, scaleRange: [0.95, 1.05], driftX: [0, 11, 0], driftY: [0, -14, 0], duration: 28, delay: 2.2 },
  // Small — right-center
  { id: 't6', size: 22, x: '78%', y: '46%', strokeWidth: 0.7, baseOpacity: 0.04, peakOpacity: 0.12, rotateSpeed: 38, scaleRange: [0.94, 1.06], driftX: [0, -9, 0], driftY: [0, 7, 0], duration: 20, delay: 3.5 },
  // Extra small — upper-left
  { id: 't7', size: 14, x: '22%', y: '28%', strokeWidth: 0.55, baseOpacity: 0.03, peakOpacity: 0.09, rotateSpeed: 52, scaleRange: [0.92, 1.08], driftX: [0, 5, 0], driftY: [0, -7, 0], duration: 15, delay: 5 },
  // Extra small — lower-right
  { id: 't8', size: 15, x: '72%', y: '76%', strokeWidth: 0.6, baseOpacity: 0.035, peakOpacity: 0.1, rotateSpeed: -48, scaleRange: [0.93, 1.07], driftX: [0, -6, 0], driftY: [0, 10, 0], duration: 19, delay: 1 },
  // Extra small — mid-left
  { id: 't9', size: 13, x: '8%', y: '42%', strokeWidth: 0.5, baseOpacity: 0.03, peakOpacity: 0.08, rotateSpeed: 60, scaleRange: [0.91, 1.09], driftX: [0, 4, 0], driftY: [0, -5, 0], duration: 14, delay: 6 },
];

const BrandTriangle = memo(
  ({ size, x, y, strokeWidth, baseOpacity, peakOpacity, rotateSpeed, scaleRange, driftX, driftY, duration, delay }: Omit<TriData, 'id'>) => {
    const half = size / 2;
    const h = size * 0.866;
    const points = `${half},0 ${size},${h} 0,${h}`;

    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: x,
          top: y,
          marginLeft: -half,
          marginTop: -h / 2,
          willChange: 'transform, opacity',
        }}
        animate={{
          opacity: [baseOpacity, peakOpacity, baseOpacity],
          x: driftX,
          y: driftY,
          rotate: [0, rotateSpeed, 0],
          scale: scaleRange,
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} fill="none">
          {/* Subtle golden fill for depth */}
          <polygon
            points={points}
            fill="rgba(212,175,55,0.015)"
            stroke="#d4af37"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Stronger outer stroke for premium look */}
          <polygon
            points={points}
            fill="none"
            stroke="#d4af37"
            strokeWidth={strokeWidth * 0.6}
            strokeLinejoin="round"
            strokeOpacity={0.6}
          />
        </svg>
      </motion.div>
    );
  }
);
BrandTriangle.displayName = 'BrandTriangle';

/* ─────────────────────────────────────────────
   GOLDEN DUST — soft ambient particles
───────────────────────────────────────────── */
interface DustData {
  id: string;
  x: number;
  y: number;
  size: number;
  driftX: number[];
  driftY: number[];
  opRange: [number, number];
  duration: number;
  delay: number;
}

const DUST: DustData[] = Array.from({ length: 10 }, (_, i) => ({
  id: `dust-${i}`,
  x: 5 + i * 9.5,
  y: 10 + (i % 5) * 18,
  size: 1.2 + (i % 3) * 0.5,
  driftX: [0, (i % 2 === 0 ? 15 : -15), 0],
  driftY: [0, (i % 2 === 0 ? -20 : -10), 0],
  opRange: [0.08, 0.22] as [number, number],
  duration: 10 + (i % 4) * 3,
  delay: (i % 6) * 1.5,
}));

const GoldenDust = memo(
  ({ x, y, size, driftX, driftY, opRange, duration, delay }: Omit<DustData, 'id'>) => (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: 'radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0) 70%)',
        willChange: 'transform, opacity',
      }}
      animate={{
        x: driftX,
        y: driftY,
        opacity: [opRange[0], opRange[1], opRange[0]],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
);
GoldenDust.displayName = 'GoldenDust';

/* ─────────────────────────────────────────────
   WORD REVEAL
───────────────────────────────────────────── */
const WordReveal: React.FC<{
  text: string;
  highlightLastN?: number;
  delay?: number;
}> = ({ text, highlightLastN = 2, delay = 0 }) => {
  const words = text.split(' ');
  const splitIndex = words.length - highlightLastN;

  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 34, rotateX: 40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.65, delay: delay + i * 0.09, ease: EASE }}
          style={{ perspective: 600 }}
        >
          {i >= splitIndex ? (
            <span
              className="italic"
              style={{
                background: 'linear-gradient(135deg,#d4af37 0%,#f0d060 50%,#d4af37 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            >
              {word}
            </span>
          ) : (
            <span className="text-white">{word}</span>
          )}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </motion.span>
      ))}
    </>
  );
};

/* ─────────────────────────────────────────────
   COUNT-UP
───────────────────────────────────────────── */
const CountUp: React.FC<{ value: string; inView: boolean; delay: number }> = ({
  value, inView, delay,
}) => {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '').replace('+', '');
  const hasPlus = value.includes('+');
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView || isNaN(numeric)) { setDisplay(value); return; }
    let start: number | null = null;
    let raf: number;
    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(`${Math.floor(eased * numeric)}${suffix}${hasPlus ? '+' : ''}`);
      if (p < 1) raf = requestAnimationFrame(run);
      else setDisplay(value);
    };
    const t = setTimeout(() => { raf = requestAnimationFrame(run); }, delay * 1000);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [inView, value, numeric, suffix, hasPlus, delay]);

  return <>{display}</>;
};

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
export const Hero: React.FC<HeroProps> = ({ t, setActiveTab, currentLang }) => {
  const [activeBg, setActiveBg] = useState(0);
  const [direction, setDirection] = useState(1);
  const [kpiVisible, setKpiVisible] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const isRtl = currentLang === 'ar';

  useEffect(() => {
    const first = new Image();
    first.src = backgroundOptions[0].url;
    first.onload = () => setImageReady(true);
    first.onerror = () => setImageReady(true);
    backgroundOptions.slice(1).forEach((bg) => { const img = new Image(); img.src = bg.url; });
    const fb = setTimeout(() => setImageReady(true), 4000);
    return () => clearTimeout(fb);
  }, []);

  useEffect(() => {
    if (!imageReady) return;
    const id = setInterval(() => {
      setDirection(1);
      setActiveBg((p) => (p + 1) % backgroundOptions.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [imageReady]);

  useEffect(() => {
    if (!imageReady) return;
    const id = setTimeout(() => setKpiVisible(true), 1200);
    return () => clearTimeout(id);
  }, [imageReady]);

  const handleBgChange = useCallback((index: number) => {
    setDirection(index > activeBg ? 1 : -1);
    setActiveBg(index);
  }, [activeBg]);

  const handleNav = useCallback((id: string) => {
    setActiveTab(id);
    if (id === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }, [setActiveTab]);

  const getSceneName = (key: string) =>
    (t.hero[key as keyof typeof t.hero] as string) || key;

  const bgEnter = (d: number) => ({ opacity: 0, scale: 1.08, x: d > 0 ? 50 : -50 });
  const bgCenter = { opacity: 1, scale: 1.04, x: 0, transition: { duration: 1.2, ease: EASE } };
  const bgExit = (d: number) => ({ opacity: 0, scale: 1, x: d > 0 ? -50 : 50, transition: { duration: 1.0, ease: EASE } });

  const kpis = [
    { val: t.hero.kpi1, sub: t.hero.kpi1Sub },
    { val: t.hero.kpi2, sub: t.hero.kpi2Sub },
    { val: t.hero.kpi3, sub: t.hero.kpi3Sub },
    { val: t.hero.kpi4, sub: t.hero.kpi4Sub },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      {/* base */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* ── background slides ── */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={activeBg}
          custom={direction}
          initial={imageReady ? bgEnter(direction) : { opacity: 0, scale: 1.08, x: 0 }}
          animate={bgCenter}
          exit={bgExit(direction)}
          className="absolute inset-0 z-[1] will-change-transform"
        >
          <motion.img
            src={backgroundOptions[activeBg].url}
            srcSet={backgroundOptions[activeBg].srcSet}
            sizes="100vw"
            alt={getSceneName(backgroundOptions[activeBg].nameKey)}
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageReady ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/15" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>
      </AnimatePresence>

      {/* ── 10 Dynamic Brand Triangles ── */}
      <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden">
        {TRIANGLES.map((tri) => (
          <BrandTriangle key={tri.id} {...tri} />
        ))}
      </div>

      {/* ── golden dust ── */}
      <div className="absolute inset-0 z-[11] pointer-events-none overflow-hidden">
        {DUST.map((d) => (
          <GoldenDust key={d.id} {...d} />
        ))}
      </div>

      {/* ── left scroll label ── */}
      <div className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4 z-20">
        <motion.div
          className="w-px h-20 bg-gradient-to-b from-transparent to-[#d4af37]/40"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: imageReady ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: imageReady ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-[10px] tracking-[0.3em] uppercase text-white/40 [writing-mode:vertical-lr] rotate-180"
        >
          {t.hero.scrollLabel}
        </motion.span>
        <motion.div
          className="w-px h-20 bg-gradient-to-b from-[#d4af37]/40 to-transparent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: imageReady ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'bottom' }}
        />
      </div>

      {/* ── scene selector ── */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: imageReady ? 1 : 0, x: imageReady ? 0 : 16 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute top-28 right-8 z-20 hidden lg:flex flex-col items-end gap-1.5"
      >
        <span className="text-[8px] uppercase tracking-[0.3em] text-neutral-600 font-mono">
          {t.hero.activeScene}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={activeBg}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] text-[#d4af37]/70 font-medium tracking-wider"
          >
            {getSceneName(backgroundOptions[activeBg].nameKey)}
          </motion.span>
        </AnimatePresence>
        <div className="flex gap-1.5 mt-0.5">
          {backgroundOptions.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => handleBgChange(i)}
              aria-label={`Scene ${i + 1}`}
              className={`rounded-full transition-colors duration-300 ${
                i === activeBg ? 'bg-[#d4af37]' : 'bg-neutral-700 hover:bg-neutral-500'
              }`}
              animate={i === activeBg ? { width: 20, height: 4 } : { width: 4, height: 4 }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <div
        className="relative z-20 max-w-6xl mx-auto px-6 lg:px-8 text-center pt-24 pb-32 w-full"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* ── badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 16 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <motion.div
            className="h-px w-8 bg-[#d4af37]/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: imageReady ? 1 : 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{ transformOrigin: 'right' }}
          />

          <motion.div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
                       bg-neutral-900/80 border border-[#d4af37]/30 backdrop-blur-sm
                       text-[#d4af37] text-[10px] uppercase tracking-[0.25em] font-medium
                       shadow-[0_0_20px_rgba(212,175,55,0.06)]"
            whileHover={{
              scale: 1.05,
              borderColor: 'rgba(212,175,55,0.55)',
              boxShadow: '0 0 28px rgba(212,175,55,0.12)',
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              className="flex items-center justify-center relative"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 8px 2px rgba(212,175,55,0.3)' }}
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              />
            </motion.span>

            <span>{t.hero.badge}</span>

            <motion.svg
              width="10"
              height="9"
              viewBox="0 0 10 9"
              fill="none"
              className="text-[#d4af37]"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <polygon
                points="5,0.5 9.5,8.5 0.5,8.5"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeLinejoin="round"
              />
            </motion.svg>

            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
            </span>
          </motion.div>

          <motion.div
            className="h-px w-8 bg-[#d4af37]/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: imageReady ? 1 : 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>

        {/* ── headline ── */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-8">
          {imageReady && (
            <WordReveal text={t.hero.headline} highlightLastN={2} delay={0.2} />
          )}
        </h1>

        {/* ── description ── */}
        <motion.p
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{
            opacity: imageReady ? 1 : 0,
            y: imageReady ? 0 : 18,
            filter: imageReady ? 'blur(0px)' : 'blur(6px)',
          }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
          className="max-w-2xl mx-auto text-sm sm:text-base text-white/70 mb-10 leading-relaxed"
        >
          {t.hero.desc}
        </motion.p>

        {/* ── CTA buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 18 }}
          transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            onClick={() => handleNav('contact')}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#e6ca65]
                       text-black font-bold text-sm uppercase tracking-wider rounded-full overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: '0 18px 38px rgba(212,175,55,0.35)' }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-150%' }}
              whileHover={{ x: '150%' }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
            <span className="relative flex items-center gap-2">
              {t.hero.ctaPrimary}
              <motion.span
                className="flex"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleNav('projects')}
            className="px-8 py-4 border border-white/20 text-white font-bold
                       text-sm uppercase tracking-wider rounded-full"
            whileHover={{
              scale: 1.05,
              borderColor: 'rgba(212,175,55,0.5)',
              color: '#d4af37',
              boxShadow: '0 0 24px rgba(212,175,55,0.1)',
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            {t.hero.ctaSecondary}
          </motion.button>
        </motion.div>

        {/* ── KPI stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              className="text-center cursor-default"
              whileHover={{ scale: 1.07, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-[#d4af37] font-serif">
                <CountUp value={kpi.val} inView={kpiVisible} delay={i * 0.12} />
              </div>
              <motion.div
                className="h-px bg-[#d4af37]/30 mx-auto mt-2 mb-1"
                initial={{ width: 8 }}
                whileHover={{ width: 32 }}
                transition={{ duration: 0.35 }}
              />
              <div className="text-[10px] text-white/50 uppercase tracking-wider mt-1">
                {kpi.sub}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageReady ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => handleNav('about')}
          role="button"
          aria-label="Scroll to about"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNav('about')}
        >
          <motion.span
            className="text-[9px] uppercase tracking-[0.3em] text-white/30
                       group-hover:text-[#d4af37]/60 transition-colors duration-300"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {t.hero.scrollLabel}
          </motion.span>
          <div
            className="w-5 h-8 rounded-full border border-white/20
                       group-hover:border-[#d4af37]/40 flex items-start
                       justify-center pt-1 transition-colors duration-300"
          >
            <motion.div
              className="w-0.5 h-2 rounded-full bg-[#d4af37]/60"
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};