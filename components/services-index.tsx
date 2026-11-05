import Link from 'next/link';
import { ArrowUpRight } from './icons';
import type { Locale } from '@/lib/i18n';

export type ServiceGroupItem = {
  id: string;
  slug: string;
  name: string;
  services: { id: string; name: string; summary: string }[];
};

export default function ServicesIndex({
  groups,
  locale,
  sectorLabel,
  requestLabel,
}: {
  groups: ServiceGroupItem[];
  locale: Locale;
  sectorLabel: string;
  requestLabel: string;
}) {
  return (
    <div className="x-svcx-grid">
      {groups.map((group, groupIndex) => (
        <section className="x-svcx-group reveal" key={group.id}>
          <header className="x-svcx-head">
            <span className="x-svcx-n">{String(groupIndex + 1).padStart(2, '0')}</span>
            <h3>{group.name}</h3>
            <Link href={`/${locale}/sectors/${group.slug}`} className="x-svcx-sector">
              {sectorLabel}
              <ArrowUpRight size={14} />
            </Link>
          </header>
          <ul className="x-svcx-list">
            {group.services.map((service) => (
              <li key={service.id}>
                <Link href={`/${locale}/request?service=${service.id}`}>
                  <span>{service.name}</span>
                  <em>{requestLabel}</em>
                  <ArrowUpRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
