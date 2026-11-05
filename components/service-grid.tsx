'use client';

import Link from 'next/link';
import { ArrowUpRight } from './icons';

export type ServiceItem = {
  id: string;
  name: string;
  summary: string;
  requestable: boolean;
};

export default function ServiceGrid({
  items,
  locale,
  requestLabel,
}: {
  items: ServiceItem[];
  locale: string;
  requestLabel: string;
}) {
  return (
    <div className="x-svc-grid">
      {items.map((item, index) => (
        <article
          key={item.id}
          className="x-svc reveal"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
          }}
        >
          <span className="x-svc-spot" aria-hidden="true" />
          <span className="x-svc-n">{String(index + 1).padStart(2, '0')}</span>
          <h3>{item.name}</h3>
          <p>{item.summary}</p>
          {item.requestable ? (
            <Link href={`/${locale}/request?service=${item.id}`} className="x-svc-cta">
              {requestLabel}
              <ArrowUpRight size={15} />
            </Link>
          ) : (
            <span className="x-svc-cta is-muted" aria-hidden="true">
              <ArrowUpRight size={15} />
            </span>
          )}
        </article>
      ))}
    </div>
  );
}
