import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGallery from '@/components/photo-gallery';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building, Calendar, Pin, Phone } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { jsonLd, siteUrl } from '@/lib/jsonld';
import { getProject, getProjects, getSectors } from '@/lib/queries';
import { usableGallery } from '@/lib/sector-media';
import { telHref } from '@/lib/site-settings';
import { getSiteSettings } from '@/lib/site-settings.server';

type Params = { params: Promise<{ locale: string; slug: string }> };

function plain(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const project = await getProject(slug);
  if (!project) return {};
  const title = pick(project, 'title', locale);
  const description = plain(pick(project, 'body', locale)).slice(0, 160);
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { ar: `/ar/projects/${slug}`, en: `/en/projects/${slug}` },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      images: project.cover_url ? [project.cover_url] : [],
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const PrevArrow = ar ? ArrowRight : ArrowLeft;
  const NextArrow = ar ? ArrowLeft : ArrowRight;

  const project = await getProject(slug);
  if (!project) notFound();

  const [sectors, rows, settings] = await Promise.all([getSectors(), getProjects(false), getSiteSettings()]);
  const all = [...rows].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.sort_order - b.sort_order);
  const sector = sectors.find((item) => item.id === project.sector_id);
  const name = pick(project, 'title', locale);
  const body = pick(project, 'body', locale);
  const lead = plain(body).slice(0, 190);
  const gallery = usableGallery(settings.itemGallery[`project:${project.id}`]);
  const workImages = Array.from(
    new Set([project.cover_url, ...gallery].filter((url): url is string => Boolean(url)))
  );

  const inSector = all.filter((item) => item.id !== project.id && item.sector_id === project.sector_id);
  const related = [...inSector];
  if (related.length < 3) {
    for (const item of all) {
      if (related.length >= 3) break;
      if (item.id === project.id || related.some((entry) => entry.id === item.id)) continue;
      if (item.is_featured) related.push(item);
    }
  }
  const relatedItems = related.slice(0, 3);

  const index = all.findIndex((item) => item.id === project.id);
  const prev = all[(index - 1 + all.length) % all.length];
  const next = all[(index + 1) % all.length];

  const crumbs = [
    { name: t.nav.home, path: `/${locale}` },
    { name: t.nav.projects, path: `/${locale}/projects` },
    { name, path: `/${locale}/projects/${project.slug}` },
  ];

  const facts: { label: string; value: ReactElement | string }[] = [];
  if (project.client_ar || project.client_en) {
    facts.push({
      label: t.projects.client,
      value: pick(project, 'client', locale),
    });
  }
  if (project.location_ar || project.location_en) {
    facts.push({
      label: t.projects.location,
      value: (
        <span className="x-pd-fact-in">
          <Pin size={14} /> {pick(project, 'location', locale)}
        </span>
      ),
    });
  }
  if (project.year) {
    facts.push({
      label: t.projects.year,
      value: (
        <span className="x-pd-fact-in">
          <Calendar size={14} /> {project.year}
        </span>
      ),
    });
  }
  if (sector) {
    facts.push({
      label: t.projects.sector,
      value: (
        <Link href={`/${locale}/sectors/${sector.slug}`} className="x-pd-fact-link">
          {pick(sector, 'name', locale)} <ArrowUpRight size={13} />
        </Link>
      ),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: crumbs.map((crumb, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: crumb.name,
                item: `${siteUrl()}${crumb.path}`,
              })),
            },
            {
              '@type': 'CreativeWork',
              name,
              description: lead,
              url: `${siteUrl()}/${locale}/projects/${project.slug}`,
              image: project.cover_url ? `${siteUrl()}${project.cover_url}` : undefined,
              dateCreated: project.year ? `${project.year}` : undefined,
              creator: {
                '@type': 'Organization',
                name: ar ? 'مجموعة البادي للاستثمار القابضة' : 'Al-Badi Investment Holding Group',
              },
              ...(project.location_ar || project.location_en
                ? { locationCreated: { '@type': 'Place', name: pick(project, 'location', locale) } }
                : {}),
            },
          ],
        })}
      />

      <section className="x-sh x-pd-hero">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>
        {project.cover_url ? (
          <img className="x-sh-img" src={project.cover_url} alt="" data-parallax="0.04" fetchPriority="high" decoding="async" />
        ) : null}
        <span className="x-sh-veil" aria-hidden="true" />
        {project.year ? (
          <span className="x-sh-ghost" aria-hidden="true">
            {project.year}
          </span>
        ) : null}

        <div className="container x-sh-inner">
          <nav className="x-sh-crumbs" aria-label="breadcrumb">
            <Link href={`/${locale}`}>{t.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/projects`}>{t.nav.projects}</Link>
            <span aria-hidden="true">/</span>
            <b>{name}</b>
          </nav>

          <div className="x-sh-top">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {sector ? pick(sector, 'name', locale) : t.nav.projects}
            </span>
            {project.is_featured ? <span className="x-cat-count">{ar ? 'مشروع مميز' : 'Featured project'}</span> : null}
          </div>

          <h1 className="x-sh-title">{name}</h1>
          {lead ? <p className="x-sh-tag">{lead}</p> : null}

          <div className="x-pd-hero-meta">
            {project.location_ar || project.location_en ? (
              <span>
                <Pin size={15} /> {pick(project, 'location', locale)}
              </span>
            ) : null}
            {project.client_ar || project.client_en ? (
              <span>
                <Building size={15} /> {pick(project, 'client', locale)}
              </span>
            ) : null}
            {project.year ? (
              <span>
                <Calendar size={15} /> {project.year}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="x-pd">
        <div className="container x-pd-grid">
          <div className="x-pd-main">
            <div className="x-pd-main-head reveal">
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {ar ? 'عن المشروع' : 'About the project'}
              </span>
              <h2 className="x-h2">
                {ar ? 'تفاصيل النطاق' : 'Scope and'}
                <br />
                <em>{ar ? 'والتنفيذ.' : 'delivery.'}</em>
              </h2>
            </div>

            {body ? (
              <article className="x-prose reveal" dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
              <p className="x-pd-empty reveal">
                {ar
                  ? 'تفاصيل هذا المشروع قيد الإضافة. تواصل معنا لمعرفة المزيد عن نطاق العمل.'
                  : 'Project details are being added. Contact us to learn more about the scope of work.'}
              </p>
            )}

            {workImages.length > 1 ? (
              <section className="x-sector-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {ar ? 'صور المشروع' : 'Project gallery'}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'لقطات من' : 'Scenes from'}
                      <br />
                      <em>{ar ? 'موقع العمل.' : 'the site.'}</em>
                    </h2>
                  </div>
                  <span className="x-block-count">{workImages.length}</span>
                </div>
                <PhotoGallery
                  images={workImages}
                  name={name}
                  locale={locale}
                  countLabel={ar ? 'صورة' : 'Photo'}
                />
              </section>
            ) : null}

            <div className="x-pd-actions reveal">
              <Link href={`/${locale}/request?sector=${project.sector_id ?? ''}`} className="x-btn x-btn-accent">
                {t.nav.request} <Arrow size={16} />
              </Link>
              <Link href={`/${locale}/projects`} className="x-btn x-btn-ghost">
                {t.nav.projects} <Arrow size={16} />
              </Link>
            </div>
          </div>

          <aside className="x-pd-aside">
            <div className="x-side-sticky">
              <div className="x-pd-facts">
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {ar ? 'بطاقة المشروع' : 'Project facts'}
                </span>
                <dl>
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="x-pd-card">
                <span className="x-eyebrow light">
                  <i aria-hidden="true" />
                  {t.nav.request}
                </span>
                <h3>{t.home.quoteTitle}</h3>
                <p>{t.home.quoteText}</p>
                <Link href={`/${locale}/request?sector=${project.sector_id ?? ''}`} className="x-btn x-btn-accent">
                  {t.nav.request} <Arrow size={16} />
                </Link>
                <a href={telHref(settings.phone)} className="x-side-tel" dir="ltr">
                  <Phone size={15} /> {settings.phone}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {relatedItems.length ? (
        <section className="x-rel">
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {t.nav.projects}
                </span>
                <h2 className="x-h2">
                  {ar ? 'مشاريع' : 'Projects to'}
                  <br />
                  <em>{ar ? 'مشابهة.' : 'explore next.'}</em>
                </h2>
              </div>
              <Link href={`/${locale}/projects`} className="x-link">
                {t.common.viewAll} <Arrow size={16} />
              </Link>
            </div>

            <div className="x-rel-grid">
              {relatedItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/${locale}/projects/${item.slug}`}
                  className={`x-rel-card reveal${i === 0 ? ' is-lead' : ''}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <span className="x-rel-media">
                    {item.cover_url ? (
                      <img src={item.cover_url} alt={pick(item, 'title', locale)} loading="lazy" data-parallax="0.03" />
                    ) : null}
                    {item.year ? <span className="x-rel-year">{item.year}</span> : null}
                    <span className="x-rel-view" aria-hidden="true">
                      {ar ? 'عرض المشروع' : 'View project'} <ArrowUpRight size={15} />
                    </span>
                  </span>
                  <span className="x-rel-body">
                    <b>{pick(item, 'title', locale)}</b>
                    <small>
                      {item.location_ar ? (
                        <span>
                          <Pin size={13} /> {pick(item, 'location', locale)}
                        </span>
                      ) : null}
                      {item.client_ar ? <span>{pick(item, 'client', locale)}</span> : null}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <nav className="x-snav" aria-label={t.nav.projects}>
        <div className="container x-snav-grid">
          <Link href={`/${locale}/projects/${prev.slug}`} className="x-snav-a is-prev">
            <small>
              <PrevArrow size={14} /> {t.common.prev}
            </small>
            <b>{pick(prev, 'title', locale)}</b>
          </Link>
          <Link href={`/${locale}/projects`} className="x-snav-all" aria-label={t.nav.projects}>
            <Building size={18} />
          </Link>
          <Link href={`/${locale}/projects/${next.slug}`} className="x-snav-a is-next">
            <small>
              {t.common.next} <NextArrow size={14} />
            </small>
            <b>{pick(next, 'title', locale)}</b>
          </Link>
        </div>
      </nav>
    </>
  );
}
