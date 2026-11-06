'use client';

import { useEffect, useRef, useState } from 'react';

export type HeroSlide = { src: string; label: string };

export default function HeroMedia({ slides, video }: { slides: HeroSlide[]; video?: string }) {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video || slides.length < 2) return;
    const id = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 7000);
    return () => window.clearInterval(id);
  }, [slides.length, video]);

  useEffect(() => {
    if (!video) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const element = videoRef.current;
      if (!element) return;
      if (query.matches) element.pause();
      else void element.play().catch(() => undefined);
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [video]);

  return (
    <div className="x-hero-media">
      {video ? (
        <video
          ref={videoRef}
          className="x-hero-video"
          src={video}
          poster={slides[0]?.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        slides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            className={index === active ? 'is-on' : undefined}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'low'}
          />
        ))
      )}
      <span className="x-hero-media-veil" aria-hidden="true" />

      {video ? null : (
        <div className="x-hero-media-ui">
          <span className="x-hero-media-count" dir="ltr">
            {String(active + 1).padStart(2, '0')}
            <i>/</i>
            {String(slides.length).padStart(2, '0')}
          </span>
          <div className="x-hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                className={index === active ? 'is-on' : undefined}
                onClick={() => setActive(index)}
                aria-label={slide.label}
                aria-pressed={index === active}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <span className="x-hero-media-label">{slides[active]?.label}</span>
        </div>
      )}
    </div>
  );
}
