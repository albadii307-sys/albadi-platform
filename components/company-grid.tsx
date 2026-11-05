'use client';

import Link from 'next/link';
import { ArrowUpRight, Building } from './icons';

export type CompanyItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sector: string;
  sectorSlug: string;
  website: string | null;
  logo: string | null;
};

const prefixes = ['شركة', 'مؤسسة', 'فندق', 'مدرسة', 'مجموعة'];

function monogram(name: string) {
  const word = name.split(/\s+/).find((part) => !prefixes.includes(part)) ?? name;
  return word.replace(/^ال/, '').charAt(0);
}

export function CompanyCard({ item, index, locale }: { item: CompanyItem; index: number; locale: string }) {
  const href = item.website || `/${locale}/sectors/${item.sectorSlug}`;
  const external = Boolean(item.website);
  return (
    <Link
      id={`company-${item.slug}`}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`x-co reveal${index === 0 ? ' is-lead' : ''}`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }}
    >
      <span className="x-co-spot" aria-hidden="true" />
      <span className="x-co-n">{String(index + 1).padStart(2, '0')}</span>
      {item.logo ? (
        <span className="x-co-logo">
          <img src={item.logo} alt={item.name} loading="lazy" />
        </span>
      ) : (
        <span className="x-co-mono" aria-hidden="true">
          {monogram(item.name)}
        </span>
      )}
      <span className="x-co-tag">
        <Building size={13} />
        {item.sector}
      </span>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <span className="x-co-go">
        {external ? (locale === 'ar' ? 'الموقع الإلكتروني' : 'Website') : locale === 'ar' ? 'استكشف القطاع' : 'Explore sector'}
        <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}

export default function CompanyGrid({ items, locale }: { items: CompanyItem[]; locale: string }) {
  return (
    <div className="x-co-grid">
      {items.map((item, index) => (
        <CompanyCard key={item.id} item={item} index={index} locale={locale} />
      ))}
    </div>
  );
}
