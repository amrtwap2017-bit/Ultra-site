import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translation, Lang } from '../data/content';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  t: Translation;
  setActiveTab: (tab: string) => void;
  currentLang: Lang;
}

const backgroundOptions = [
  {
    id: 'corridor',
    nameKey: 'sceneDelivery',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'hvac',
    nameKey: 'sceneQuality',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'lounge',
    nameKey: 'sceneTrusted',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85',
  },
];

const SLIDE_DURATION = 9000;
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/* ── Lightweight particles — only 2 layers, minimal count ── */
const PARTICLES = {
  sparkles: Array.from({ length: 5 }, (_, i) => ({
    id: `s-${i}`,
    x: 10 + (i / 5) * 80,
    y: 15 + (i % 3) * 30,
    delay: i * 2,
    duration: 2 + (i % 3) * 0.8,
    repeat: 4 + (i % 3) * 2,
  })),
  dots: Array.from({ length: 10 }, (_, i) => ({
    id: `d-${i}`,
    x: (i / 10) * 100,
    y: (i % 4) * 25 + 5,
    size: 1 + (i % 2) * 0.6,
    delay: (i % 5) * 1.2,
    duration: 3.5 + (i % 3) * 1.5,
  })),
};

const TinySparkle = memo(
  ({ x, y, delay, duration, repeat }: { x: number; y: number; delay: number; duration: number; repeat: number }) => (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 2,
        height: 2,
        borderRadius: '50%',
        willChange: 'transform, opacity',
        background: '#d4af37',
      }}
      animate={{ opacity: [0, 0.7, 0], scale: [0, 1.2, 0] }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: repeat, ease: 'easeInOut' }}
    />
  )
);

const ConstellationDot = memo(
  ({ x, y, size, delay, duration }: { x: number; y: number; size: number; delay: number; duration: number }) => (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        willChange: 'opacity',
        background: 'rgba(212,175,55,0.5)',
      }}
      animate={{ opacity: [0.05, 0.45, 0.05] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
);

/* ── Word-by-word headline ── */
const WordReveal: React.FC<{ text: string; highlightLastN?: number; delay?: number }> = ({
  text,
  highlightLastN = 2,
  delay = 0,
}) => {
  const words = text.split(' ');
  const splitIndex = words.length - highlightLastN;
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: delay + i * 0.08, ease: EASE }}
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

/* ── Count-up ── */
const CountUp: React.FC<{ value: string; inView: boolean; delay: number }> = ({ value, inView, delay }) => {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '').replace('+', '');
  const hasPlus = value.includes('+');
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView || isNaN(numeric)) {
      setDisplay(value);
      return;
    }
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
    const t = setTimeout(() => {
      raf = requestAnimationFrame(run);
    }, delay * 1000);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [inView, value, numeric, suffix, hasPlus, delay]);

  return <>{display}</>;
};

