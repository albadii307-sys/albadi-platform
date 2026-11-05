import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getPage, getSectors } from '@/lib/queries';
import { ArrowLeft, ArrowRight, Check } from '@/components/icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.nav.vision,
    alternates: { canonical: `/${l}/vision`, languages: { ar: '/ar/vision', en: '/en/vision' } },
  };
}

export default async function VisionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const [page, sectors] = await Promise.all([getPage('vision'), getSectors()]);
  const body = page ? pick(page, 'body', locale) : '';

  return (
    <>
      <PageHero
        locale={locale}
        title={t.nav.vision}
        subtitle={locale === 'ar' ? 'ما نطمح إليه، وكيف نعمل كل يوم لتحقيقه.' : 'What we aspire to, and how we work towards it every day.'}
        crumbs={[{ label: t.nav.vision }]}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 940 }}>
          {body ? (
            <article className="article" dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            <p style={{ color: 'var(--muted)' }}>{t.common.empty}</p>
          )}

          <div className="services-grid" style={{ marginTop: 48 }}>
            <div className="service-card">
              <span className="service-num">{locale === 'ar' ? 'قيمنا' : 'VALUES'}</span>
              <h3>{locale === 'ar' ? 'الجودة والالتزام' : 'Quality and commitment'}</h3>
              <ul className="mini-list">
                <li>
                  <Check size={17} /> {locale === 'ar' ? 'أعلى معايير الجودة والسلامة' : 'Highest quality and safety standards'}
                </li>
                <li>
                  <Check size={17} /> {locale === 'ar' ? 'الشفافية في التعامل' : 'Transparency in every dealing'}
                </li>
                <li>
                  <Check size={17} /> {locale === 'ar' ? 'تطوير الكادر العُماني' : 'Developing Omani talent'}
                </li>
              </ul>
            </div>
            <div className="service-card">
              <span className="service-num">{locale === 'ar' ? 'أهدافنا' : 'GOALS'}</span>
              <h3>{locale === 'ar' ? 'نمو مستدام وأثر مجتمعي' : 'Sustainable growth with impact'}</h3>
              <ul className="mini-list">
                <li>
                  <Check size={17} /> {locale === 'ar' ? 'التوسع في دول الخليج' : 'Expansion across the Gulf'}
                </li>
                <li>
                  <Check size={17} /> {locale === 'ar' ? 'أنظمة إدارية رقمية متكاملة' : 'Integrated digital management systems'}
                </li>
                <li>
                  <Check size={17} /> {locale === 'ar' ? 'مسؤولية مجتمعية فاعلة' : 'Active community responsibility'}
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={`/${locale}/sectors`} className="btn btn-dark">
              {t.nav.sectors} <Arrow size={16} />
            </Link>
            <Link href={`/${locale}/about`} className="btn btn-ghost">
              {t.nav.about}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
