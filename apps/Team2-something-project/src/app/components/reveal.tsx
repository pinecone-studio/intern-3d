'use client';

import { createElement, type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'aside';
  variant?: 'up' | 'left' | 'right' | 'zoom';
};

export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
  variant = 'up',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref: ref as never,
      className: `reveal reveal-${variant} ${isVisible ? 'reveal-visible' : ''} ${className}`.trim(),
      style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
    },
    children
  );
}
