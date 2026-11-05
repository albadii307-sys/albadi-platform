'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from './icons';

export type ExplorerItem = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  services: string[];
  serviceCount: number;
  companyCount: number;
};

export default function SectorsExplorer({ items, locale }: { items: ExplorerItem[]; locale: string }) {
  const [active, setActive] = useState(0);
  const ar = locale === 'ar';

  return (
    <ol className="x-ex">
      {items.map((item, index) => {
        const on = index === active;
        const num = String(index + 1).padStart(2, '0');
        return (
          <li
            key={item.id}
            className={on ? 'is-on' : undefined}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <Link href={`/${locale}/sectors/${item.slug}`}>
              <span className="x-ex-n">{num}</span>
              <span className="x-ex-main">
                <b>{item.name}</b>
                <small>{item.tagline}</small>
                <span className="x-ex-chips">
                  {item.services.slice(0, 5).map((service) => (
                    <span key={service}>{service}</span>
                  ))}
                  {item.serviceCount > 5 ? <span className="is-more">+{item.serviceCount - 5}</span> : null}
                </span>
              </span>
              <span className="x-ex-meta">
                <b>{item.serviceCount}</b>
                <small>{ar ? 'خدمة' : 'svc'}</small>
              </span>
              <span className="x-ex-a">
                <ArrowUpRight size={18} />
              </span>
            </Link>
            <span className="x-ex-ghost" aria-hidden="true">
              {num}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
