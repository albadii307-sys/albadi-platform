import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { NewsCard, formatDate } from '@/components/cards';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getAllNews, getNewsItem } from '@/lib/queries';
import { ArrowLeft, ArrowRight, Calendar } from '@/components/icons';

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const item = await getNewsItem(slug);
  if (!item) return {};
  return {
    title: pick(item, 'title', locale),
    description: pick(item, 'excerpt', locale),
    alternates: {
      canonical: `/${locale}/news/${slug}`,
      languages: { ar: `/ar/news/${slug}`, en: `/en/news/${slug}` },
    },
    openGraph: { images: item.cover_url ? [item.cover_url] : [] },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const item = await getNewsItem(slug);
  if (!item) notFound();

  const all = await getAllNews(item.category);
  const related = all.filter((entry) => entry.id !== item.id).slice(0, 3);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const categoryLabel =
    item.category === 'csr' ? t.news.categories.csr : item.category === 'media' ? t.news.categories.media : t.news.categories.group;

  return (
    <>
      <PageHero
        locale={locale}
        title={pick(item, 'title', locale)}
        crumbs={[
          { label: t.nav.news, href: `/${locale}/news` },
          { label: categoryLabel },
        ]}
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>
            <span className="news-date">
              <Calendar size={15} /> {formatDate(item.published_at, locale)}
            </span>
            <span>·</span>
            <span>{categoryLabel}</span>
          </div>

          {item.cover_url ? (
            <div className="article-hero" style={{ aspectRatio: '16 / 9' }}>
              <img src={item.cover_url} alt={pick(item, 'title', locale)} />
            </div>
          ) : null}

          {pick(item, 'body', locale) ? (
            <article className="article" dangerouslySetInnerHTML={{ __html: pick(item, 'body', locale) }} />
          ) : (
            <p style={{ color: 'var(--muted)' }}>{pick(item, 'excerpt', locale)}</p>
          )}

          {item.external_url ? (
            <div style={{ marginTop: 28 }}>
              <a href={item.external_url} className="btn btn-dark" target="_blank" rel="noopener noreferrer">
                {locale === 'ar' ? 'قراءة الخبر من المصدر' : 'Read the full story at source'}
              </a>
            </div>
          ) : null}

          <div style={{ marginTop: 40 }}>
            <Link href={`/${locale}/news`} className="btn btn-ghost">
              {t.nav.news} <Arrow size={16} />
            </Link>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="section section-sand">
          <div className="container">
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 24 }}>
              {t.news.title}
            </h2>
            <div className="news-grid">
              {related.map((entry) => (
                <NewsCard key={entry.id} item={entry} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
