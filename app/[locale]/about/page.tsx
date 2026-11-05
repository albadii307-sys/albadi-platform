import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompanyGrid from '@/components/company-grid';
import { Counter } from '@/components/x-motion';
import { ArrowLeft, ArrowRight, Check } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { companiesCount } from '@/lib/plural';
import { getCompanies, getPage, getSectors } from '@/lib/queries';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.nav.about,
    description: t.home.aboutText,
    alternates: { canonical: `/${l}/about`, languages: { ar: '/ar/about', en: '/en/about' } },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const [page, companies, sectors] = await Promise.all([getPage('about'), getCompanies(), getSectors()]);

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
              {t.nav.about}
            </span>
            <span className="x-cat-count">{ar ? 'منذ 1976' : 'Since 1976'}</span>
          </div>

          <h1 className="x-cat-title">
            {ar ? 'قصة' : 'A story'}
            <br />
            <em>{ar ? 'خمسة عقود.' : 'five decades long.'}</em>
          </h1>

          <div className="x-cat-foot">
            <p>{t.home.aboutText}</p>
            <div className="x-cat-stats">
              <div>
                <b>
                  <Counter value={sectors.length} />
                </b>
                <small>{ar ? 'قطاعات' : 'Sectors'}</small>
              </div>
              <div>
                <b>
                  <Counter value={companies.length} />
                </b>
                <small>{ar ? 'شركة تابعة' : 'Companies'}</small>
              </div>
              <div>
                <b>
                  <Counter value={new Date().getFullYear() - 1976} />
                </b>
                <small>{ar ? 'عاماً من الخبرة' : 'Years'}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="x-intro x-about">
        <div className="container">
          <div className="x-intro-grid">
            <div className="x-intro-media reveal">
              <div className="x-media-frame">
                <img src="/media/brand/chairman.webp" alt={t.home.extra.quoteBy} loading="lazy" />
              </div>
              <span className="x-year-stamp">
                <b>1976</b>
                <small>{ar ? 'سنة التأسيس' : 'Founded'}</small>
              </span>
            </div>

            <div className="x-intro-copy">
              <span className="x-eyebrow">
                <i aria-hidden="true" />
                {t.nav.about}
              </span>
              <h2 className="x-h2">
                {ar ? 'نبني عُمان' : 'Building Oman'}
                <br />
                <em>{ar ? 'بكوادر عُمانية.' : 'with Omani hands.'}</em>
              </h2>

              {page ? (
                <div className="x-prose reveal" dangerouslySetInnerHTML={{ __html: pick(page, 'body', locale) }} />
              ) : null}

              <ul className="x-cred reveal">
                <li>
                  <Check size={17} />
                  {ar ? 'الدرجة الممتازة من مجلس المناقصات العُماني' : 'Excellent grade from Oman Tender Board'}
                </li>
                <li>
                  <Check size={17} />
                  {ar ? 'كوادر عُمانية وتعمين يتجاوز 90%' : 'Omani-led teams with 90%+ Omanisation'}
                </li>
                <li>
                  <Check size={17} />
                  {ar ? 'ترخيص الدرجة الممتازة من وزارة الدفاع' : 'Excellent rating from the Ministry of Defence'}
                </li>
              </ul>

              <Link href={`/${locale}/sectors`} className="x-link">
                {t.nav.sectors} <Arrow size={16} />
              </Link>
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
                {t.nav.companies}
              </span>
              <h2 className="x-h2">
                {ar ? 'شركات تعمل' : 'Companies that work'}
                <br />
                <em>{ar ? 'تحت مظلة واحدة.' : 'under one roof.'}</em>
              </h2>
            </div>
            <p>
              {ar
                ? `${companiesCount(companies.length, locale)} موزعة على قطاعات المجموعة، تجمعها إدارة واحدة ومعيار واحد.`
                : `${companiesCount(companies.length, locale)} across the group's sectors, sharing one management and one standard.`}
            </p>
          </div>

          <CompanyGrid items={items} locale={locale} />
        </div>
      </section>

      <section className="x-cat-cta">
        <div className="container x-cat-cta-inner">
          <div>
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {t.nav.contact}
            </span>
            <h2>
              {ar ? 'لنبدأ الحوار' : "Let's start"}
              <br />
              <em>{ar ? 'عن مشروعك القادم.' : 'your next project.'}</em>
            </h2>
          </div>
          <div className="x-cat-cta-side">
            <p>{t.home.quoteText}</p>
            <Link href={`/${locale}/contact`} className="x-btn x-btn-accent">
              {t.nav.contact} <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
