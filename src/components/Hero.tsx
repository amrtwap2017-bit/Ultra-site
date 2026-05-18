import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Translation } from '../data/content';

interface HeroProps {
  t: Translation;
  setActiveTab: (id: string) => void;
  currentLang: 'en' | 'ar' | 'it';
}

// Reduced image quality + size for faster LCP
const backgrounds = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=65',
    nameKey: 'sceneDelivery',
  },
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=60',
    nameKey: 'sceneQuality',
  },
  {
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1400&q=60',
    nameKey: 'sceneTrusted',
  },
];

const SLIDE_DURATION = 6000;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const Hero: React.FC<HeroProps> = ({ t, setActiveTab, currentLang }) => {
  const [activeBg, setActiveBg] = useState(0);
  const [ready, setReady] = useState(false);
  const isRtl = currentLang === 'ar';

  // Preload first image then show content
  useEffect(() => {
    const img = new window.Image();
    img.src = backgrounds[0].url;
    img.onload = () => setReady(true);
    img.onerror = () => setReady(true);
    const fallback = setTimeout(() => setReady(true), 2000);
    // Preload rest lazily
    setTimeout(() => {
      backgrounds.slice(1).forEach(bg => {
        const p = new window.Image();
        p.src = bg.url;
      });
    }, 1000);
    return () => clearTimeout(fallback);
  }, []);

  // Slide interval
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setActiveBg(p => (p + 1) % backgrounds.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [ready]);

  const handleNav = useCallback((id: string) => {
    setActiveTab(id);
    if (id === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }, [setActiveTab]);

  const kpis = [
    { val: t.hero.kpi1, sub: t.hero.kpi1Sub },
    { val: t.hero.kpi2, sub: t.hero.kpi2Sub },
    { val: t.hero.kpi3, sub: t.hero.kpi3Sub },
    { val: t.hero.kpi4, sub: t.hero.kpi4Sub },
  ];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ── Backgrounds ── */}
      <div className="absolute inset-0">
        {/* First image always rendered for LCP */}
        {backgrounds.map((bg, i) => (
          <div
            key={bg.url}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: activeBg === i ? 1 : 0 }}
          >
            <img
              src={bg.url}
              alt={t.hero[bg.nameKey as keyof typeof t.hero] as string}
              className="w-full h-full object-cover object-center"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding={i === 0 ? 'sync' : 'async'}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(i === 0 ? { fetchPriority: 'high' } as any : { fetchPriority: 'low' } as any)}
              width="1400"
              height="900"
            />
          </div>
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ── Light grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Scene selector ── */}
      <div className={`absolute bottom-24 ${isRtl ? 'left-6 sm:left-10' : 'right-6 sm:right-10'} z-10 flex flex-col items-end gap-2`}>
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-mono">{t.hero.activeScene}</span>
        <div className="flex items-center gap-1.5">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBg(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeBg === i ? 20 : 5,
                height: 4,
                backgroundColor: activeBg === i ? '#d4af37' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-16">
        {ready && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#d4af37] font-mono">
                {t.hero.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-white mb-6 max-w-4xl">
              {t.hero.headline.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="italic gold-text">{t.hero.headline.split(' ').slice(-1)}</span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-sm sm:text-base text-white/65 mb-10 leading-relaxed">
              {t.hero.desc}
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap gap-3 mb-16 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <motion.button
                onClick={() => handleNav('contact')}
                className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-bold text-sm uppercase tracking-wider rounded-full"
                whileHover={{ scale: 1.04, boxShadow: '0 16px 32px rgba(212,175,55,0.3)' }}
                whileTap={{ scale: 0.97 }}
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>

              <motion.button
                onClick={() => handleNav('projects')}
                className="px-7 py-3.5 border border-white/25 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors duration-300"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.hero.ctaSecondary}
              </motion.button>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: EASE }}
                  className="relative p-4 rounded-xl border border-white/8 bg-white/5 backdrop-blur-sm"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent rounded-t-xl" />
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[#d4af37] leading-none mb-1">
                    {kpi.val}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-wider font-mono leading-tight">
                    {kpi.sub}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Scroll indicator ── */}
      <button
        onClick={() => handleNav('about')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40 hover:text-[#d4af37] transition-colors duration-300"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] font-mono">{t.hero.scrollLabel}</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
};
