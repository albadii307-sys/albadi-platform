import Link from 'next/link';
import { ArrowUpRight } from './icons';
import type { Locale } from '@/lib/i18n';
import { servicesCount } from '@/lib/plural';

export type ServiceGroupItem = {
  id: string;
  slug: string;
  name: string;
  services: { id: string; name: string; summary: string }[];
};

export default function ServicesIndex({
  groups,
  locale,
  viewLabel,
}: {
  groups: ServiceGroupItem[];
  locale: Locale;
  viewLabel: string;
}) {
  return (
    <div className="x-svcards">
      {groups.map((group, groupIndex) => (
        <Link
          href={`/${locale}/sectors/${group.slug}`}
          className="x-svcard reveal"
          key={group.id}
          style={{ transitionDelay: `${Math.min(groupIndex * 40, 240)}ms` }}
        >
          <span className="x-svcard-top">
            <span className="x-svcard-sector">{servicesCount(group.services.length, locale)}</span>
            <ArrowUpRight size={15} />
          </span>
          <h3>{group.name}</h3>
          <ul className="x-svcard-tags">
            {group.services.slice(0, 2).map((service) => (
              <li key={service.id}>{service.name}</li>
            ))}
            {group.services.length > 2 ? (
              <li className="is-more">+{group.services.length - 2}</li>
            ) : null}
          </ul>
          <span className="x-svcard-cta">{viewLabel}</span>
        </Link>
      ))}
    </div>
  );
}
