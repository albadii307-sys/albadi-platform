'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from './icons';

type RailProps = {
  children: ReactNode;
  locale: 'ar' | 'en';
  hint: string;
  prev: string;
  next: string;
  tone?: 'light' | 'dark';
  className?: string;
};

export function Rail({ children, locale, hint, prev, next, tone = 'light', className = '' }: RailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollWidth - el.clientWidth > 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  const step = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(280, el.clientWidth * 0.72);
    el.scrollBy({ left: amount * direction * (locale === 'ar' ? -1 : 1), behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? Math.abs(el.scrollLeft) / max : 1;
    setProgress(Math.min(1, Math.max(0, ratio)));
  };

  return (
    <div className={`x-rail-wrap${tone === 'dark' ? ' x-rail-wrap--dark' : ''} ${className}`.trim()}>
      {overflowing ? (
        <div className="x-rail-head">
          <span className="x-rail-hint">{hint}</span>
          <div className="x-rail-nav">
            <button type="button" onClick={() => step(-1)} aria-label={prev}>
              {locale === 'ar' ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}
            </button>
            <button type="button" onClick={() => step(1)} aria-label={next}>
              {locale === 'ar' ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
            </button>
          </div>
        </div>
      ) : null}
      <div className="x-rail" ref={ref} onScroll={onScroll}>
        {children}
      </div>
      {overflowing ? (
        <div className="x-rail-bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
      ) : null}
    </div>
  );
}

export default function NewsRail(props: Omit<RailProps, 'tone' | 'className'>) {
  return <Rail {...props} />;
}
