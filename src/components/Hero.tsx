import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useMemo,
  useRef,
} from 'react';
import {
  AnimatePresence,
  useReducedMotion,
  LazyMotion,
  domAnimation,
  m,
} from 'framer-motion';
import { Translation, Lang } from '../data/content';
import { ArrowRight, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
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
  avifUrl?: string;
}

/* ─────────────────────────────────────────────
   CONSTANTS — defined outside component to
   prevent recreation on every render
───────────────────────────────────────────── */
const SLIDE_DURATION = 9000;
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

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

/* ─────────────────────────────────────────────
   TRIANGLE DATA — reduced to 4 (from 7)
   for balanced GPU load while preserving
   the atmospheric brand geometry
───────────────────────────────────────────── */
interface TriData {
  id: string;
  size: number;
  x: string;
  y: string;
  strokeWidth: number;
  baseOpacity: number;
  peakOpacity: number;
  rotateTo: number;
  driftX: number[];
  driftY: number[];
  duration: number;
  delay: number;
}

const TRIANGLES: TriData[] = [
  {
    id: 't0',
    size: 54,
    x: '12%',
    y: '16%',
    strokeWidth: 0.8,
    baseOpacity: 0.05,
    peakOpacity: 0.13,
    rotateTo: 25,
    driftX: [0, 12, 0],
    driftY: [0, -8, 0],
    duration: 20,
    delay: 0,
  },
  {
    id: 't1',
    size: 38,
    x: '84%',
    y: '20%',
    strokeWidth: 0.7,
    baseOpacity: 0.06,
    peakOpacity: 0.15,
    rotateTo: -20,
    driftX: [0, -10, 0],
    driftY: [0, 10, 0],
    duration: 24,
    delay: 3,
  },
  {
    id: 't3',
    size: 44,
    x: '90%',
    y: '72%',
    strokeWidth: 0.8,
    baseOpacity: 0.04,
    peakOpacity: 0.12,
    rotateTo: -35,
    driftX: [0, -14, 0],
    driftY: [0, 8, 0],
    duration: 22,
    delay: 1.5,
  },
  {
    id: 't5',
    size: 32,
    x: '18%',
    y: '80%',
    strokeWidth: 0.7,
    baseOpacity: 0.04,
    peakOpacity: 0.12,
    rotateTo: -50,
    driftX: [0, 10, 0],
    driftY: [0, -12, 0],
    duration: 26,
    delay: 4,
  },
];

/* ─────────────────────────────────────────────
   DUST DATA — reduced to 5 (from 10)
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

const DUST: DustData[] = [
  { id: 'dust-0', x: 8,  y: 15, size: 1.5, driftX: [0, 14, 0],  driftY: [0, -18, 0], opRange: [0.08, 0.2],  duration: 14, delay: 0   },
  { id: 'dust-1', x: 27, y: 55, size: 1.2, driftX: [0, -12, 0], driftY: [0, -10, 0], opRange: [0.06, 0.18], duration: 17, delay: 2   },
  { id: 'dust-2', x: 58, y: 22, size: 1.8, driftX: [0, 10, 0],  driftY: [0, -22, 0], opRange: [0.08, 0.22], duration: 12, delay: 4.5 },
  { id: 'dust-3', x: 75, y: 68, size: 1.3, driftX: [0, -15, 0], driftY: [0, -8, 0],  opRange: [0.06, 0.18], duration: 19, delay: 1   },
  { id: 'dust-4', x: 92, y: 38, size: 1.6, driftX: [0, -10, 0], driftY: [0, -16, 0], opRange: [0.07, 0.2],  duration: 15, delay: 6   },
];

/* ─────────────────────────────────────────────
   BG VARIANTS — stable objects, no recreation
───────────────────────────────────────────── */
const bgVariants = {
  enter: (d: number) => ({ opacity: 0, scale: 1.06, x: d > 0 ? 40 : -40 }),
  center: {
    opacity: 1,
    scale: 1.03,
    x: 0,
    transition: { duration: 1.4, ease: EASE },
  },
  exit: (d: number) => ({
    opacity: 0,
    scale: 1,
    x: d > 0 ? -40 : 40,
    transition: { duration: 1.1, ease: EASE },
  }),
};

