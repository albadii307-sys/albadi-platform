import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Counter } from '@/components/x-motion';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getProjects, getSectors } from '@/lib/queries';
import { ArrowUpRight, Clock, Pin } from '@/components/icons';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sector?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.projects.title,
    description: t.projects.subtitle,
    alternates: { canonical: `/${l}/projects`, languages: { ar: '/ar/projects', en: '/en/projects' } },
  };
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const { sector } = await searchParams;
  const t = getDict(locale);
  const ar = locale === 'ar';

  const [rows, sectors] = await Promise.all([getProjects(), getSectors()]);
  const projects = [...rows].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0) || a.sort_order - b.sort_order
  );
  const activeSector = sector ? sectors.find((item) => item.slug === sector) : undefined;
  const filtered = activeSector ? projects.filter((project) => project.sector_id === activeSector.id) : projects;
  const featured = projects.filter((project) => project.is_featured).length;
  const latestYear = projects.find((project) => project.year)?.year ?? null;

  return (
    <>
      <section className="x-cat-hero">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>
        <div className="container">
          <div className="x-cat-top">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {t.nav.projects}
            </span>
            <span className="x-cat-count">
              {projects.length} {ar ? 'مشروع' : 'projects'}
            </span>
          </div>

          <h1 className="x-cat-title">
            {ar ? 'أعمال نفخر' : 'Work we are'}
            <br />
            <em>{ar ? 'بإنجازها.' : 'proud of.'}</em>
          </h1>

          <div className="x-cat-foot">
            <p>{t.projects.subtitle}</p>
            <div className="x-cat-stats">
              <div>
                <b>
                  <Counter value={projects.length} />
                </b>
                <small>{ar ? 'مشروع منفذ' : 'Projects'}</small>
              </div>
              <div>
                <b>
                  <Counter value={featured} />
                </b>
                <small>{ar ? 'مشروع بارز' : 'Featured'}</small>
              </div>
              <div>
                <b>
                  <Counter value={new Set(projects.map((project) => project.sector_id).filter(Boolean)).size} />
                </b>
                <small>{ar ? 'قطاع' : 'Sectors'}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="x-pf-section">
        <div className="container">
          <nav className="x-pf-tabs" aria-label={t.nav.sectors}>
            <Link href={`/${locale}/projects`} className={`x-pf-tab${!activeSector ? ' is-on' : ''}`}>
              {t.common.all}
              <span>{projects.length}</span>
            </Link>
            {sectors.map((item) => {
              const count = projects.filter((project) => project.sector_id === item.id).length;
              if (!count) return null;
              return (
                <Link
                  key={item.id}
                  href={`/${locale}/projects?sector=${item.slug}`}
                  className={`x-pf-tab${activeSector?.id === item.id ? ' is-on' : ''}`}
                >
                  {pick(item, 'name', locale)}
                  <span>{count}</span>
                </Link>
              );
            })}
          </nav>

          <div className="x-pf-active">
            <Clock size={16} />
            <span>
              {activeSector
                ? ar
                  ? `مشاريع قطاع ${pick(activeSector, 'name', locale)} — من الأحدث إلى الأقدم.`
                  : `${pick(activeSector, 'name', locale)} projects — newest first.`
                : ar
                  ? `سجل المشاريع المنفذة${latestYear ? ` حتى ${latestYear}` : ''} — مرتبة من الأحدث إلى الأقدم.`
                  : `Delivered project record${latestYear ? ` through ${latestYear}` : ''} — newest first.`}
            </span>
            {activeSector ? (
              <Link href={`/${locale}/sectors/${activeSector.slug}`}>
                {ar ? 'صفحة القطاع' : 'Sector page'} <ArrowUpRight size={14} />
              </Link>
            ) : null}
          </div>

          {filtered.length ? (
            <div className="x-pf">
              {filtered.map((project, index) => {
                const variant = index === 0 ? 'is-lead' : index % 5 === 4 ? 'is-wide' : 'is-half';
                return (
                  <Link
                    key={project.id}
                    href={`/${locale}/projects/${project.slug}`}
                    className={`x-pf-card ${variant} reveal`}
                    style={{ transitionDelay: `${(index % 4) * 70}ms` }}
                  >
                    <span className="x-pf-media">
                      {project.cover_url ? (
                        <img
                          src={project.cover_url}
                          alt={pick(project, 'title', locale)}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          data-parallax={index === 0 ? '0.03' : undefined}
                        />
                      ) : null}
                      <span className="x-pf-shade" aria-hidden="true" />
                      {project.is_featured ? (
                        <span className="x-pf-flag">{ar ? 'مشروع بارز' : 'Featured'}</span>
                      ) : null}
                      {project.year ? <span className="x-pf-year">{project.year}</span> : null}
                      <span className="x-pf-view" aria-hidden="true">
                        {ar ? 'عرض المشروع' : 'View project'} <ArrowUpRight size={15} />
                      </span>
                    </span>
                    <span className="x-pf-body">
                      <b>{pick(project, 'title', locale)}</b>
                      <small>
                        {project.location_ar ? (
                          <span>
                            <Pin size={13} /> {pick(project, 'location', locale)}
                          </span>
                        ) : null}
                        {project.client_ar ? <span>{pick(project, 'client', locale)}</span> : null}
                      </small>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="x-pf-empty">{t.common.empty}</p>
          )}
        </div>
      </section>
    </>
  );
}
