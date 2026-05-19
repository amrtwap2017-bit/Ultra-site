import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Translation } from '../data/content';
import { Globe, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import logo from '../assets/Logo.png';

interface NavbarProps {
  currentLang: 'en' | 'ar' | 'it';
  setLang: (lang: 'en' | 'ar' | 'it') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  t: Translation;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  setLang,
  activeTab,
  setActiveTab,
  t,
}) => {
  const [scrolled, setScrolled]             = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  /* ── scroll ── */
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  /* ── lock body scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  /* ── close drawer on desktop resize ── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── close lang dropdown on outside click ── */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.lang-dropdown')) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  /* ── nav click ── */
  const handleNavClick = useCallback((id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = document.getElementById(id);
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [setActiveTab]);

  /* ── lang change ── */
  const handleLangChange = useCallback((lang: 'en' | 'ar' | 'it') => {
    setLang(lang);
    setLangDropdownOpen(false);
  }, [setLang]);

  const isRTL = currentLang === 'ar';

  /* ────────────────────────────────────────────────
     NAV ITEMS  — driven by translation object
  ──────────────────────────────────────────────── */
  const navItems = React.useMemo(() => [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'services', label: t.nav.services },
    { id: 'projects', label: t.nav.projects },
    { id: 'contact', label: t.nav.contact },
  ], [t]);

  /* ────────────────────────────────────────────────
     LANGUAGES
  ──────────────────────────────────────────────── */
  
  const languages: Record<
    'en' | 'ar' | 'it',
    { label: string; flag: string; short: string }
    > = {
      en: { label: 'English',  flag: '🇺🇸', short: 'EN' },
      ar: { label: 'العربية',  flag: '🇪🇬', short: 'ع'  },
      it: { label: 'Italiano', flag: '🇮🇹', short: 'IT' },
    };

  /* ────────────────────────────────────────────────
     QUOTE LABEL — translate from t object or fallback
     Add  t.nav.quote / t.nav.getQuote to your
     Translation type and content files for full i18n.
  ──────────────────────────────────────────────── */
  const quoteLabel    = t.nav.quote;
  const getQuoteLabel = t.nav.getQuote;

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-[background-color,border-color,opacity,transform] duration-500        ${scrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/40'
          : 'bg-transparent'
        }
      `}
    >
      <h1 className="sr-only">Triangle Black Official Website</h1>
      <div className=" min-h-[44px] min-w-[44px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-[74px] md:h-20 flex items-center justify-between">

        {/* ══════════════════════════
            LOGO + BRAND
        ══════════════════════════ */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-label="Go to homepage"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                     rounded-lg group flex items-center gap-2 flex-shrink-0 min-w-0"
        >
          {/* ── Logo image ── */}
          <div className="relative flex-shrink-0">
            
            {/* Ambient glow */}
            <div
              aria-hidden="true"
              className="
                absolute inset-0 rounded-full
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                pointer-events-none
                bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,transparent_72%)]
                blur-xl scale-150
              "
            />

            {/* Logo */}
            <img
              src={logo}
              alt="Triangle Black logo"
              width={160}
              height={160}
              loading="eager"
              fetchPriority="high"
              draggable={false}
              className="
                relative z-10 object-contain select-none
                w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
                transition-transform duration-500
                will-change-transform
                group-hover:scale-[1.06]
                drop-shadow-[0_0_14px_rgba(212,175,55,0.25)]
                group-hover:drop-shadow-[0_0_28px_rgba(212,175,55,0.45)]
              "
            />
          </div>
          {/* ── Brand text ── */}
          <div className="flex flex-col justify-center leading-tight min-w-0">
            <span
              className={`
                font-bold text-[#d4af37] uppercase font-serif
                whitespace-nowrap truncate
                text-[13px] sm:text-sm md:text-base
                ${isRTL ? 'tracking-normal' : 'tracking-[0.12em] sm:tracking-[0.17em] md:tracking-[0.22em]'}
              `}
            >
              {t.title}
            </span>
            <span
              className={`
                font-medium text-white/50 uppercase whitespace-nowrap truncate
                text-[9px] md:text-[10px] hidden sm:block
                ${isRTL ? 'tracking-normal' : 'tracking-[0.22em] sm:tracking-[0.3em] md:tracking-[0.38em]'}
              `}
            >
              {t.subtitle}
            </span>
            {/* Gold rule */}
            <div
              aria-hidden="true"
              className="h-px mt-[3px] rounded-full bg-[linear-gradient(to_right,#d4af37_0%,rgba(212,175,55,0.15)_60%,transparent_100%)]"
            />
          </div>
        </button>

        {/* ══════════════════════════
            DESKTOP NAV
        ══════════════════════════ */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navItems.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                type = "button"
                key={id}
                onClick={() => handleNavClick(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  relative px-3 lg:px-4 py-2.5
                  text-[10px] lg:text-[11px] uppercase font-medium
                  rounded-sm transition-colors duration-300
                  focus:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                  group
                  ${isRTL ? 'tracking-normal' : 'tracking-[0.18em] lg:tracking-[0.22em]'}
                  ${isActive ? 'text-[#d4af37]' : 'text-neutral-400 hover:text-white'}
                `}
              >
                {/* Underline indicator */}
                <span
                  aria-hidden="true"
                  className={`
                    absolute bottom-0 left-1/2 -translate-x-1/2 h-px
                    bg-gradient-to-r from-transparent via-[#d4af37] to-transparent
                    transition-[background-color,border-color,opacity,transform] duration-500                    ${isActive
                      ? 'w-4/5 opacity-100'
                      : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-40'
                    }
                  `}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* ══════════════════════════
            RIGHT CONTROLS
        ══════════════════════════ */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">

          {/* ── Language Dropdown ── */}
          <div className="relative lang-dropdownmin-h-[44px] min-w-[44px]">
            <button
              type="button"
              onClick={() => setLangDropdownOpen((v) => !v)}
              aria-expanded={langDropdownOpen}
              aria-haspopup="listbox"
              aria-label="Select language"
              className={`
                inline-flex items-center gap-1 sm:gap-1.5
                bg-neutral-900/80 border rounded-lg
                px-2 sm:px-3 py-1.5 sm:py-2
                hover:bg-neutral-800/80
                transition-[background-color,border-color,opacity,transform] duration-300                
                focus:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                ${langDropdownOpen
                  ? 'border-[#d4af37]/40 ring-2 ring-[#d4af37]/20'
                  : 'border-neutral-800/80 hover:border-[#d4af37]/30'
                }
              `}
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37]/70 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wider">
                {languages[currentLang].short}
              </span>
              <ChevronDown
                type="button"
                className={`w-3 h-3 text-neutral-400 flex-shrink-0 transition-transform duration-300 ${
                  langDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            {langDropdownOpen && (
              <div
                role="listbox"
                aria-label="Language options"
                className={`
                  absolute top-full mt-2 w-40 sm:w-44
                  bg-neutral-900/97 backdrop-blur-xl
                  border border-neutral-800/80 rounded-xl
                  shadow-lg shadow-black/40
                  overflow-hidden z-50
                  ${isRTL ? 'left-0' : 'right-0'}
                `}
              >
                {(Object.keys(languages) as Array<'en' | 'ar' | 'it'>).map((lang) => {
                  const isSelected = currentLang === lang;
                  return (
                    <button
                      type = "button"
                      key={lang}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleLangChange(lang)}
                      className={`
                        w-full px-3 sm:px-4 py-2.5 sm:py-3
                        flex items-center gap-2.5
                        text-left transition-all duration-200
                        border-l-2
                        ${isSelected
                          ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white border-transparent'
                        }
                      `}
                    >
                      <span className="text-base leading-none" aria-hidden="true">
                        {languages[lang].flag}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {languages[lang].label}
                      </span>
                      {isSelected && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CTA — Desktop ── */}
          <button
            type= "button"
            onClick={() => handleNavClick('contact')}
            className={`
              hidden sm:inline-flex items-center gap-1.5 lg:gap-2
              text-[9px] lg:text-[10px] font-bold uppercase
              bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black
              px-3 lg:px-5 py-2 lg:py-2.5 rounded-full
              hover:shadow-lg hover:shadow-[#d4af37]/30
              transition-all duration-300 hover:scale-105 active:scale-95
              whitespace-nowrap focus:outline-none
              focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black  
              ${isRTL ? 'tracking-normal' : 'tracking-[0.15em]'}
            `}
          >
            <span>{quoteLabel}</span>
            <ArrowRight className={`w-3 h-3 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
          </button>

          {/* ── Hamburger ── */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-drawer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="
              min-h-[44px] min-w-[44px] md:hidden h-10 w-10 rounded-lg
              flex items-center justify-center
              text-neutral-400 hover:text-[#d4af37]
              hover:bg-white/5 transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
            "
          >
            {mobileMenuOpen
              ? <X    className="w-5 h-5" />
              : <Menu className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════ */}
      <div
        id="mobile-drawer"
        aria-hidden={!mobileMenuOpen}
        className={`
          md:hidden absolute top-full left-0 w-full
          bg-black/98 backdrop-blur-xl
          border-b border-neutral-800/50
          shadow-lg shadow-black/40
          transition-all duration-300 ease-in-out overflow-hidden
          ${mobileMenuOpen ? 'max-h-[calc(100dvh-4rem)] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className="px-4 sm:px-6 py-5 flex flex-col gap-1.5
                     overflow-y-auto max-h-[calc(100dvh-4rem)]"
        >
          {/* Gold top rule */}
          <div
            aria-hidden="true"
            className="h-px w-full mb-3 rounded-full bg-[linear-gradient(to_right,#d4af37_0%,rgba(212,175,55,0.15)_50%,transparent_100%)]"
          />

          {/* Brand identity row */}
          <div className={`px-4 pb-3 mb-1 border-b border-neutral-800/60 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img
              src={logo}
              alt="Triangle Black luxury brand logo"
              aria-hidden="true"
              width={36}
              height={36}
              className="w-9 h-9 object-contain flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.35))' }}
            />
            <div>
              <p className={`text-[#d4af37] font-bold font-serif text-sm uppercase ${isRTL ? 'tracking-normal' : 'tracking-wider'}`}>
                {t.title}
              </p>
              <p className={`text-white/40 text-[9px] uppercase mt-0.5 ${isRTL ? 'tracking-normal' : 'tracking-widest'}`}>
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Nav links */}
          {navItems.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => handleNavClick(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  w-full px-4 py-3.5 rounded-xl
                  uppercase text-sm font-medium
                  transition-[background-color,border-color,opacity,transform] duration-300
                  flex items-center justify-between
                  ${isRTL ? 'flex-row-reverse text-right tracking-normal' : 'text-left tracking-[0.15em]'}
                  ${isActive
                    ? 'text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/20'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <span>{label}</span>
                {isActive && (
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#d4af37] flex-shrink-0" />
                )}
              </button>
            );
          })}

          {/* Mobile CTA — translated */}
          <button
            onClick={() => handleNavClick('contact')}
            className={`
              mt-3 w-full inline-flex items-center justify-center gap-2
              px-4 py-3.5 rounded-full
              bg-gradient-to-r from-[#d4af37] to-[#e6ca65]
              text-black uppercase text-[11px] font-bold
              hover:shadow-lg hover:shadow-[#d4af37]/30
              transition-all duration-300 active:scale-95
              focus:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
              ${isRTL ? 'tracking-normal' : 'tracking-[0.18em]'}
            `}
          >
            <span>{getQuoteLabel}</span>
            <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
          </button>

          {/* Safe area spacer */}
          <div className="h-safe-bottom h-6" />
        </div>
      </div>
    </header>
  );
};