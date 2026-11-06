'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/lib/types';
import { ArrowLeft, ArrowRight, X } from './icons';

export default function PhotoGallery({
  images,
  name,
  locale,
  countLabel,
}: {
  images: string[];
  name: string;
  locale: Locale;
  countLabel: string;
}) {
  const ar = locale === 'ar';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const unique = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const active = openIndex !== null ? unique[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null || unique.length === 0) return current;
        return (current + delta + unique.length) % unique.length;
      });
    },
    [unique.length]
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(ar ? -1 : 1);
      if (event.key === 'ArrowLeft') step(ar ? 1 : -1);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [active, ar, close, step]);

  const PrevIcon = ar ? ArrowRight : ArrowLeft;
  const NextIcon = ar ? ArrowLeft : ArrowRight;

  if (unique.length < 2) return null;

  const tiles = unique.slice(0, 8);
  const hasMore = unique.length > tiles.length;

  return (
    <div className="x-pgal-block">
      <div className="x-pgal">
        {tiles.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            className={`x-pgal-item${index === 0 ? ' is-lead' : ''}${index % 5 === 4 ? ' is-tall' : ''}`}
            onClick={() => setOpenIndex(index)}
            aria-label={`${ar ? 'عرض الصورة' : 'View photo'} ${index + 1} — ${name}`}
          >
            <img
              src={src}
              alt={`${name} — ${countLabel} ${index + 1}`}
              loading="lazy"
              decoding="async"
            />
            <span className="x-pgal-zoom" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>

      {hasMore ? (
        <button type="button" className="x-pgal-all" onClick={() => setOpenIndex(0)}>
          {ar ? `عرض جميع الصور (${unique.length})` : `View all ${unique.length} photos`}
          <NextIcon size={16} />
        </button>
      ) : null}

      {active ? (
        <div className="x-lb" role="dialog" aria-modal="true" aria-label={name} onClick={close}>
          <button type="button" className="x-lb-close" onClick={close} aria-label={ar ? 'إغلاق' : 'Close'}>
            <X size={20} />
          </button>
          <button
            type="button"
            className="x-lb-nav is-prev"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            aria-label={ar ? 'السابق' : 'Previous'}
          >
            <PrevIcon size={20} />
          </button>
          <figure className="x-lb-figure" onClick={(event) => event.stopPropagation()}>
            <img src={active} alt={`${name} — ${countLabel} ${(openIndex ?? 0) + 1}`} />
            <figcaption>
              <b>{name}</b>
              <small>
                {(openIndex ?? 0) + 1} / {unique.length}
              </small>
            </figcaption>
          </figure>
          <button
            type="button"
            className="x-lb-nav is-next"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            aria-label={ar ? 'التالي' : 'Next'}
          >
            <NextIcon size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
