import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building, Check, Phone } from '@/components/icons';
import { ServiceIcon, serviceIconName } from '@/components/service-icon';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { jsonLd, siteUrl } from '@/lib/jsonld';
import { getCompanies, getService, getServices, getSectors } from '@/lib/queries';
import { SECTOR_MEDIA } from '@/lib/sector-media';
import { telHref } from '@/lib/site-settings';
import { getSiteSettings } from '@/lib/site-settings.server';

type Params = { params: Promise<{ locale: string; slug: string }> };

function plain(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const service = await getService(slug);
  if (!service) return {};
  const title = pick(service, 'name', locale);
  const description = plain(pick(service, 'summary', locale) || pick(service, 'body', locale)).slice(0, 160);
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/services/${slug}`,
      languages: { ar: `/ar/services/${slug}`, en: `/en/services/${slug}` },
    },
    openGraph: { title, description, images: service.image_url ? [service.image_url] : [] },
  };
}

export default async function ServicePage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const service = await getService(slug);
  if (!service) notFound();

  const [sectors, companies, services, settings] = await Promise.all([
    getSectors(),
    getCompanies(),
    getServices(service.sector_id ?? undefined),
    getSiteSettings(),
  ]);

  const sector = service.sector_id ? sectors.find((item) => item.id === service.sector_id) : undefined;
  const company = service.company_id ? companies.find((item) => item.id === service.company_id) : undefined;
  const name = pick(service, 'name', locale);
  const summary = pick(service, 'summary', locale);
  const body = pick(service, 'body', locale);
  const icon = serviceIconName(settings.serviceIcons[service.id], sector?.slug, service.slug);
  const cover =
    service.image_url ??
    sector?.hero_url ??
    (sector ? settings.gallery[sector.id]?.[0] : null) ??
    (sector ? SECTOR_MEDIA[sector.slug]?.image : null) ??
    '/media/projects/p4.webp';
  const requestHref = `/${locale}/request?service=${service.id}${sector ? `&sector=${sector.id}` : ''}`;
  const related = services.filter((item) => item.id !== service.id).slice(0, 6);

  const crumbs = [
    { name: t.nav.home, path: `/${locale}` },
    { name: t.nav.services, path: `/${locale}/services` },
    { name, path: `/${locale}/services/${service.slug}` },
  ];

  const facts: { label: string; value: ReactElement | string }[] = [];
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
  if (company) {
    facts.push({
      label: ar ? 'الشركة المنفذة' : 'Delivered by',
      value: (
        <Link href={`/${locale}/companies/${company.slug}`} className="x-pd-fact-link">
          {pick(company, 'name', locale)} <ArrowUpRight size={13} />
        </Link>
      ),
    });
  }
  facts.push({
    label: ar ? 'طريقة الطلب' : 'How to request',
    value: service.is_requestable ? (ar ? 'عبر نموذج الطلب' : 'Online request form') : ar ? 'تواصل معنا' : 'Contact us',
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
              itemListElement: crumbs.map((crumb, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: crumb.name,
                item: `${siteUrl()}${crumb.path}`,
              })),
            },
            {
              '@type': 'Service',
              name,
              description: plain(summary || body).slice(0, 300),
              url: `${siteUrl()}/${locale}/services/${service.slug}`,
              image: cover.startsWith('http') ? cover : `${siteUrl()}${cover}`,
              provider: { '@id': `${siteUrl()}/#organization` },
              ...(sector ? { category: pick(sector, 'name', locale) } : {}),
              areaServed: { '@type': 'Country', name: ar ? 'سلطنة عُمان' : 'Oman' },
            },
          ],
        })}
      />

      <section className="x-sh x-pd-hero x-service-hero">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>
        <img className="x-sh-img" src={cover} alt="" data-parallax="0.04" fetchPriority="high" decoding="async" />
        <span className="x-sh-veil" aria-hidden="true" />

        <div className="container x-sh-inner">
          <nav className="x-sh-crumbs" aria-label="breadcrumb">
            <Link href={`/${locale}`}>{t.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/services`}>{t.nav.services}</Link>
            <span aria-hidden="true">/</span>
            <b>{name}</b>
          </nav>

          <div className="x-sh-top">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {sector ? pick(sector, 'name', locale) : t.nav.services}
            </span>
            {service.is_requestable ? (
              <span className="x-cat-count">{ar ? 'متاحة للطلب' : 'Available to request'}</span>
            ) : null}
          </div>

          <span className="x-service-badge" aria-hidden="true">
            <ServiceIcon name={icon} size={32} />
          </span>

          <h1 className="x-sh-title">{name}</h1>
          {summary ? <p className="x-sh-tag">{summary}</p> : null}

          <div className="x-pd-hero-meta">
            {sector ? (
              <span>
                <Building size={15} /> {pick(sector, 'name', locale)}
              </span>
            ) : null}
            {company ? (
              <span>
                <Check size={15} /> {pick(company, 'name', locale)}
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
                {ar ? 'عن الخدمة' : 'About the service'}
              </span>
              <h2 className="x-h2">
                {ar ? 'ما تشمله' : 'What this'}
                <br />
                <em>{ar ? 'هذه الخدمة.' : 'service covers.'}</em>
              </h2>
            </div>

            {body ? (
              <article className="x-prose reveal" dangerouslySetInnerHTML={{ __html: body }} />
            ) : summary ? (
              <p className="x-co-lead reveal">{summary}</p>
            ) : (
              <p className="x-pd-empty reveal">
                {ar
                  ? 'تفاصيل هذه الخدمة قيد الإضافة. تواصل معنا لمعرفة المزيد.'
                  : 'Service details are being added. Contact us to learn more.'}
              </p>
            )}

            <div className="x-pd-actions reveal">
              {service.is_requestable ? (
                <Link href={requestHref} className="x-btn x-btn-accent">
                  {t.sectors.requestService} <Arrow size={16} />
                </Link>
              ) : null}
              {sector ? (
                <Link href={`/${locale}/sectors/${sector.slug}`} className="x-btn x-btn-ghost">
                  {pick(sector, 'name', locale)} <Arrow size={16} />
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="x-pd-aside">
            <div className="x-side-sticky">
              <div className="x-pd-facts">
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {ar ? 'بطاقة الخدمة' : 'Service facts'}
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
                <Link href={requestHref} className="x-btn x-btn-accent">
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

      {related.length ? (
        <section className="x-rel x-svc-related">
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {t.nav.services}
                </span>
                <h2 className="x-h2">
                  {ar ? 'خدمات' : 'Services that'}
                  <br />
                  <em>{ar ? 'مكملة.' : 'pair with it.'}</em>
                </h2>
              </div>
              <Link href={`/${locale}/services`} className="x-link">
                {t.common.viewAll} <Arrow size={16} />
              </Link>
            </div>

            <div className="x-svc-links">
              {related.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/${locale}/services/${item.slug}`}
                  className="x-svc-link reveal"
                  style={{ transitionDelay: `${Math.min(i * 60, 240)}ms` }}
                >
                  <span className="x-svc-link-icon" aria-hidden="true">
                    <ServiceIcon name={serviceIconName(settings.serviceIcons[item.id], sector?.slug, item.slug)} size={18} />
                  </span>
                  <span className="x-svc-link-body">
                    <b>{pick(item, 'name', locale)}</b>
                    <small>{pick(item, 'summary', locale)}</small>
                  </span>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