/* ══════════════════════════════════════════════
   MAIN HERO — REBUILT LEAN
══════════════════════════════════════════════ */
export const Hero: React.FC<HeroProps> = ({ t, setActiveTab, currentLang }) => {
  const [activeBg, setActiveBg] = useState(0);
  const [direction, setDirection] = useState(1);
  const [kpiVisible, setKpiVisible] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const isRtl = currentLang === 'ar';

  useEffect(() => {
    const img = new Image();
    img.src = backgroundOptions[0].url;
    img.onload = () => setImageReady(true);
    img.onerror = () => setImageReady(true);
    backgroundOptions.slice(1).forEach((bg) => {
      const p = new Image();
      p.src = bg.url;
    });
    const fallback = setTimeout(() => setImageReady(true), 4000);
    return () => clearTimeout(fallback);
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

  const getSceneName = (key: string) => (t.hero[key as keyof typeof t.hero] as string) || key;

  const bgEnter = (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 });
  const bgCenter = { opacity: 1, x: 0, transition: { duration: 1, ease: EASE } };
  const bgExit = (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40, transition: { duration: 0.8, ease: EASE } });

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <style>{`@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>

      {/* Black base */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* Background slides */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={activeBg}
          custom={direction}
          initial={imageReady ? bgEnter(direction) : { opacity: 0, x: 0 }}
          animate={bgCenter}
          exit={bgExit(direction)}
          className="absolute inset-0 z-[1]"
        >
          <motion.img
            src={backgroundOptions[activeBg].url}
            alt={getSceneName(backgroundOptions[activeBg].nameKey)}
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageReady ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/15" />
        </motion.div>
      </AnimatePresence>

      {/* Particles — only 2 lightweight layers */}
      <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
        {PARTICLES.sparkles.map((p) => (
          <TinySparkle key={p.id} x={p.x} y={p.y} delay={p.delay} duration={p.duration} repeat={p.repeat} />
        ))}
        {PARTICLES.dots.map((p) => (
          <ConstellationDot key={p.id} x={p.x} y={p.y} size={p.size} delay={p.delay} duration={p.duration} />
        ))}
      </div>

      {/* Single decorative ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#d4af37]/[0.06] rounded-full pointer-events-none z-[14]"
        animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Scene selector */}
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
              className={`rounded-full transition-colors duration-300 ${
                i === activeBg ? 'bg-[#d4af37]' : 'bg-neutral-700 hover:bg-neutral-500'
              }`}
              animate={i === activeBg ? { width: 20, height: 4 } : { width: 4, height: 4 }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          ))}
        </div>
      </motion.div>

      {/* Left scroll label */}
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

      {/* Main content */}
      <div
        className="relative z-20 max-w-6xl mx-auto px-6 lg:px-8 text-center pt-24 pb-32 w-full"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Badge */}
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
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                        bg-neutral-900/80 border border-[#d4af37]/25
                        text-[#d4af37] text-[10px] uppercase tracking-[0.25em] font-medium"
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.hero.badge}</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
            </span>
          </div>
          <motion.div
            className="h-px w-8 bg-[#d4af37]/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: imageReady ? 1 : 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-8">
          {imageReady && <WordReveal text={t.hero.headline} highlightLastN={2} delay={0.2} />}
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 18 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
          className="max-w-2xl mx-auto text-sm sm:text-base text-white/70 mb-10 leading-relaxed"
        >
          {t.hero.desc}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 18 }}
          transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => handleNav('contact')}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#e6ca65]
                       text-black font-bold text-sm uppercase tracking-wider rounded-full
                       hover:shadow-[0_18px_38px_rgba(212,175,55,0.35)] hover:scale-105
                       active:scale-95 transition-all duration-200 overflow-hidden"
          >
            <span className="relative flex items-center gap-2">
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => handleNav('projects')}
            className="px-8 py-4 border border-white/20 text-white font-bold
                       text-sm uppercase tracking-wider rounded-full
                       hover:border-[#d4af37]/50 hover:text-[#d4af37] hover:scale-105
                       active:scale-95 transition-all duration-200"
          >
            {t.hero.ctaSecondary}
          </button>
        </motion.div>

        {/* KPI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: imageReady ? 1 : 0, y: imageReady ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { val: t.hero.kpi1, sub: t.hero.kpi1Sub },
            { val: t.hero.kpi2, sub: t.hero.kpi2Sub },
            { val: t.hero.kpi3, sub: t.hero.kpi3Sub },
            { val: t.hero.kpi4, sub: t.hero.kpi4Sub },
          ].map((kpi, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#d4af37] font-serif">
                <CountUp value={kpi.val} inView={kpiVisible} delay={i * 0.12} />
              </div>
              <div className="h-px w-8 bg-[#d4af37]/30 mx-auto mt-2 mb-1" />
              <div className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{kpi.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageReady ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => handleNav('about')}
        >
          <motion.span
            className="text-[9px] uppercase tracking-[0.3em] text-white/30 group-hover:text-[#d4af37]/60 transition-colors duration-300"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {t.hero.scrollLabel}
          </motion.span>
          <div className="w-5 h-8 rounded-full border border-white/20 group-hover:border-[#d4af37]/40 flex items-start justify-center pt-1 transition-colors duration-300">
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