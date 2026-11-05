'use client';

import Link from 'next/link';
import { ArrowUpRight } from './icons';

export type ServiceItem = {
  id: string;
  name: string;
  summary: string;
  requestable: boolean;
  body?: string;
  image?: string | null;
  company?: string;
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
          {item.body || item.image || item.company ? (
            <details className="x-svc-more">
              <summary>{locale === 'ar' ? 'تفاصيل الخدمة' : 'Service details'}</summary>
              <div className="x-svc-body">
                {item.image ? <img className="x-svc-img" src={item.image} alt={item.name} loading="lazy" /> : null}
                {item.company ? (
                  <p className="x-svc-company">
                    <b>{locale === 'ar' ? 'الشركة المنفذة' : 'Delivered by'}:</b> {item.company}
                  </p>
                ) : null}
                {item.body ? <div dangerouslySetInnerHTML={{ __html: item.body }} /> : null}
              </div>
            </details>
          ) : null}
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
