import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGallery from '@/components/photo-gallery';
import ServiceGrid from '@/components/service-grid';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building, Globe, Phone } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { jsonLd, siteUrl } from '@/lib/jsonld';
import { getCompanies, getCompany, getProjects, getSectors, getServices } from '@/lib/queries';
import { SECTOR_MEDIA, usableGallery } from '@/lib/sector-media';
import { telHref } from '@/lib/site-settings';
import { getSiteSettings } from '@/lib/site-settings.server';

type Params = { params: Promise<{ locale: string; slug: string }> };

function plain(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function external(value: string | null): string | null {
  return value && /^https?:\/\//i.test(value) ? value : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const company = await getCompany(slug);
  if (!company) return {};

  const [sectors, settings] = await Promise.all([getSectors(), getSiteSettings()]);
  const sector = sectors.find((item) => item.id === company.sector_id);
  const name = pick(company, 'name', locale);
  const description = plain(pick(company, 'description', locale)).slice(0, 160);
  const cover = sector
    ? SECTOR_MEDIA[sector.slug]?.image ?? sector.hero_url ?? settings.gallery[sector.id]?.[0]
    : null;

  return {
    title: name,
    description,
    alternates: {
      canonical: `/${locale}/companies/${slug}`,
      languages: { ar: `/ar/companies/${slug}`, en: `/en/companies/${slug}` },
    },
    openGraph: { title: name, description, images: cover ? [cover] : [] },
  };
}

export default async function CompanyPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const NextArrow = ar ? ArrowLeft : ArrowRight;

  const company = await getCompany(slug);
  if (!company) notFound();

  const [sectors, companies, services, projects, settings] = await Promise.all([
    getSectors(),
    getCompanies(),
    getServices(),
    getProjects(false),
    getSiteSettings(),
  ]);

  const sector = sectors.find((item) => item.id === company.sector_id);
  const name = pick(company, 'name', locale);
  const description = pick(company, 'description', locale);
  const website = external(company.website);
  const websiteLabel = website ? website.replace(/^https?:\/\//i, '').replace(/\/$/, '') : '';

  const cover = sector
    ? SECTOR_MEDIA[sector.slug]?.image ?? sector.hero_url ?? settings.gallery[sector.id]?.[0]
    : null;

  const sectorServices = sector
    ? services
        .filter((service) => service.sector_id === sector.id)
        .sort((a, b) => a.sort_order - b.sort_order)
    : [];
  const companyServices = sectorServices.filter((service) => service.company_id === company.id);
  const offeredServices = companyServices.length ? companyServices : sectorServices;

  const sectorProjects = sector
    ? projects
        .filter((project) => project.sector_id === sector.id)
        .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.sort_order - b.sort_order)
    : [];
  const relatedProjects = sectorProjects.slice(0, 3);

  const curatedGallery = sector ? usableGallery(settings.gallery[sector.id]) : [];
  const gallery = curatedGallery.length
    ? curatedGallery
    : Array.from(
        new Set(
          sectorProjects
            .map((project) => project.cover_url)
            .filter((url): url is string => Boolean(url))
        )
      );

  const facts: { label: string; value: ReactNode }[] = [];
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
  if (sectorServices.length) {
    facts.push({ label: ar ? 'الخدمات المتاحة' : 'Services', value: String(sectorServices.length) });
  }
  if (sectorProjects.length) {
    facts.push({ label: ar ? 'مشاريع القطاع' : 'Sector projects', value: String(sectorProjects.length) });
  }
  if (website) {
    facts.push({
      label: ar ? 'الموقع الإلكتروني' : 'Website',
      value: (
        <a href={website} target="_blank" rel="noreferrer noopener" className="x-pd-fact-link" dir="ltr">
          {websiteLabel} <ArrowUpRight size={13} />
        </a>
      ),
    });
  }
  facts.push({
    label: ar ? 'الشركة الأم' : 'Parent group',
    value: (
      <Link href={`/${locale}/about`} className="x-pd-fact-link">
        {ar ? 'مجموعة البادي' : 'Al-Badi Group'} <ArrowUpRight size={13} />
      </Link>
    ),
  });

  const others = [...companies].sort((a, b) => {
    const aSame = a.sector_id === company.sector_id ? 0 : 1;
    const bSame = b.sector_id === company.sector_id ? 0 : 1;
    return aSame - bSame || a.sort_order - b.sort_order;
  });

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
                { '@type': 'ListItem', position: 2, name: t.nav.companies, item: `${siteUrl()}/${locale}/companies` },
                { '@type': 'ListItem', position: 3, name, item: `${siteUrl()}/${locale}/companies/${company.slug}` },
              ],
            },
            {
              '@type': 'Organization',
              name,
              description,
              url: `${siteUrl()}/${locale}/companies/${company.slug}`,
              logo: company.logo_url ? `${siteUrl()}${company.logo_url}` : undefined,
              parentOrganization: { '@id': `${siteUrl()}/#organization` },
              ...(website ? { sameAs: [website] } : {}),
              ...(sector ? { knowsAbout: pick(sector, 'name', locale) } : {}),
            },
          ],
        })}
      />

      <section className="x-sh x-co-hero">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>
        {cover ? <img className="x-sh-img" src={cover} alt="" data-parallax="0.04" /> : null}
        <span className="x-sh-veil" aria-hidden="true" />

        <div className="container x-sh-inner">
          <nav className="x-sh-crumbs" aria-label="breadcrumb">
            <Link href={`/${locale}`}>{t.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/companies`}>{t.nav.companies}</Link>
            <span aria-hidden="true">/</span>
            <b>{name}</b>
          </nav>

          <div className="x-sh-top">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {sector ? pick(sector, 'name', locale) : t.nav.companies}
            </span>
            <span className="x-cat-count">{ar ? 'إحدى شركات المجموعة' : 'A group company'}</span>
          </div>

          <div className="x-co-hero-head">
            {company.logo_url ? (
              <span className="x-co-hero-logo">
                <img src={company.logo_url} alt={name} />
              </span>
            ) : null}
            <h1 className="x-sh-title">{name}</h1>
          </div>

          {description ? <p className="x-co-hero-desc">{description}</p> : null}

          <div className="x-pd-hero-meta">
            {sector ? (
              <span>
                <Building size={15} />
                <Link href={`/${locale}/sectors/${sector.slug}`}>{pick(sector, 'name', locale)}</Link>
              </span>
            ) : null}
            {website ? (
              <span>
                <Globe size={15} />
                <a href={website} target="_blank" rel="noreferrer noopener" dir="ltr">
                  {websiteLabel}
                </a>
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
                {ar ? 'عن الشركة' : 'About the company'}
              </span>
              <h2 className="x-h2">
                {ar ? 'تخصص واضح' : 'Focused expertise'}
                <br />
                <em>{ar ? 'داخل منظومة المجموعة.' : 'inside the group.'}</em>
              </h2>
            </div>

            {description ? <p className="x-co-lead reveal">{description}</p> : null}

            {sector ? (
              <div className="x-pd-actions reveal">
                <Link href={`/${locale}/request?sector=${sector.id}`} className="x-btn x-btn-accent">
                  {t.nav.request} <Arrow size={16} />
                </Link>
                <Link href={`/${locale}/sectors/${sector.slug}`} className="x-btn x-btn-ghost">
                  {pick(sector, 'name', locale)} <Arrow size={16} />
                </Link>
              </div>
            ) : null}

            {offeredServices.length ? (
              <section className="x-sector-block x-co-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {companyServices.length
                        ? ar
                          ? 'خدمات الشركة'
                          : 'Company services'
                        : t.sectors.servicesTitle}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'ما نقدمه من' : 'What this company'}
                      <br />
                      <em>{ar ? 'خلال هذه الشركة.' : 'delivers.'}</em>
                    </h2>
                  </div>
                  <span className="x-block-count">{offeredServices.length}</span>
                </div>
                <ServiceGrid
                  items={offeredServices.map((service) => ({
                    id: service.id,
                    name: pick(service, 'name', locale),
                    summary: pick(service, 'summary', locale),
                    requestable: service.is_requestable,
                    body: pick(service, 'body', locale),
                    image: service.image_url,
                    company: '',
                  }))}
                  locale={locale}
                  requestLabel={t.sectors.requestService}
                />
              </section>
            ) : null}

            {relatedProjects.length ? (
              <section className="x-sector-block x-co-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {t.nav.projects}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'مشاريع من قطاع' : 'Projects from the'}
                      <br />
                      <em>{ar ? 'عمل الشركة.' : 'same sector.'}</em>
                    </h2>
                  </div>
                  <span className="x-block-count">{sectorProjects.length}</span>
                </div>
                <div className="x-rel-grid">
                  {relatedProjects.map((project, i) => (
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
                          {project.location_ar || project.location_en ? (
                            <span>{pick(project, 'location', locale)}</span>
                          ) : null}
                          {project.client_ar || project.client_en ? (
                            <span>{pick(project, 'client', locale)}</span>
                          ) : null}
                        </small>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {gallery.length > 1 ? (
              <section className="x-sector-block x-co-block">
                <div className="x-block-head reveal">
                  <div>
                    <span className="x-eyebrow">
                      <i aria-hidden="true" />
                      {ar ? 'من أعمالنا' : 'Our work'}
                    </span>
                    <h2 className="x-h2">
                      {ar ? 'صور من' : 'Photographs from'}
                      <br />
                      <em>{ar ? 'قطاع الشركة.' : 'the sector.'}</em>
                    </h2>
                  </div>
                  <span className="x-block-count">{gallery.length}</span>
                </div>
                <PhotoGallery
                  images={gallery}
                  name={sector ? pick(sector, 'name', locale) : name}
                  locale={locale}
                  countLabel={ar ? 'صورة' : 'Photo'}
                />
              </section>
            ) : null}
          </div>

          <aside className="x-pd-aside">
            <div className="x-side-sticky">
              <div className="x-pd-facts">
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {ar ? 'بطاقة الشركة' : 'Company facts'}
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
                <Link
                  href={`/${locale}/request${sector ? `?sector=${sector.id}` : ''}`}
                  className="x-btn x-btn-accent"
                >
                  {t.nav.request} <Arrow size={16} />
                </Link>
                <a href={telHref(settings.phone)} className="x-side-tel" dir="ltr">
                  <Phone size={15} /> {settings.phone}
                </a>
              </div>

              <nav className="x-side-list" aria-label={t.nav.companies}>
                <span className="x-side-list-head">{ar ? 'شركات المجموعة' : 'Group companies'}</span>
                {others.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/${locale}/companies/${item.slug}`}
                    aria-current={item.id === company.id ? 'page' : undefined}
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

      {sector ? (
        <nav className="x-snav" aria-label={t.nav.companies}>
          <div className="container x-snav-grid">
            <Link href={`/${locale}/companies`} className="x-snav-a is-prev">
              <small>
                <NextArrow size={14} /> {t.nav.companies}
              </small>
              <b>{ar ? 'كل الشركات' : 'All companies'}</b>
            </Link>
            <Link href={`/${locale}/sectors/${sector.slug}`} className="x-snav-all" aria-label={pick(sector, 'name', locale)}>
              <Building size={18} />
            </Link>
            <Link href={`/${locale}/sectors/${sector.slug}`} className="x-snav-a is-next">
              <small>
                {ar ? 'القطاع' : 'Sector'} <Arrow size={14} />
              </small>
              <b>{pick(sector, 'name', locale)}</b>
            </Link>
          </div>
        </nav>
      ) : null}
    </>
  );
}
