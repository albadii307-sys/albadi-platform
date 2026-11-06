import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsCard, formatDate } from '@/components/cards';
import ShareActions from '@/components/share-actions';
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { jsonLd, siteUrl } from '@/lib/jsonld';
import { getAllNews, getNewsItem } from '@/lib/queries';

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const item = await getNewsItem(slug);
  if (!item) return {};
  const title = pick(item, 'title', locale);
  const description = pick(item, 'excerpt', locale);
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/news/${slug}`,
      languages: { ar: `/ar/news/${slug}`, en: `/en/news/${slug}` },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: item.published_at,
      images: item.cover_url ? [item.cover_url] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const item = await getNewsItem(slug);
  if (!item) notFound();

  const all = await getAllNews(item.category);
  const latest = (await getAllNews()).filter((entry) => entry.id !== item.id).slice(0, 4);
  const related = all.filter((entry) => entry.id !== item.id).slice(0, 3);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const categoryLabel =
    item.category === 'csr'
      ? t.news.categories.csr
      : item.category === 'media'
        ? t.news.categories.media
        : t.news.categories.group;
  const title = pick(item, 'title', locale);
  const body = pick(item, 'body', locale);
  const excerpt = pick(item, 'excerpt', locale);
  const url = `${siteUrl()}/${locale}/news/${item.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: title,
          description: excerpt,
          url,
          datePublished: item.published_at,
          dateModified: item.updated_at ?? item.published_at,
          image: item.cover_url ? [`${siteUrl()}${item.cover_url}`] : undefined,
          articleSection: categoryLabel,
          publisher: {
            '@type': 'Organization',
            name: ar ? 'مجموعة البادي للاستثمار القابضة' : 'Al-Badi Investment Holding Group',
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        })}
      />

      <section className="x-sh x-nd-hero">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
          <span className="x-hero-rings r1" />
          <span className="x-hero-rings r2" />
        </div>
        {item.cover_url ? <img className="x-sh-img" src={item.cover_url} alt="" data-parallax="0.04" /> : null}
        <span className="x-sh-veil" aria-hidden="true" />

        <div className="container x-sh-inner">
          <nav className="x-sh-crumbs" aria-label="breadcrumb">
            <Link href={`/${locale}`}>{t.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/news`}>{t.nav.news}</Link>
            <span aria-hidden="true">/</span>
            <b>{categoryLabel}</b>
          </nav>

          <div className="x-sh-top">
            <span className="x-eyebrow light">
              <i aria-hidden="true" />
              {categoryLabel}
            </span>
          </div>

          <h1 className="x-sh-title x-nd-title">{title}</h1>

          <div className="x-pd-hero-meta">
            <span>
              <Calendar size={15} /> {formatDate(item.published_at, locale)}
            </span>
            {excerpt ? <span className="x-nd-excerpt">{excerpt}</span> : null}
          </div>
        </div>
      </section>

      <section className="x-pd x-nd">
        <div className="container x-pd-grid">
          <div className="x-pd-main">
            {body ? (
              <article className="x-prose x-nd-prose reveal" dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
              <p className="x-pd-empty reveal">{excerpt}</p>
            )}

            {item.external_url ? (
              <div className="x-nd-source reveal">
                <a href={item.external_url} className="x-btn x-btn-accent" target="_blank" rel="noopener noreferrer">
                  {ar ? 'قراءة الخبر من المصدر' : 'Read the full story at source'} <ArrowUpRight size={15} />
                </a>
              </div>
            ) : null}

            <div className="x-nd-foot reveal">
              <Link href={`/${locale}/news`} className="x-btn x-btn-ghost">
                {t.nav.news} <Arrow size={16} />
              </Link>
              <ShareActions url={url} title={title} locale={locale} />
            </div>
          </div>

          <aside className="x-pd-aside">
            <div className="x-side-sticky">
              <div className="x-pd-facts">
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {ar ? 'أحدث الأخبار' : 'Latest news'}
                </span>
                <nav className="x-nd-list">
                  {latest.map((entry) => (
                    <Link key={entry.id} href={`/${locale}/news/${entry.slug}`}>
                      <small>{formatDate(entry.published_at, locale)}</small>
                      <b>{pick(entry, 'title', locale)}</b>
                    </Link>
                  ))}
                </nav>
                <Link href={`/${locale}/news`} className="x-link x-nd-all">
                  {t.news.categories.all} <Arrow size={15} />
                </Link>
              </div>

              <div className="x-pd-card">
                <span className="x-eyebrow light">
                  <i aria-hidden="true" />
                  {t.nav.news}
                </span>
                <h3>{t.home.quoteTitle}</h3>
                <p>{t.home.quoteText}</p>
                <Link href={`/${locale}/request`} className="x-btn x-btn-accent">
                  {t.nav.request} <Arrow size={16} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="x-nd-related">
          <div className="container">
            <div className="x-sec-head reveal">
              <div>
                <span className="x-eyebrow">
                  <i aria-hidden="true" />
                  {t.nav.news}
                </span>
                <h2 className="x-h2">
                  {ar ? 'اقرأ أيضاً' : 'More from'}
                  <br />
                  <em>{ar ? 'من غرفة الأخبار.' : 'the newsroom.'}</em>
                </h2>
              </div>
              <Link href={`/${locale}/news?category=${item.category}`} className="x-link">
                {t.common.viewAll} <Arrow size={16} />
              </Link>
            </div>
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
