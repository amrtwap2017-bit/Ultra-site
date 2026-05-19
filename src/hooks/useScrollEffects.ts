// src/hooks/useScrollEffects.ts
import { useEffect, useRef } from 'react';

export function useScrollEffects(): void {
  const tickingRef = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const scrollY   = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress  = maxScroll > 0 ? scrollY / maxScroll : 0;

        document.documentElement.style.setProperty(
          '--scroll-progress',
          progress.toString()
        );
        document.documentElement.classList.toggle('scrolled', scrollY > 80);

        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll('[data-section]').forEach((el) => {
        observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}