'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from './icons';
import { getDict, type Locale } from '@/lib/i18n';

type Item = { id: string; slug: string; name: string; tagline: string; services: number };

export default function SectorShowcase({ items, locale }: { items: Item[]; locale: Locale }) {
  const t = getDict(locale);
  const [active, setActive] = useState(0);

  return (
    <div className="x-show">
      <div className="x-show-stage" aria-hidden="true">
        {items.map((item, index) => (
          <div key={item.id} className={`x-panel${index === active ? ' is-on' : ''}`}>
            <span className="x-panel-rings" />
            <span className="x-panel-glow" />
            <span className="x-panel-num">{String(index + 1).padStart(2, '0')}</span>
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
      </div>

      <ol className="x-show-list">
        {items.map((item, index) => (
          <li key={item.id} className={index === active ? 'is-on' : undefined}>
            <Link
              href={`/${locale}/sectors/${item.slug}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span className="x-show-n">{String(index + 1).padStart(2, '0')}</span>
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
