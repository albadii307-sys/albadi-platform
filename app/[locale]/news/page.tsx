import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { NewsCard } from '@/components/cards';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { getAllNews } from '@/lib/queries';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

const PER_PAGE = 9;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.news.title,
    description: t.news.subtitle,
    alternates: { canonical: `/${l}/news`, languages: { ar: '/ar/news', en: '/en/news' } },
  };
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const { category, page: pageParam } = await searchParams;
  const t = getDict(locale);

  const validCategory = category === 'csr' || category === 'media' ? category : 'group';
  const all = await getAllNews(validCategory);
  const page = Math.max(1, Number(pageParam) || 1);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const tabs = [
    { key: 'group', label: t.news.categories.group },
    { key: 'csr', label: t.news.categories.csr },
  ];

  return (
    <>
      <PageHero locale={locale} title={t.news.title} subtitle={t.news.subtitle} crumbs={[{ label: t.nav.news }]} />
      <section className="section">
        <div className="container">
          <div className="filter-row">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/${locale}/news?category=${tab.key}`}
                className={`chip ${validCategory === tab.key ? 'is-active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {items.length ? (
            <div className="news-grid">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>{t.common.empty}</p>
          )}

          {pages > 1 ? (
            <nav className="filter-row" style={{ marginTop: 40, justifyContent: 'center' }} aria-label="pagination">
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                <Link
                  key={number}
                  href={`/${locale}/news?category=${validCategory}&page=${number}`}
                  className={`chip ${number === page ? 'is-active' : ''}`}
                >
                  {number}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
