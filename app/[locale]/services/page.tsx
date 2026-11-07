import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Counter } from '@/components/x-motion';
import ServicesIndex, { type ServiceGroupItem } from '@/components/services-index';
import { ArrowLeft, ArrowRight, Building } from '@/components/icons';
import { serviceIconName } from '@/components/service-icon';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { servicesCount } from '@/lib/plural';
import { getCompanies, getSectors, getServices } from '@/lib/queries';
import { SECTOR_MEDIA } from '@/lib/sector-media';
import { getSiteSettings } from '@/lib/site-settings.server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.nav.services,
    description:
      l === 'ar'
        ? 'خدمات مجموعة البادي موزعة حسب القطاع، مع إمكانية طلب الخدمة مباشرة.'
        : 'Al-Badi group services organised by sector, with a direct request form.',
    alternates: { canonical: `/${l}/services`, languages: { ar: '/ar/services', en: '/en/services' } },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [sectors, services, companies, settings] = await Promise.all([
    getSectors(),
    getServices(),
    getCompanies(),
    getSiteSettings(),
  ]);

  const groups: ServiceGroupItem[] = sectors
    .map((sector) => ({
      id: sector.id,
      slug: sector.slug,
      name: pick(sector, 'name', locale),
      image:
        sector.hero_url ??
        settings.gallery[sector.id]?.[0] ??
        SECTOR_MEDIA[sector.slug]?.image ??
        null,
      services: services
        .filter((service) => service.sector_id === sector.id)
        .map((service) => ({
          id: service.id,
          slug: service.slug,
          name: pick(service, 'name', locale),
          summary: pick(service, 'summary', locale),
          icon: serviceIconName(settings.serviceIcons[service.id], sector.slug, service.slug),
        })),
    }))
    .filter((group) => group.services.length > 0);

  const ungrouped = services.filter((service) => !service.sector_id);

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
              {t.nav.services}
            </span>
            <span className="x-cat-count">{servicesCount(services.length, locale)}</span>
          </div>

          <h1 className="x-cat-title">
            {ar ? 'خدماتنا.' : 'Our services.'}
            <br />
            <em>{ar ? 'مصنّفة حسب القطاع.' : 'Grouped by sector.'}</em>
          </h1>

          <div className="x-cat-foot">
            <p>
              {ar
                ? 'اختر الخدمة التي تهمك للاطلاع على تفاصيلها وطلبها مباشرة من فريق المجموعة.'
                : 'Pick a service to see its details and request it directly from the group team.'}
            </p>
            <div className="x-cat-stats">
              <div>
                <b>
                  <Counter value={services.length} />
                </b>
                <small>{ar ? 'خدمة' : 'Services'}</small>
              </div>
              <div>
                <b>
                  <Counter value={groups.length} />
                </b>
                <small>{ar ? 'قطاع' : 'Sectors'}</small>
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

      <section className="x-services x-svc-dir">
        <div className="container">
          {groups.length ? (
            <ServicesIndex groups={groups} locale={locale} viewLabel={t.sectors.servicesTitle} />
          ) : (
            <p className="x-pd-empty">
              {ar ? 'لا توجد خدمات منشورة حالياً.' : 'No services are published yet.'}
            </p>
          )}

          {ungrouped.length ? (
            <div className="x-svc-links" style={{ marginTop: 28 }}>
              {ungrouped.map((service) => (
                <Link key={service.id} href={`/${locale}/services/${service.slug}`} className="x-svc-link">
                  <span className="x-svc-link-body">
                    <b>{pick(service, 'name', locale)}</b>
                    <small>{pick(service, 'summary', locale)}</small>
                  </span>
                </Link>
              ))}
            </div>
          ) : null}

          <div className="x-ex-foot" style={{ marginTop: 28 }}>
            <span className="x-hint">
              <i aria-hidden="true" />
              {ar ? 'كل خدمة صفحة مستقلة قابلة للطلب' : 'Every service has its own requestable page'}
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
              {t.nav.sectors}
            </span>
            <h2>
              {ar ? 'خدمات تعمل ضمن' : 'Services within'}
              <br />
              <em>{ar ? 'منظومة قطاعات.' : 'a sector system.'}</em>
            </h2>
          </div>
          <div className="x-cat-cta-side">
            <p>
              {ar
                ? 'كل قطاع يجمع خدماته وشركاته ومشاريعه في صفحة واحدة متكاملة.'
                : 'Every sector brings its services, companies and projects together in one page.'}
            </p>
            <Link href={`/${locale}/sectors`} className="x-btn x-btn-accent">
              <Building size={16} /> {t.nav.sectors}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
