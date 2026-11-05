import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getProject, getProjects, getSectors } from '@/lib/queries';
import { Calendar, Building, Pin, ArrowLeft, ArrowRight } from '@/components/icons';

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: pick(project, 'title', locale),
    description: pick(project, 'body', locale).replace(/<[^>]+>/g, ' ').slice(0, 160),
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { ar: `/ar/projects/${slug}`, en: `/en/projects/${slug}` },
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const project = await getProject(slug);
  if (!project) notFound();

  const [sectors, all] = await Promise.all([getSectors(), getProjects()]);
  const sector = sectors.find((item) => item.id === project.sector_id);
  const related = all.filter((item) => item.id !== project.id && item.sector_id === project.sector_id).slice(0, 3);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHero
        locale={locale}
        title={pick(project, 'title', locale)}
        crumbs={[
          { label: t.nav.projects, href: `/${locale}/projects` },
          { label: pick(project, 'title', locale) },
        ]}
      />

      <section className="section">
        <div className="container with-sidebar">
          <div className="page-body" style={{ gridColumn: '1 / -1', maxWidth: 900 }}>
            {project.cover_url ? (
              <div className="article-hero" style={{ aspectRatio: '16 / 9' }}>
                <img src={project.cover_url} alt={pick(project, 'title', locale)} />
              </div>
            ) : null}

            <div className="service-card" style={{ marginBottom: 32 }}>
              <div className="project-meta" style={{ gap: 28, fontSize: '0.86rem' }}>
                {project.client_ar ? (
                  <span>
                    <Building size={16} /> {t.projects.client}: {pick(project, 'client', locale)}
                  </span>
                ) : null}
                {project.location_ar ? (
                  <span>
                    <Pin size={16} /> {pick(project, 'location', locale)}
                  </span>
                ) : null}
                {project.year ? (
                  <span>
                    <Calendar size={16} /> {t.projects.year}: {project.year}
                  </span>
                ) : null}
                {sector ? (
                  <span>
                    {t.projects.sector}:{' '}
                    <Link href={`/${locale}/sectors/${sector.slug}`} style={{ color: 'var(--green-700)', fontWeight: 600 }}>
                      {pick(sector, 'name', locale)}
                    </Link>
                  </span>
                ) : null}
              </div>
            </div>

            {pick(project, 'body', locale) ? (
              <article className="article" dangerouslySetInnerHTML={{ __html: pick(project, 'body', locale) }} />
            ) : null}

            <div style={{ display: 'flex', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
              <Link href={`/${locale}/request?sector=${project.sector_id ?? ''}`} className="btn btn-orange">
                {t.nav.request}
              </Link>
              <Link href={`/${locale}/projects`} className="btn btn-ghost">
                {t.nav.projects} <Arrow size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="section section-sand">
          <div className="container">
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 24 }}>
              {t.common.relatedProjects}
            </h2>
            <div className="project-grid">
              {related.map((item) => (
                <Link key={item.id} href={`/${locale}/projects/${item.slug}`} className="project-card">
                  <div className="project-card-media">
                    {item.cover_url ? <img src={item.cover_url} alt="" loading="lazy" /> : null}
                  </div>
                  <div className="project-card-body">
                    <h3>{pick(item, 'title', locale)}</h3>
                    <div className="project-meta">
                      <span>
                        <Pin size={14} /> {pick(item, 'location', locale)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
