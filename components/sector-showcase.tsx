'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from './icons';
import { getDict, type Locale } from '@/lib/i18n';

type Item = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  services: number;
  image: string;
  logo: string | null;
};

export default function SectorShowcase({ items, locale }: { items: Item[]; locale: Locale }) {
  const t = getDict(locale);
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const Prev = locale === 'ar' ? ArrowRight : ArrowLeft;
  const Next = locale === 'ar' ? ArrowLeft : ArrowRight;

  const step = (direction: number) =>
    setActive((index) => (index + direction + items.length) % items.length);

  return (
    <div className="x-show">
      <div
        className="x-show-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label={locale === 'ar' ? 'قطاعات المجموعة' : 'Group sectors'}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') step(1);
          if (event.key === 'ArrowLeft') step(-1);
        }}
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          if (Math.abs(delta) > 42) step(delta < 0 ? 1 : -1);
          startX.current = null;
        }}
        onPointerLeave={() => {
          startX.current = null;
        }}
      >
        {items.map((item, index) => (
          <div key={item.id} className={`x-panel${index === active ? ' is-on' : ''}`}>
            <img className="x-panel-img" src={item.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
            <span className="x-panel-shade" aria-hidden="true" />
            <span className="x-panel-rings" aria-hidden="true" />
            <span className="x-panel-glow" aria-hidden="true" />
            <span className="x-panel-num">{String(index + 1).padStart(2, '0')}</span>
            {item.logo ? (
              <span className="x-panel-logo">
                <img src={item.logo} alt="" loading="lazy" />
              </span>
            ) : null}
            <div className="x-panel-body">
              <span className="x-panel-count">
                <b>{item.services}</b>
                <small>{t.home.extra.servicesCount}</small>
              </span>
              <h3>{item.name}</h3>
              <p>{item.tagline}</p>
              <Link href={`/${locale}/sectors/${item.slug}`} tabIndex={-1}>
                {t.home.extra.explore} <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        ))}

        <div className="x-show-nav">
          <button type="button" onClick={() => step(-1)} aria-label={t.common.prev}>
            <Prev size={16} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label={t.common.next}>
            <Next size={16} />
          </button>
        </div>

        <span className="x-show-bar" aria-hidden="true">
          <i style={{ width: `${((active + 1) / items.length) * 100}%` }} />
        </span>
        <span className="sr-only" aria-live="polite">
          {items[active]?.name}
        </span>
      </div>

      <ol className="x-show-list">
        {items.map((item, index) => (
          <li key={item.id} className={index === active ? 'is-on' : undefined}>
            <Link
              href={`/${locale}/sectors/${item.slug}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span className="x-show-thumb">
                <img src={item.image} alt="" loading="lazy" />
                <i>{String(index + 1).padStart(2, '0')}</i>
              </span>
              <span className="x-show-t">
                <b>{item.name}</b>
                <small>{item.tagline}</small>
              </span>
              <span className="x-show-c">
                {item.services}
                <i>{locale === 'ar' ? 'خدمة' : 'svc'}</i>
              </span>
              <span className="x-show-a">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
