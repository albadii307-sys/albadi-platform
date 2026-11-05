import Link from 'next/link';
import type { Locale, NewsItem, Project, Sector } from '@/lib/types';
import { getDict, pick } from '@/lib/i18n';
import { Calendar, Pin, ArrowUpRight } from './icons';

export function formatDate(value: string, locale: Locale) {
  const tag = locale === 'ar' ? 'ar-OM-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(value)
  );
}

export function SectorCard({ sector, locale, index }: { sector: Sector; locale: Locale; index?: number }) {
  return (
    <Link href={`/${locale}/sectors/${sector.slug}`} className="sector-card reveal">
      <span className="sector-index" aria-hidden="true">
        {String((index ?? 0) + 1).padStart(2, '0')}
      </span>
      <span className="card-arrow">
        <ArrowUpRight size={17} />
      </span>
      <div className="sector-card-body">
        {sector.tagline_ar || sector.tagline_en ? (
          <small>{pick(sector, 'tagline', locale)}</small>
        ) : null}
        <h3>{pick(sector, 'name', locale)}</h3>
        <p>{pick(sector, 'summary', locale)}</p>
      </div>
    </Link>
  );
}

export function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const t = getDict(locale);
  return (
    <Link href={`/${locale}/projects/${project.slug}`} className="project-card reveal">
      <div className="project-card-media">
        {project.cover_url && <img src={project.cover_url} alt={pick(project, 'title', locale)} loading="lazy" />}
        {project.year ? <span className="project-tag">{project.year}</span> : null}
      </div>
      <div className="project-card-body">
        <h3>{pick(project, 'title', locale)}</h3>
        <div className="project-meta">
          {project.location_ar && (
            <span>
              <Pin size={14} /> {pick(project, 'location', locale)}
            </span>
          )}
          {project.client_ar && (
            <span>
              <span style={{ opacity: 0.65 }}>{t.projects.client}:</span> {pick(project, 'client', locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function NewsCard({
  item,
  locale,
  reveal = true,
}: {
  item: NewsItem;
  locale: Locale;
  reveal?: boolean;
}) {
  const t = getDict(locale);
  return (
    <Link href={`/${locale}/news/${item.slug}`} className={`news-card${reveal ? ' reveal' : ''}`}>
      <div className="news-card-media">
        {item.cover_url && <img src={item.cover_url} alt="" loading="lazy" />}
      </div>
      <div className="news-card-body">
        <span className="news-date">
          <Calendar size={14} /> {formatDate(item.published_at, locale)}
        </span>
        <h3>{pick(item, 'title', locale)}</h3>
        <p>{pick(item, 'excerpt', locale)}</p>
        <span className="link-arrow" style={{ marginTop: 'auto', paddingTop: 8 }}>
          {t.common.readMore}
        </span>
      </div>
    </Link>
  );
}