/* ─────────────────────────────────────────────
   HOOK — useMediaQuery
───────────────────────────────────────────── */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

/* ─────────────────────────────────────────────
   BRAND TRIANGLE — outline only, GPU-friendly
───────────────────────────────────────────── */
const BrandTriangle = memo(
  ({
    size,
    x,
    y,
    strokeWidth,
    baseOpacity,
    peakOpacity,
    rotateTo,
    driftX,
    driftY,
    duration,
    delay,
  }: Omit<TriData, 'id'>) => {
    const shouldReduce = useReducedMotion();
    const half = size / 2;
    const h = size * 0.866;
    const points = `${half},0 ${size},${h} 0,${h}`;

    return (
      <m.div
        className="absolute pointer-events-none"
        style={{
          left: x,
          top: y,
          marginLeft: -half,
          marginTop: -h / 2,
          willChange: 'transform, opacity',
        }}
        initial={{ opacity: 0 }}
        animate={
          shouldReduce
            ? { opacity: baseOpacity }
            : {
                opacity: [baseOpacity, peakOpacity, baseOpacity],
                x: driftX,
                y: driftY,
                rotate: [0, rotateTo, 0],
              }
        }
        transition={
          shouldReduce
            ? { duration: 0.6 }
            : { duration, delay, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg
          width={size}
          height={h}
          viewBox={`0 0 ${size} ${h}`}
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <polygon
            points={points}
            stroke="#d4af37"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      </m.div>
    );
  }
);
BrandTriangle.displayName = 'BrandTriangle';

/* ─────────────────────────────────────────────
   GOLDEN DUST — CSS-driven opacity pulse,
   Framer only for positional drift
───────────────────────────────────────────── */
const GoldenDust = memo(
  ({
    x,
    y,
    size,
    driftX,
    driftY,
    opRange,
    duration,
    delay,
  }: Omit<DustData, 'id'>) => {
    const shouldReduce = useReducedMotion();
    return (
      <m.div
        className="absolute rounded-full pointer-events-none gold-dust-pulse"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          background:
            'radial-gradient(circle, #d4af37 0%, rgba(212,175,55,0) 70%)',
          willChange: 'transform',
          '--dust-min-op': opRange[0],
          '--dust-max-op': opRange[1],
          '--dust-dur': `${duration * 0.9}s`,
          '--dust-delay': `${delay}s`,
        } as React.CSSProperties}
        animate={
          shouldReduce
            ? {}
            : { x: driftX, y: driftY }
        }
        transition={
          shouldReduce
            ? {}
            : { duration, delay, repeat: Infinity, ease: 'easeInOut' }
        }
      />
    );
  }
);
GoldenDust.displayName = 'GoldenDust';

/* ─────────────────────────────────────────────
   WORD REVEAL — 3-D flip entrance
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
        <m.span
          key={`${word}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 34, rotateX: 40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.65, delay: delay + i * 0.09, ease: EASE }}
          style={{ perspective: 600 }}
        >
          {i >= splitIndex ? (
            <span
              className="italic hero-shimmer-text"
              aria-label={word}
            >
              {word}
            </span>
          ) : (
            <span className="text-white">{word}</span>
          )}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </m.span>
      ))}
    </>
  );
};

/* ─────────────────────────────────────────────
   COUNT-UP — RAF-based, no Framer dep
───────────────────────────────────────────── */
const CountUp: React.FC<{
  value: string;
  inView: boolean;
  delay: number;
}> = ({ value, inView, delay }) => {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '').replace('+', '');
  const hasPlus = value.includes('+');
  const [display, setDisplay] = useState('0');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!inView || isNaN(numeric)) {
      setDisplay(value);
      return;
    }
    let start: number | null = null;

    const run = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(
        `${Math.floor(eased * numeric)}${suffix}${hasPlus ? '+' : ''}`
      );
      if (p < 1) rafRef.current = requestAnimationFrame(run);
      else setDisplay(value);
    };

    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(run);
    }, delay * 1000);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [inView, value, numeric, suffix, hasPlus, delay]);

  return <>{display}</>;
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS — split for maintainability
───────────────────────────────────────────── */

