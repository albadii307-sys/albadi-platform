'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    const doc = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let io: IntersectionObserver | undefined;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-in'));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              io?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.1 }
      );
      nodes.forEach((node) => io?.observe(node));
    }

    let raf = 0;
    const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));

    const update = () => {
      raf = 0;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      doc.style.setProperty('--scroll', progress.toFixed(4));
      document.body.classList.toggle('is-scrolled', window.scrollY > 18);
      if (reduced) return;
      const vh = window.innerHeight;
      for (const el of parallax) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -300 || rect.top > vh + 300) continue;
        const speed = Number(el.dataset.parallax) || 0.08;
        el.style.setProperty('--py', ((rect.top + rect.height / 2 - vh / 2) * -speed).toFixed(2));
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const hero = document.querySelector<HTMLElement>('.x-hero');
    const fine = window.matchMedia('(hover: hover)').matches;
    const onPointer = (event: PointerEvent) => {
      const rect = hero!.getBoundingClientRect();
      hero!.style.setProperty('--mx', `${(event.clientX - rect.left).toFixed(0)}px`);
      hero!.style.setProperty('--my', `${(event.clientY - rect.top).toFixed(0)}px`);
    };
    if (hero && fine && !reduced) hero.addEventListener('pointermove', onPointer);

    return () => {
      io?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      if (hero) hero.removeEventListener('pointermove', onPointer);
    };
  }, [pathname]);

  return (
    <div className="x-progress" aria-hidden="true">
      <i />
    </div>
  );
}

export function Counter({
  value,
  suffix = '',
  scramble = false,
  className,
}: {
  value: number;
  suffix?: string;
  scramble?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = 0;
    let settled = false;

    const count = (duration: number) => {
      cancelAnimationFrame(raf);
      settled = false;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
        else settled = true;
      };
      raf = requestAnimationFrame(tick);
    };

    const scrambleDigits = () => {
      if (!settled) return;
      cancelAnimationFrame(raf);
      const digits = String(value).split('');
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 550);
        el.textContent = digits
          .map((digit, index) => (index < p * digits.length ? digit : String(Math.floor(Math.random() * 10))))
          .join('');
        if (p < 1) raf = requestAnimationFrame(tick);
        else {
          el.textContent = String(value);
          settled = true;
        }
      };
      raf = requestAnimationFrame(tick);
    };

    el.textContent = '0';

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        count(1500);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    if (scramble) el.addEventListener('pointerenter', scrambleDigits);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      if (scramble) el.removeEventListener('pointerenter', scrambleDigits);
    };
  }, [value, scramble]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      {suffix ? <span aria-hidden="true">{suffix}</span> : null}
      <span className="sr-only">{value}</span>
    </span>
  );
}

export function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Muscat',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="x-clock" dir="ltr">
      <i aria-hidden="true" />
      {time || '--:--'} <small>GMT+4</small>
    </span>
  );
}
