// src/App.tsx
import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { translations, Lang } from './data/content';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { useScrollEffects } from './hooks/useScrollEffects';
import { useActiveSection } from './hooks/useActiveSection';

import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/cormorant-garamond/700-italic.css';

import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

// ── Lazy-loaded sections ─────────────────────────────────────────
const Hero         = lazy(() => import('./components/Hero').then(m => ({ default: m.Hero })));
const Highlight    = lazy(() => import('./components/Highlight').then(m => ({ default: m.Highlight })));
const About        = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const Services     = lazy(() => import('./components/Services').then(m => ({ default: m.Services })));
const Projects     = lazy(() => import('./components/Projects').then(m => ({ default: m.Projects })));
const Testimonials = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const Contact      = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));
const Footer       = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const WhatsAppWidget = lazy(() => import('./components/WhatsAppWidget').then(m => ({ default: m.WhatsAppWidget })));

// ── How long (ms) to silence the observer after a nav click ─────
const NAV_LOCK_DURATION = 1000;

export default function App() {
  // ═══════════════════════ STATE ════════════════════════════════
  const [currentLang,     setCurrentLang]     = useState<Lang>('en');
  const [activeTab,       setActiveTab]        = useState('home');
  const [initialLoading,  setInitialLoading]   = useState(true);
  const [prefilledService, setPrefilledService] = useState('');

  const t = translations[currentLang];

  // Ref that both handleSetTab and useActiveSection share.
  // true  → a click-scroll is in flight; observer stays silent.
  // false → free scrolling; observer drives activeTab.
  const isNavigatingRef = useRef(false);
  const navLockTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ═══════════════════════ HTML DIR & LANG ══════════════════════
  useEffect(() => {
    document.documentElement.dir  = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // ═══════════════════════ LOADING SAFETY NET ═══════════════════
  // Unblocks UI after 8 s if LoadingScreen never calls onComplete.
  useEffect(() => {
    const safety = setTimeout(() => setInitialLoading(false), 8000);
    return () => clearTimeout(safety);
  }, []);

  // ═══════════════════════ SCROLL SIDE-EFFECTS ══════════════════
  useScrollEffects();

  // ═══════════════════════ ACTIVE-SECTION SYNC ══════════════════
  // Observer writes to activeTab ONLY when no nav-click is in flight.
  useActiveSection({ setActiveTab, isNavigatingRef });

  // ═══════════════════════ NAV HANDLER ══════════════════════════
  // Single source of truth rule:
  //   • Click sets tab immediately (optimistic UI)
  //   • Locks observer for NAV_LOCK_DURATION ms so mid-scroll
  //     section crossings don't overwrite the highlight
  //   • Lock releases and observer takes over again
  const handleSetTab = useCallback((tabId: string) => {
    // Update highlight immediately — this is the optimistic update
    setActiveTab(tabId);

    // Silence the scroll observer while we animate
    isNavigatingRef.current = true;
    if (navLockTimer.current) clearTimeout(navLockTimer.current);
    navLockTimer.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, NAV_LOCK_DURATION);

    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    document.getElementById(tabId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  // ═══════════════════════ SERVICE SELECT ═══════════════════════
  const handleSelectService = useCallback((serviceTitle: string) => {
    setPrefilledService(serviceTitle);
    handleSetTab('contact'); // reuse nav handler so lock is applied
  }, [handleSetTab]);

  // ═══════════════════════ RENDER ═══════════════════════════════
  return (
    <div className="bg-black min-h-screen text-white">

      {/* LOADING SCREEN */}
      {initialLoading && (
        <LoadingScreen onComplete={() => setInitialLoading(false)} />
      )}

      {/* NAVBAR */}
      <Navbar
        currentLang={currentLang}
        setLang={setCurrentLang}
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        t={t}
      />

      {/* MAIN CONTENT */}
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <main>
          <Hero         t={t} setActiveTab={handleSetTab} currentLang={currentLang} />
          <Highlight    t={t} currentLang={currentLang} />
          <About        t={t} currentLang={currentLang} />
          <Services     t={t} currentLang={currentLang} onSelectService={handleSelectService} />
          <Projects     t={t} currentLang={currentLang} />
          <Testimonials t={t} currentLang={currentLang} />
          <Contact      t={t} currentLang={currentLang} prefilledService={prefilledService} />
        </main>
      </Suspense>

      {/* FOOTER */}
      <Footer t={t} currentLang={currentLang} setActiveTab={handleSetTab} />

      {/* WHATSAPP FLOAT */}
      <WhatsAppWidget t={t} currentLang={currentLang} />

    </div>
  );
}