/** HeroBackground */
const HeroBackground: React.FC<{
  activeBg: number;
  direction: number;
  imageReady: boolean;
  getSceneName: (key: string) => string;
}> = memo(({ activeBg, direction, imageReady, getSceneName }) => (
  <AnimatePresence custom={direction} mode="popLayout">
    <m.div
      key={activeBg}
      custom={direction}
      variants={bgVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 z-[1] will-change-transform"
    >
      <picture>
        <source
          type="image/webp"
          srcSet={backgroundOptions[activeBg].srcSet}
          sizes="100vw"
        />
        <m.img
          src={backgroundOptions[activeBg].url}
          alt={getSceneName(backgroundOptions[activeBg].nameKey)}
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          initial={{ opacity: 0 }}
          animate={{ opacity: imageReady ? 1 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </picture>

      {/* layered atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/92" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.4)_100%)]" />
    </m.div>
  </AnimatePresence>
));
HeroBackground.displayName = 'HeroBackground';

/** HeroParticles — triangles + dust, desktop only */
const HeroParticles: React.FC<{ visible: boolean }> = memo(({ visible }) => {
  if (!visible) return null;
  return (
    <>
      <div
        className="absolute inset-0 z-[10] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {TRIANGLES.map((tri) => (
          <BrandTriangle key={tri.id} {...tri} />
        ))}
      </div>
      <div
        className="absolute inset-0 z-[11] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {DUST.map((d) => (
          <GoldenDust key={d.id} {...d} />
        ))}
      </div>
    </>
  );
});
HeroParticles.displayName = 'HeroParticles';

/** HeroBadge */
const HeroBadge: React.FC<{ badge: string; imageReady: boolean }> = memo(
  ({ badge, imageReady }) => (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 16 }}
      transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
      className="inline-flex items-center gap-3 mb-8"
    >
      <m.div
        className="h-px w-8 bg-[#d4af37]/50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: imageReady ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{ transformOrigin: 'right' }}
        aria-hidden="true"
      />

      <m.div
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
                   bg-neutral-900/80 border border-[#d4af37]/30 backdrop-blur-sm
                   text-[#d4af37] text-[10px] uppercase tracking-[0.25em] font-medium
                   shadow-[0_0_20px_rgba(212,175,55,0.06)]"
        whileHover={{
          scale: 1.05,
          borderColor: 'rgba(212,175,55,0.55)',
          boxShadow: '0 0 28px rgba(212,175,55,0.12)',
        }}
        transition={{ duration: 0.25 }}
      >
        {/* sparkle with CSS pulse — lighter than Framer infinite */}
        <span
          className="flex items-center justify-center relative"
          aria-hidden="true"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] hero-sparkle-scale" />
          <span className="absolute inset-0 rounded-full hero-sparkle-glow" />
        </span>

        <span>{badge}</span>

        {/* micro triangle */}
        <m.svg
          width="10"
          height="9"
          viewBox="0 0 10 9"
          fill="none"
          className="text-[#d4af37]"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <polygon
            points="5,0.5 9.5,8.5 0.5,8.5"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
        </m.svg>

        {/* live dot — pure CSS */}
        <span
          className="relative flex h-1.5 w-1.5"
          role="img"
          aria-label="Live indicator"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
        </span>
      </m.div>

      <m.div
        className="h-px w-8 bg-[#d4af37]/50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: imageReady ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{ transformOrigin: 'left' }}
        aria-hidden="true"
      />
    </m.div>
  )
);
HeroBadge.displayName = 'HeroBadge';

