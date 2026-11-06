import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ServiceGrid from '@/components/service-grid';
import SectorCompanies from '@/components/sector-companies';
import PhotoGallery from '@/components/photo-gallery';
import { Counter } from '@/components/x-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building, Check, Phone, Pin } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { jsonLd, siteUrl } from '@/lib/jsonld';
import { getCompanies, getProjects, getSector, getSectors, getServices } from '@/lib/queries';
import { telHref } from '@/lib/site-settings';
import { usableGallery } from '@/lib/sector-media';
import { getSiteSettings } from '@/lib/site-settings.server';

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const sector = await getSector(slug);
  if (!sector) return {};
  const name = pick(sector, 'name', locale);
  const summary = pick(sector, 'summary', locale);
  return {
    title: name,
    description: summary,
    alternates: {
      canonical: `/${locale}/sectors/${slug}`,
      languages: { ar: `/ar/sectors/${slug}`, en: `/en/sectors/${slug}` },
    },
    openGraph: { title: name, description: summary, images: sector.hero_url ? [sector.hero_url] : [] },
  };
}

export default async function SectorPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const PrevArrow = ar ? ArrowRight : ArrowLeft;
  const NextArrow = ar ? ArrowLeft : ArrowRight;

  const sector = await getSector(slug);
  if (!sector) notFound();

  const [services, sectors, projects, companies, settings] = await Promise.all([
    getServices(sector.id),
    getSectors(),
    getProjects(false),
    getCompanies(),
    getSiteSettings(),
  ]);

  const index = sectors.findIndex((item) => item.id === sector.id);
  const prev = sectors[(index - 1 + sectors.length) % sectors.length];
  const next = sectors[(index + 1) % sectors.length];
  const related = projects
    .filter((project) => project.sector_id === sector.id)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.sort_order - b.sort_order)
    .slice(0, 6);
  const sectorCompanies = companies.filter((company) => company.sector_id === sector.id);
  const companyNames = new Map(companies.map((company) => [company.id, pick(company, 'name', locale)]));
  const body = pick(sector, 'body', locale);
  const name = pick(sector, 'name', locale);

  const gallery = usableGallery(settings.gallery[sector.id]);
  const workImages = gallery.length
    ? gallery
    : Array.from(new Set(related.map((project) => project.cover_url).filter((url): url is string => Boolean(url))));
  const introCover = workImages[0] ?? sector.hero_url ?? '/media/projects/p4.webp';

  const showcaseStats = [
    { value: services.length, label: ar ? 'خدمة متاحة' : 'Services' },
    { value: sectorCompanies.length, label: ar ? 'شركة تابعة' : 'Companies' },
    { value: related.length, label: ar ? 'مشروع' : 'Projects' },
  ].filter((stat) => stat.value > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: t.nav.home, item: `${siteUrl()}/${locale}` },
                { '@type': 'ListItem', position: 2, name: t.nav.sectors, item: `${siteUrl()}/${locale}/sectors` },
                { '@type': 'ListItem', position: 3, name, item: `${siteUrl()}/${locale}/sectors/${sector.slug}` },
              ],
            },
            {
              '@type': 'Service',
              name,
              description: pick(sector, 'summary', locale),
              url: `${siteUrl()}/${locale}/sectors/${sector.slug}`,
              image: sector.hero_url ? `${siteUrl()}${sector.hero_url}` : undefined,
              provider: { '@id': `${siteUrl()}/#organization` },
              areaServed: { '@type': 'Country', name: ar ? 'سلطنة عُمان' : 'Oman' },
            },
          ],
        })}
      />

      <section className="x-sh">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>
        {sector.hero_url ? (
          <img className="x-sh-img" src={sector.hero_url} alt="" data-parallax="0.04" />
        ) : null}
        <span className="x-sh-veil" aria-hidden="true" />
        <span className="x-sh-ghost" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="container x-sh-inner">
          <nav className="x-sh-crumbs" aria-label="breadcrumb">
            <Link href={`/${locale}`}>{t.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/sectors`}>{t.nav.sectors}</Link>
            <span aria-hidden="true">/</span>
            <b>{name}</b>
          </nav>

          <div className="x-sh-top">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {t.nav.sectors}
            </span>
            <span className="x-cat-count">
              {ar ? `القطاع ${index + 1} من ${sectors.length}` : `Sector ${index + 1} of ${sectors.length}`}
            </span>
          </div>

          <h1 className="x-sh-title">{name}</h1>
          {pick(sector, 'tagline', locale) ? <p className="x-sh-tag">{pick(sector, 'tagline', locale)}</p> : null}

          <div className="x-sh-foot">
            <p className="x-sh-sum">{pick(sector, 'summary', locale)}</p>
            {showcaseStats.length ? (
              <div className="x-cat-stats">
                {showcaseStats.map((stat) => (
                  <div key={stat.label}>
                    <b>
                      <Counter value={stat.value} />
                    </b>
                    <small>{stat.label}</small>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="x-sector">
        <div className="container x-sector-grid">
          <div className="x-sector-main">
            <div className="x-sector-intro">
              <div className="x-sector-intro-media reveal">
                <img src={introCover} alt={name} loading="lazy" data-parallax="0.035" />
                <span className="x-sector-intro-tag">
                  {ar ? `القطاع ${String(index + 1).padStart(2, '0')}` : `Sector ${String(index + 1).padStart(2, '0')}`}
                </span>
              </div>

              <div className="x-sector-intro-copy reveal">
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {ar ? 'نبذة عن القطاع' : 'Sector overview'}
                </span>
                <h2 className="x-h2">
                  {ar ? 'خبرة نضعها في' : 'Experience built for'}
                  <br />
                  <em>{ar ? 'خدمة مشروعك.' : 'your next project.'}</em>
                </h2>
                <p>{pick(sector, 'summary', locale)}</p>

                {services.length ? (
                  <ul className="x-cred">
                    {services.slice(0, 4).map((service) => (
                      <li key={service.id}>
                        <Check size={16} />
                        {pick(service, 'name', locale)}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link href={`/${locale}/request?sector=${sector.id}`} className="x-link">
                  {t.nav.request} <Arrow size={16} />
                </Link>
              </div>
            </div>

            {body ? <article className="x-prose reveal" dangerouslySetInnerHTML={{ __html: body }} /> : null}

            {workImages.length > 1 ? (
              <section className="x-sector-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {ar ? 'أرشيف القطاع' : 'Sector archive'}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'لقطات من هذا' : 'Scenes from this'}
                      <br />
                      <em>{ar ? 'القطاع.' : 'sector.'}</em>
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

            {services.length ? (
              <section className="x-sector-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {t.sectors.servicesTitle}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'ما نقدمه في هذا' : 'What we deliver in this'}
                      <br />
                      <em>{ar ? 'القطاع.' : 'sector.'}</em>
                    </h2>
                  </div>
                  <span className="x-block-count">{services.length}</span>
                </div>
                <ServiceGrid
                  items={services.map((service) => ({
                    id: service.id,
                    name: pick(service, 'name', locale),
                    summary: pick(service, 'summary', locale),
                    requestable: service.is_requestable,
                    body: pick(service, 'body', locale),
                    image: service.image_url,
                    company: service.company_id ? (companyNames.get(service.company_id) ?? '') : '',
                  }))}
                  locale={locale}
                  requestLabel={t.sectors.requestService}
                />
              </section>
            ) : null}

            {sectorCompanies.length ? (
              <section className="x-sector-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {t.nav.companies}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'شركات تعمل تحت' : 'Companies under'}
                      <br />
                      <em>{ar ? 'هذا القطاع.' : 'this sector.'}</em>
                    </h2>
                  </div>
                  <span className="x-block-count">{sectorCompanies.length}</span>
                </div>
                <SectorCompanies
                  items={sectorCompanies.map((company) => ({
                    id: company.id,
                    slug: company.slug,
                    name: pick(company, 'name', locale),
                    description: pick(company, 'description', locale),
                    website: company.website,
                    logo: company.logo_url,
                  }))}
                  locale={locale}
                />
              </section>
            ) : null}
          </div>

          <aside className="x-sector-aside">
            <div className="x-side-sticky">
              <div className="x-side-card">
                <span className="x-eyebrow light">
                  <i aria-hidden="true" />
                  {t.nav.request}
                </span>
                <h3>{t.home.quoteTitle}</h3>
                <p>{t.home.quoteText}</p>
                <Link href={`/${locale}/request?sector=${sector.id}`} className="x-btn x-btn-accent">
                  {t.nav.request} <Arrow size={16} />
                </Link>
                <a href={telHref(settings.phone)} className="x-side-tel" dir="ltr">
                  <Phone size={15} /> {settings.phone}
                </a>
              </div>

              <nav className="x-side-list" aria-label={t.nav.sectors}>
                <span className="x-side-list-head">{ar ? 'كل القطاعات' : 'All sectors'}</span>
                {sectors.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/sectors/${item.slug}`}
                    aria-current={item.id === sector.id ? 'page' : undefined}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {pick(item, 'name', locale)}
                    <i aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="x-rel">
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {t.nav.projects}
                </span>
                <h2 className="x-h2">
                  {ar ? 'مشاريع من هذا' : 'Projects in this'}
                  <br />
                  <em>{ar ? 'القطاع.' : 'sector.'}</em>
                </h2>
              </div>
              <Link href={`/${locale}/projects`} className="x-link">
                {t.common.viewAll} <Arrow size={16} />
              </Link>
            </div>

            <div className="x-rel-grid">
              {related.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/${locale}/projects/${project.slug}`}
                  className={`x-rel-card reveal${i === 0 ? ' is-lead' : ''}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <span className="x-rel-media">
                    {project.cover_url ? (
                      <img
                        src={project.cover_url}
                        alt={pick(project, 'title', locale)}
                        loading="lazy"
                        data-parallax="0.03"
                      />
                    ) : null}
                    {project.year ? <span className="x-rel-year">{project.year}</span> : null}
                    <span className="x-rel-view" aria-hidden="true">
                      {ar ? 'عرض المشروع' : 'View project'} <ArrowUpRight size={15} />
                    </span>
                  </span>
                  <span className="x-rel-body">
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
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <nav className="x-snav" aria-label={t.nav.sectors}>
        <div className="container x-snav-grid">
          <Link href={`/${locale}/sectors/${prev.slug}`} className="x-snav-a is-prev">
            <small>
              <PrevArrow size={14} /> {t.common.prev}
            </small>
            <b>{pick(prev, 'name', locale)}</b>
          </Link>
          <Link href={`/${locale}/sectors`} className="x-snav-all" aria-label={t.nav.sectors}>
            <Building size={18} />
          </Link>
          <Link href={`/${locale}/sectors/${next.slug}`} className="x-snav-a is-next">
            <small>
              {t.common.next} <NextArrow size={14} />
            </small>
            <b>{pick(next, 'name', locale)}</b>
          </Link>
        </div>
      </nav>
    </>
  );
}
