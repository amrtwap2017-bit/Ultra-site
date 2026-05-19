// src/hooks/useActiveSection.ts
import { useEffect, useRef, RefObject } from 'react';

// ── Exported so other files can reference the union type if needed ──
export type NavSectionId =
  | 'highlight'
  | 'about'
  | 'services'
  | 'projects'
  | 'testimonials'
  | 'contact';

export const NAV_SECTION_IDS: readonly NavSectionId[] = [
  'highlight',
  'about',
  'services',
  'projects',
  'testimonials',
  'contact',
] as const;

// ── Exported interface so App.tsx can import it if desired ─────────
export interface UseActiveSectionOptions {
  setActiveTab: (id: string) => void;
  isNavigatingRef: RefObject<boolean>;
}

export function useActiveSection({
  setActiveTab,
  isNavigatingRef,
}: UseActiveSectionOptions): void {
  const setActiveTabRef = useRef<(id: string) => void>(setActiveTab);

  useEffect(() => {
    setActiveTabRef.current = setActiveTab;
  }, [setActiveTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (isNavigatingRef.current) return;

        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (best) {
          setActiveTabRef.current(best.target.id);
        }
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const timer = setTimeout(() => {
      NAV_SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}