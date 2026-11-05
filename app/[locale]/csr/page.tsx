import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { NewsCard } from '@/components/cards';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { getAllNews } from '@/lib/queries';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.csr.title,
    description: t.csr.subtitle,
    alternates: { canonical: `/${l}/csr`, languages: { ar: '/ar/csr', en: '/en/csr' } },
  };
}

export default async function CsrPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const items = await getAllNews('csr');

  return (
    <>
      <PageHero
        locale={locale}
        title={t.csr.title}
        subtitle={t.csr.subtitle}
        crumbs={[{ label: t.nav.csr }]}
      />
      <section className="section">
        <div className="container">
          {items.length ? (
            <div className="news-grid">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>{t.common.empty}</p>
          )}
        </div>
      </section>
    </>
  );
}
