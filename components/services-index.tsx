import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from './icons';
import { ServiceIcon } from './service-icon';
import type { Locale } from '@/lib/i18n';
import { servicesCount } from '@/lib/plural';

export type ServiceGroupItem = {
  id: string;
  slug: string;
  name: string;
  image?: string | null;
  services: { id: string; slug: string; name: string; summary: string; icon: string }[];
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
  const ar = locale === 'ar';

  return (
    <div className="x-svcards">
      {groups.map((group, groupIndex) => {
        const visible = group.services.slice(0, 4);
        const remaining = group.services.length - visible.length;
        const sectorHref = `/${locale}/sectors/${group.slug}`;

        return (
          <article
            className="x-svcard reveal"
            key={group.id}
            style={
              {
                transitionDelay: `${Math.min(groupIndex * 40, 240)}ms`,
                ...(group.image ? { '--x-card-img': `url(${group.image})` } : {}),
              } as CSSProperties
            }
          >
            {group.image ? <span className="x-svcard-bg" aria-hidden="true" /> : null}

            <div className="x-svcard-top">
              <span className="x-svcard-sector">{servicesCount(group.services.length, locale)}</span>
              <Link href={sectorHref} className="x-svcard-arrow" aria-label={group.name}>
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <h3>
              <Link href={sectorHref}>{group.name}</Link>
            </h3>

            <ul className="x-svcard-tags">
              {visible.map((service) => (
                <li key={service.id}>
                  <Link href={`/${locale}/services/${service.slug}`} className="x-svcard-chip">
                    <ServiceIcon name={service.icon} size={13} />
                    {service.name}
                  </Link>
                </li>
              ))}
              {remaining > 0 ? (
                <li className="is-more">
                  <Link href={sectorHref}>{`+${remaining}`}</Link>
                </li>
              ) : null}
            </ul>

            <Link className="x-svcard-cta" href={sectorHref}>
              {viewLabel}
              <span aria-hidden="true">{ar ? '←' : '→'}</span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
