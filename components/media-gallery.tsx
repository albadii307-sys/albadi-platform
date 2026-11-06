'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/lib/types';
import { ArrowLeft, ArrowRight, Download, FileText, ImageIcon, X } from './icons';

export type MediaEntry = {
  id: string;
  title: string;
  url: string;
  kind: 'image' | 'pdf';
  year: number | null;
};

type Filter = 'all' | 'image' | 'pdf';

export default function MediaGallery({ items, locale }: { items: MediaEntry[]; locale: Locale }) {
  const ar = locale === 'ar';
  const [filter, setFilter] = useState<Filter>('all');
  const [year, setYear] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const unique = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.kind}:${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  const years = useMemo(
    () =>
      Array.from(new Set(unique.map((item) => item.year).filter((value): value is number => value !== null))).sort(
        (a, b) => b - a
      ),
    [unique]
  );

  const visible = useMemo(
    () =>
      unique.filter(
        (item) => (filter === 'all' || item.kind === filter) && (year === 'all' || String(item.year) === year)
      ),
    [unique, filter, year]
  );

  const images = useMemo(() => visible.filter((item) => item.kind === 'image'), [visible]);
  const active = openIndex !== null ? images[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null || images.length === 0) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length]
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [active, close, step]);

  const PrevIcon = ar ? ArrowRight : ArrowLeft;
  const NextIcon = ar ? ArrowLeft : ArrowRight;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: ar ? 'الكل' : 'All', count: unique.length },
    { key: 'image', label: ar ? 'صور' : 'Photos', count: unique.filter((item) => item.kind === 'image').length },
    { key: 'pdf', label: ar ? 'ملفات' : 'Documents', count: unique.filter((item) => item.kind === 'pdf').length },
  ];

  return (
    <div className="x-md">
      <div className="x-md-bar">
        <div className="x-pf-tabs x-md-tabs" role="tablist" aria-label={ar ? 'تصفية الوسائط' : 'Filter media'}>
          {filters.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              className={`x-pf-tab${filter === tab.key ? ' is-on' : ''}`}
              onClick={() => {
                setFilter(tab.key);
                setOpenIndex(null);
              }}
            >
              {tab.label}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>

        {years.length > 1 ? (
          <label className="x-md-year">
            <span>{ar ? 'السنة' : 'Year'}</span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="all">{ar ? 'كل السنوات' : 'All years'}</option>
              {years.map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {visible.length ? (
        <div className="x-md-grid">
          {visible.map((item) =>
            item.kind === 'image' ? (
              <button
                key={item.id}
                type="button"
                className="x-md-item is-image"
                onClick={() => {
                  const index = images.findIndex((entry) => entry.id === item.id);
                  if (index >= 0) setOpenIndex(index);
                }}
              >
                <span className="x-md-media">
                  <img src={item.url} alt={item.title} loading="lazy" />
                  <span className="x-md-zoom" aria-hidden="true">
                    <ImageIcon size={15} />
                  </span>
                </span>
                <span className="x-md-cap">
                  <b>{item.title}</b>
                  {item.year ? <small>{item.year}</small> : null}
                </span>
              </button>
            ) : (
              <a
                key={item.id}
                className="x-md-item is-file"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="x-md-file">
                  <FileText size={26} />
                  <span>PDF</span>
                </span>
                <span className="x-md-cap">
                  <b>{item.title}</b>
                  <small>
                    <Download size={13} /> {ar ? 'تحميل الملف' : 'Download'}
                  </small>
                </span>
              </a>
            )
          )}
        </div>
      ) : (
        <p className="x-pf-empty">{ar ? 'لا توجد وسائط مطابقة.' : 'No matching media.'}</p>
      )}

      {active ? (
        <div className="x-lb" role="dialog" aria-modal="true" aria-label={active.title} onClick={close}>
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
            <img src={active.url} alt={active.title} />
            <figcaption>
              <b>{active.title}</b>
              <small>
                {(openIndex ?? 0) + 1} / {images.length}
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
