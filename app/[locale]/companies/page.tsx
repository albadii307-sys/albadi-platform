import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompanyGrid from '@/components/company-grid';
import { Counter } from '@/components/x-motion';
import { ArrowLeft, ArrowRight } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { companiesCount, sectorsCount } from '@/lib/plural';
import { getCompanies, getSectors } from '@/lib/queries';
import { getSiteSettings } from '@/lib/site-settings.server';
import { SECTOR_MEDIA } from '@/lib/sector-media';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const ar = locale === 'ar';
  return {
    title: ar ? 'شركات المجموعة' : 'Group companies',
    description: ar
      ? 'الشركات والمؤسسات العاملة تحت مظلة مجموعة البادي للاستثمار القابضة.'
      : 'The companies and institutions operating under Al-Badi Investment Holding Group.',
    alternates: { canonical: `/${locale}/companies`, languages: { ar: '/ar/companies', en: '/en/companies' } },
  };
}

export default async function CompaniesPage({ params }: Params) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [companies, sectors, settings] = await Promise.all([getCompanies(), getSectors(), getSiteSettings()]);

  const items = companies.map((company) => {
    const sector = sectors.find((item) => item.id === company.sector_id);
    return {
      id: company.id,
      slug: company.slug,
      name: pick(company, 'name', locale),
      description: pick(company, 'description', locale),
      sector: sector ? pick(sector, 'name', locale) : '',
      sectorSlug: sector?.slug ?? '',
      website: company.website,
      logo: company.logo_url,
      photo: sector
        ? SECTOR_MEDIA[sector.slug]?.image ?? sector.hero_url ?? settings.gallery[sector.id]?.[0]
        : null,
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
              {t.nav.companies}
            </span>
            <span className="x-cat-count">{companiesCount(companies.length, locale)}</span>
          </div>

          <h1 className="x-cat-title">
            {ar ? 'منظومة' : 'One'}
            <br />
            <em>{ar ? 'الشركات.' : 'family of companies.'}</em>
          </h1>

          <div className="x-cat-foot">
            <p>
              {ar
                ? 'شركات متخصصة تعمل جنباً إلى جنب، كل واحدة تقود مجالها، وتتكامل جميعها لخدمة عملاء المجموعة.'
                : 'Specialised companies working side by side — each leading its field, together serving every group client.'}
            </p>
            <div className="x-cat-stats">
              <div>
                <b>
                  <Counter value={companies.length} />
                </b>
                <small>{ar ? 'شركة تابعة' : 'Companies'}</small>
              </div>
              <div>
                <b>
                  <Counter value={sectors.length} />
                </b>
                <small>{ar ? 'قطاعات' : 'Sectors'}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="x-companies x-companies-page">
        <div className="container">
          <div className="x-sec-head reveal">
            <div>
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {sectorsCount(sectors.length, locale)}
              </span>
              <h2 className="x-h2">
                {ar ? 'كل شركة' : 'Every company'}
                <br />
                <em>{ar ? 'باختصاصها.' : 'in its field.'}</em>
              </h2>
            </div>
            <p>
              {ar
                ? 'مرّر فوق أي شركة لمعرفة تخصصها والقطاع الذي تنتمي إليه.'
                : 'Hover any company to see its speciality and the sector it belongs to.'}
            </p>
          </div>

          <CompanyGrid items={items} locale={locale} />

          <div className="x-center" style={{ marginTop: 44 }}>
            <Link href={`/${locale}/request`} className="x-btn x-btn-accent">
              {t.nav.request} <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
