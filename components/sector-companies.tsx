'use client';

import Link from 'next/link';
import { ArrowUpRight } from './icons';

export type SectorCompanyItem = {
  id: string;
  name: string;
  description: string;
  website: string | null;
  logo: string | null;
};

const prefixes = ['شركة', 'مؤسسة', 'فندق', 'مدرسة', 'مجموعة'];

function monogram(name: string) {
  const word = name.split(/\s+/).find((part) => !prefixes.includes(part)) ?? name;
  return word.replace(/^ال/, '').charAt(0);
}

export default function SectorCompanies({
  items,
  locale,
}: {
  items: SectorCompanyItem[];
  locale: string;
}) {
  return (
    <div className="x-sco">
      {items.map((item, index) => {
        const href = item.website || `/${locale}/companies`;
        const external = Boolean(item.website);
        return (
          <Link
            key={item.id}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="x-sco-card reveal"
            onPointerMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
              event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
            }}
          >
            <span className="x-co-spot" aria-hidden="true" />
            <span className="x-sco-n">{String(index + 1).padStart(2, '0')}</span>
            {item.logo ? (
              <span className="x-sco-logo">
                <img src={item.logo} alt={item.name} loading="lazy" />
              </span>
            ) : (
              <span className="x-sco-mono" aria-hidden="true">
                {monogram(item.name)}
              </span>
            )}
            <span className="x-sco-body">
              <b>{item.name}</b>
              <small>{item.description}</small>
            </span>
            <span className="x-sco-go" aria-hidden="true">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