/** HeroCTA */
const HeroCTA: React.FC<{
  ctaPrimary: string;
  ctaSecondary: string;
  imageReady: boolean;
  handleNav: (id: string) => void;
}> = memo(({ ctaPrimary, ctaSecondary, imageReady, handleNav }) => (
  <m.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 18 }}
    transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
  >
    <m.button
      onClick={() => handleNav('contact')}
      className="group relative px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#e6ca65]
                 text-black font-bold text-sm uppercase tracking-wider rounded-full overflow-hidden"
      whileHover={{
        scale: 1.05,
        boxShadow: '0 18px 38px rgba(212,175,55,0.35)',
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2 }}
      aria-label={ctaPrimary}
    >
      {/* shine sweep on hover only — not infinite */}
      <m.span
        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: '-150%' }}
        whileHover={{ x: '150%' }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <span className="relative flex items-center gap-2">
        {ctaPrimary}
        {/* arrow: CSS keyframe keeps GPU happy */}
        <span className="flex hero-arrow-bounce" aria-hidden="true">
          <ArrowRight className="w-4 h-4" />
        </span>
      </span>
    </m.button>

    <m.button
      onClick={() => handleNav('projects')}
      className="px-8 py-4 border border-white/25 text-white font-bold
                 text-sm uppercase tracking-wider rounded-full transition-colors duration-300"
      whileHover={{
        scale: 1.05,
        borderColor: 'rgba(212,175,55,0.5)',
        color: '#d4af37',
        boxShadow: '0 0 24px rgba(212,175,55,0.1)',
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2 }}
      aria-label={ctaSecondary}
    >
      {ctaSecondary}
    </m.button>
  </m.div>
));
HeroCTA.displayName = 'HeroCTA';

/** HeroStats */
const HeroStats: React.FC<{
  kpis: { val: string; sub: string }[];
  kpiVisible: boolean;
  imageReady: boolean;
}> = memo(({ kpis, kpiVisible, imageReady }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 20 }}
    transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
    className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
    role="list"
    aria-label="Key statistics"
  >
    {kpis.map((kpi, i) => (
      <m.div
        key={`kpi-${i}`}
        className="text-center cursor-default"
        whileHover={{ scale: 1.07, y: -4 }}
        transition={{ duration: 0.25 }}
        role="listitem"
      >
        <div
          className="text-2xl sm:text-3xl font-bold text-[#d4af37] font-serif"
          aria-label={kpi.val}
        >
          <CountUp value={kpi.val} inView={kpiVisible} delay={i * 0.12} />
        </div>
        <m.div
          className="h-px bg-[#d4af37]/30 mx-auto mt-2 mb-1"
          initial={{ width: 8 }}
          whileHover={{ width: 32 }}
          transition={{ duration: 0.35 }}
          aria-hidden="true"
        />
        <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1">
          {kpi.sub}
        </div>
      </m.div>
    ))}
  </m.div>
));
HeroStats.displayName = 'HeroStats';

/** SceneSelector */
const SceneSelector: React.FC<{
  activeBg: number;
  imageReady: boolean;
  getSceneName: (key: string) => string;
  handleBgChange: (i: number) => void;
  activeSceneLabel: string;
}> = memo(
  ({ activeBg, imageReady, getSceneName, handleBgChange, activeSceneLabel }) => (
    <m.nav
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: imageReady ? 1 : 0, x: imageReady ? 0 : 16 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="absolute top-28 right-8 z-20 hidden lg:flex flex-col items-end gap-1.5"
      aria-label="Background scene selector"
    >
      <span className="text-[8px] uppercase tracking-[0.3em] text-neutral-600 font-mono">
        {activeSceneLabel}
      </span>

      <AnimatePresence mode="wait">
        <m.span
          key={activeBg}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] text-[#d4af37]/70 font-medium tracking-wider"
          aria-live="polite"
        >
          {getSceneName(backgroundOptions[activeBg].nameKey)}
        </m.span>
      </AnimatePresence>

      <div className="flex gap-1.5 mt-0.5" role="tablist">
        {backgroundOptions.map((_, i) => (
          <m.button
            key={i}
            onClick={() => handleBgChange(i)}
            aria-label={`Scene ${i + 1}${i === activeBg ? ', current' : ''}`}
            aria-selected={i === activeBg}
            role="tab"
            className={`rounded-full transition-colors duration-300 ${
              i === activeBg
                ? 'bg-[#d4af37]'
                : 'bg-neutral-700 hover:bg-neutral-500'
            }`}
            animate={
              i === activeBg
                ? { width: 20, height: 4 }
                : { width: 4, height: 4 }
            }
            transition={{ duration: 0.4, ease: EASE }}
          />
        ))}
      </div>
    </m.nav>
  )
);
SceneSelector.displayName = 'SceneSelector';

