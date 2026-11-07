import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Counter } from '@/components/x-motion';
import EditorialSectors from '@/components/editorial-sectors';
import { ArrowLeft, ArrowRight, Building } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { companiesCount, sectorsCount } from '@/lib/plural';
import { getCompanies, getSectors, getServices } from '@/lib/queries';
import { SECTOR_MEDIA } from '@/lib/sector-media';
import { getSiteSettings } from '@/lib/site-settings.server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.sectors.title,
    description: t.sectors.subtitle,
    alternates: { canonical: `/${l}/sectors`, languages: { ar: '/ar/sectors', en: '/en/sectors' } },
  };
}

export default async function SectorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const ar = locale === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [sectors, services, companies, settings] = await Promise.all([
    getSectors(),
    getServices(),
    getCompanies(),
    getSiteSettings(),
  ]);

  const serviceMap = new Map<string, string[]>();
  for (const service of services) {
    if (!service.sector_id) continue;
    const bucket = serviceMap.get(service.sector_id) ?? [];
    bucket.push(pick(service, 'name', locale));
    serviceMap.set(service.sector_id, bucket);
  }

  const companyMap = new Map<string, number>();
  for (const company of companies) {
    if (!company.sector_id) continue;
    companyMap.set(company.sector_id, (companyMap.get(company.sector_id) ?? 0) + 1);
  }

  const items = sectors.map((sector) => {
    const names = serviceMap.get(sector.id) ?? [];
    return {
      id: sector.id,
      slug: sector.slug,
      name: pick(sector, 'name', locale),
      tagline: pick(sector, 'tagline', locale),
      summary: pick(sector, 'summary', locale),
      services: names.length,
      companies: companyMap.get(sector.id) ?? 0,
      image:
        sector.hero_url ??
        settings.gallery[sector.id]?.[0] ??
        SECTOR_MEDIA[sector.slug]?.image ??
        '/media/projects/p4.webp',
      logo: SECTOR_MEDIA[sector.slug]?.logo ?? null,
    };
  });

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
              {t.nav.sectors}
            </span>
            <span className="x-cat-count">{sectorsCount(sectors.length, locale)}</span>
          </div>

          <h1 className="x-cat-title">
            {ar ? 'قطاعاتنا.' : 'Our sectors.'}
            <br />
            <em>{ar ? 'محركات النمو.' : 'Growth engines.'}</em>
          </h1>

          <div className="x-cat-foot">
            <p>{t.sectors.subtitle}</p>
            <div className="x-cat-stats">
              <div>
                <b>
                  <Counter value={sectors.length} />
                </b>
                <small>{ar ? 'قطاعات' : 'Sectors'}</small>
              </div>
              <div>
                <b>
                  <Counter value={services.length} />
                </b>
                <small>{ar ? 'خدمة متاحة' : 'Services'}</small>
              </div>
              <div>
                <b>
                  <Counter value={companies.length} />
                </b>
                <small>{ar ? 'شركة تابعة' : 'Companies'}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="x-explorer-section">
        <div className="container">
          <EditorialSectors items={items} locale={locale} showIndex />

          <div className="x-ex-foot">
            <span className="x-hint">
              <i aria-hidden="true" />
              {ar ? 'كل قطاع صفحة مستقلة بأعماله وخدماته' : 'Every sector has its own page, work and services'}
            </span>
            <Link href={`/${locale}/request`} className="x-link light">
              {t.nav.request} <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="x-cat-cta">
        <div className="container x-cat-cta-inner">
          <div>
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {t.nav.companies}
            </span>
            <h2>
              {ar ? 'شركات تعمل ضمن' : 'Companies within'}
              <br />
              <em>{ar ? 'منظومة واحدة.' : 'one system.'}</em>
            </h2>
          </div>
          <div className="x-cat-cta-side">
            <p>
              {ar
                ? `${companiesCount(companies.length, locale)} موزعة على القطاعات، تجمعها خبرة واحدة وإدارة واحدة.`
                : `${companiesCount(companies.length, locale)} across the group, sharing one management and one standard.`}
            </p>
            <Link href={`/${locale}/companies`} className="x-btn x-btn-accent">
              <Building size={16} /> {t.nav.companies}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
