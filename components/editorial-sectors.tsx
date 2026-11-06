import Link from 'next/link';
import SectorIndexNav from './sector-index-nav';
import { ArrowUpRight } from './icons';
import type { Locale } from '@/lib/types';

export type EditorialSector = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  services: number;
  companies: number;
  image: string;
  logo: string | null;
};

export default function EditorialSectors({
  items,
  locale,
  showIndex = false,
}: {
  items: EditorialSector[];
  locale: Locale;
  showIndex?: boolean;
}) {
  const ar = locale === 'ar';

  return (
    <div className="x-ed-wrap">
      {showIndex ? (
        <SectorIndexNav items={items} label={ar ? 'فهرس القطاعات' : 'Sector index'} />
      ) : null}

      <div className="x-ed">
      {items.map((item, index) => {
        const variant = index % 3;
        const flip = Math.floor(index / 3) % 2 === 1;
        const number = String(index + 1).padStart(2, '0');

        return (
          <article
            key={item.id}
            id={`sector-${item.slug}`}
            className={`x-ed-row is-${variant === 0 ? 'split' : variant === 1 ? 'wide' : 'offset'}${flip ? ' is-flip' : ''}`}
          >
            <Link
              href={`/${locale}/sectors/${item.slug}`}
              className="x-ed-media"
              aria-label={`${ar ? 'اكتشف قطاع' : 'Explore sector'} ${item.name}`}
            >
              <img
                src={item.image}
                alt={item.name}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                data-parallax={variant === 1 ? '0.05' : '0.035'}
              />
              <span className="x-ed-shade" aria-hidden="true" />
              {item.logo ? (
                <span className="x-ed-logo">
                  <img src={item.logo} alt="" loading="lazy" />
                </span>
              ) : null}
              <span className="x-ed-num" aria-hidden="true">
                {number}
              </span>
            </Link>

            <div className="x-ed-body">
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {ar ? `القطاع ${number}` : `Sector ${number}`}
              </span>
              <h3 className="x-ed-title">{item.name}</h3>
              {item.tagline ? <p className="x-ed-tag">{item.tagline}</p> : null}
              {item.summary ? <p className="x-ed-sum">{item.summary}</p> : null}

              {item.services > 0 || item.companies > 0 ? (
                <div className="x-ed-meta">
                  {item.services > 0 ? (
                    <div>
                      <b>{item.services}</b>
                      <small>{ar ? 'خدمة متاحة' : 'Services'}</small>
                    </div>
                  ) : null}
                  {item.services > 0 && item.companies > 0 ? <span aria-hidden="true" /> : null}
                  {item.companies > 0 ? (
                    <div>
                      <b>{item.companies}</b>
                      <small>{ar ? 'شركة تابعة' : 'Companies'}</small>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <Link href={`/${locale}/sectors/${item.slug}`} className="x-ed-cta">
                {ar ? 'اكتشف القطاع' : 'Explore the sector'}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        );
      })}
      </div>
    </div>
  );
}