/* ══════════════════════════════════════════════
   HERO — main orchestrator
══════════════════════════════════════════════ */
export const Hero: React.FC<HeroProps> = ({ t, setActiveTab, currentLang }) => {
  const [activeBg, setActiveBg] = useState(0);
  const [direction, setDirection] = useState(1);
  const [kpiVisible, setKpiVisible] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const isRtl = currentLang === 'ar';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const shouldReduce = useReducedMotion();

  /* ── preload first image; lazy-load rest ── */
  useEffect(() => {
    const first = new Image();
    first.src = backgroundOptions[0].url;
    first.onload = () => setImageReady(true);
    first.onerror = () => setImageReady(true);

    /* stagger secondary image loads so they
       don't compete with hero paint */
    const timers: ReturnType<typeof setTimeout>[] = [];
    backgroundOptions.slice(1).forEach((bg, i) => {
      timers.push(
        setTimeout(() => {
          const img = new Image();
          img.src = bg.url;
        }, 2000 + i * 1000)
      );
    });

    const fb = setTimeout(() => setImageReady(true), 4000);
    return () => {
      clearTimeout(fb);
      timers.forEach(clearTimeout);
    };
  }, []);

  /* ── slideshow — paused when reduced motion ── */
  useEffect(() => {
    if (!imageReady || shouldReduce) return;
    const id = setInterval(() => {
      setDirection(1);
      setActiveBg((p) => (p + 1) % backgroundOptions.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [imageReady, shouldReduce]);

  /* ── KPI reveal ── */
  useEffect(() => {
    if (!imageReady) return;
    const id = setTimeout(() => setKpiVisible(true), 1200);
    return () => clearTimeout(id);
  }, [imageReady]);

  const handleBgChange = useCallback(
    (index: number) => {
      setDirection(index > activeBg ? 1 : -1);
      setActiveBg(index);
    },
    [activeBg]
  );

  const handleNav = useCallback(
    (id: string) => {
      setActiveTab(id);
      if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(id);
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth',
        });
    },
    [setActiveTab]
  );

  const getSceneName = useCallback(
    (key: string) =>
      (t.hero[key as keyof typeof t.hero] as string) || key,
    [t.hero]
  );

  /* ── memoised KPI array ── */
  const kpis = useMemo(
    () => [
      { val: t.hero.kpi1, sub: t.hero.kpi1Sub },
      { val: t.hero.kpi2, sub: t.hero.kpi2Sub },
      { val: t.hero.kpi3, sub: t.hero.kpi3Sub },
      { val: t.hero.kpi4, sub: t.hero.kpi4Sub },
    ],
    [t.hero]
  );

  return (
    <LazyMotion features={domAnimation} strict>
      {/* ── global CSS ── */}
      <style>{`
        /* shimmer — GPU-composited transform only */
        @keyframes hero-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .hero-shimmer-text {
          background: linear-gradient(135deg,#d4af37 0%,#f0d060 45%,#d4af37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hero-shimmer 3.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-shimmer-text { animation: none; }
        }

        /* sparkle scale — CSS instead of Framer infinite */
        @keyframes hero-sparkle-s {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.25); }
        }
        .hero-sparkle-scale {
          animation: hero-sparkle-s 2s ease-in-out infinite;
          animation-delay: 3s;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-sparkle-scale { animation: none; }
        }

        /* sparkle glow ring — CSS */
        @keyframes hero-sparkle-g {
          0%,100% { opacity: .4; transform: scale(.8); }
          50%      { opacity: .8; transform: scale(1.3); }
        }
        .hero-sparkle-glow {
          box-shadow: 0 0 8px 2px rgba(212,175,55,.3);
          animation: hero-sparkle-g 2s ease-in-out infinite;
          animation-delay: 3s;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-sparkle-glow { animation: none; }
        }

        /* CTA arrow bounce — CSS instead of Framer infinite */
        @keyframes hero-arrow {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(5px); }
        }
        .hero-arrow-bounce {
          animation: hero-arrow 1.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-arrow-bounce { animation: none; }
        }

        /* golden dust opacity pulse — CSS */
        @keyframes hero-dust {
          0%,100% { opacity: var(--dust-min-op); }
          50%      { opacity: var(--dust-max-op); }
        }
        .gold-dust-pulse {
          animation: hero-dust var(--dust-dur) ease-in-out infinite;
          animation-delay: var(--dust-delay);
        }
        @media (prefers-reduced-motion: reduce) {
          .gold-dust-pulse { animation: none; opacity: var(--dust-min-op); }
        }
      `}</style>

      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* ── base black ── */}
        <div className="absolute inset-0 bg-black z-0" aria-hidden="true" />

        {/* ── background slides ── */}
        <HeroBackground
          activeBg={activeBg}
          direction={direction}
          imageReady={imageReady}
          getSceneName={getSceneName}
        />

        {/* ── brand triangles + dust — desktop only ── */}
        <HeroParticles visible={!isMobile} />

        {/* ── left scroll label ── */}
        <div
          className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2
                     hidden lg:flex flex-col items-center gap-4 z-20"
          aria-hidden="true"
        >
          <m.div
            className="w-px h-20 bg-gradient-to-b from-transparent to-[#d4af37]/40"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: imageReady ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          />
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: imageReady ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-[10px] tracking-[0.3em] uppercase text-white/50
                       [writing-mode:vertical-lr] rotate-180"
          >
            {t.hero.scrollLabel}
          </m.span>
          <m.div
            className="w-px h-20 bg-gradient-to-b from-[#d4af37]/40 to-transparent"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: imageReady ? 1 : 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom' }}
          />
        </div>

        {/* ── scene selector ── */}
        <SceneSelector
          activeBg={activeBg}
          imageReady={imageReady}
          getSceneName={getSceneName}
          handleBgChange={handleBgChange}
          activeSceneLabel={t.hero.activeScene}
        />

        {/* ════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════ */}
        <div
          className="relative z-20 max-w-6xl mx-auto px-6 lg:px-8
                     text-center pt-24 pb-32 w-full"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* badge */}
          <HeroBadge badge={t.hero.badge} imageReady={imageReady} />

          {/* headline */}
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl
                       lg:text-7xl font-bold leading-[1.15] mb-8"
          >
            {imageReady && (
              <WordReveal
                text={t.hero.headline}
                highlightLastN={2}
                delay={0.2}
              />
            )}
          </h1>

          {/* description */}
          <m.p
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{
              opacity: imageReady ? 1 : 0,
              y: imageReady ? 0 : 18,
              filter: imageReady ? 'blur(0px)' : 'blur(6px)',
            }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            className="max-w-2xl mx-auto text-sm sm:text-base
                       text-white/75 mb-10 leading-relaxed"
          >
            {t.hero.desc}
          </m.p>

          {/* CTA */}
          <HeroCTA
            ctaPrimary={t.hero.ctaPrimary}
            ctaSecondary={t.hero.ctaSecondary}
            imageReady={imageReady}
            handleNav={handleNav}
          />

          {/* KPI stats */}
          <HeroStats kpis={kpis} kpiVisible={kpiVisible} imageReady={imageReady} />

          {/* scroll indicator */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageReady ? 1 : 0 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2
                       flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => handleNav('about')}
            role="button"
            aria-label="Scroll to About section"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNav('about')}
          >
            <m.span
              className="text-[9px] uppercase tracking-[0.3em] text-white/40
                         group-hover:text-[#d4af37]/60 transition-colors duration-300
                         hero-scroll-pulse"
            >
              {t.hero.scrollLabel}
            </m.span>
            <div
              className="w-5 h-8 rounded-full border border-white/25
                         group-hover:border-[#d4af37]/40 flex items-start
                         justify-center pt-1 transition-colors duration-300"
              aria-hidden="true"
            >
              <m.div
                className="w-0.5 h-2 rounded-full bg-[#d4af37]/60"
                animate={
                  shouldReduce
                    ? {}
                    : { y: [0, 10, 0], opacity: [1, 0.2, 1] }
                }
                transition={{
                  duration: 1.9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
};