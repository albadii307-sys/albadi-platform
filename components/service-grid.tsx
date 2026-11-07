'use client';

import Link from 'next/link';
import { ArrowUpRight } from './icons';
import { ServiceIcon } from './service-icon';

export type ServiceItem = {
  id: string;
  slug?: string;
  name: string;
  summary: string;
  requestable: boolean;
  icon?: string;
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
  const ar = locale === 'ar';

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
          <div className="x-svc-head">
            <span className="x-svc-icon">
              <ServiceIcon name={item.icon} size={18} />
            </span>
            <span className="x-svc-n">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <h3>
            {item.slug ? <Link href={`/${locale}/services/${item.slug}`}>{item.name}</Link> : item.name}
          </h3>
          <p>{item.summary}</p>
          {item.body || item.image || item.company ? (
            <details className="x-svc-more">
              <summary>{ar ? 'تفاصيل الخدمة' : 'Service details'}</summary>
              <div className="x-svc-body">
                {item.image ? <img className="x-svc-img" src={item.image} alt={item.name} loading="lazy" /> : null}
                {item.company ? (
                  <p className="x-svc-company">
                    <b>{ar ? 'الشركة المنفذة' : 'Delivered by'}:</b> {item.company}
                  </p>
                ) : null}
                {item.body ? <div dangerouslySetInnerHTML={{ __html: item.body }} /> : null}
              </div>
            </details>
          ) : null}
          <div className="x-svc-foot">
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
            {item.slug ? (
              <Link href={`/${locale}/services/${item.slug}`} className="x-svc-page">
                {ar ? 'صفحة الخدمة' : 'Service page'}
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
