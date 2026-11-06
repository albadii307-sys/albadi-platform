import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsCard, formatDate } from '@/components/cards';
import { ArrowUpRight, Calendar } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getAllNews } from '@/lib/queries';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

const PER_PAGE = 9;

type Category = 'all' | 'group' | 'csr' | 'media';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.news.title,
    description: t.news.subtitle,
    alternates: {
      canonical: `/${l}/news`,
      languages: { ar: '/ar/news', en: '/en/news' },
    },
  };
}

function categoryLabel(category: Category, locale: Locale) {
  const t = getDict(locale);
  if (category === 'csr') return t.news.categories.csr;
  if (category === 'media') return t.news.categories.media;
  if (category === 'group') return t.news.categories.group;
  return t.news.categories.all;
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const { category, page: pageParam } = await searchParams;
  const t = getDict(locale);

  const active: Category =
    category === 'csr' || category === 'media' || category === 'group' || category === 'all' ? category : 'all';
  const all = await getAllNews(active === 'all' ? undefined : active);
  const page = Math.max(1, Number(pageParam) || 1);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const [lead, ...rest] = items;

  const tabs: Category[] = ['all', 'group', 'csr', 'media'];
  const hrefFor = (target: Category, targetPage = 1) =>
    `/${locale}/news?category=${target}${targetPage > 1 ? `&page=${targetPage}` : ''}`;

  return (
    <>
      <section className="x-nw-hero">
        <div className="x-hero-fx" aria-hidden="true">
          <span className="x-hero-glow" />
          <span className="x-hero-grid" />
        </div>
        <div className="container x-nw-hero-inner">
          <span className="x-eyebrow light">
            <i aria-hidden="true" />
            {ar ? 'غرفة الأخبار' : 'Newsroom'}
          </span>
          <h1 className="x-nw-title">{t.news.title}</h1>
          <p className="x-nw-sub">{t.news.subtitle}</p>
        </div>
      </section>

      <section className="x-nw">
        <div className="container">
          <div className="x-pf-tabs" role="tablist" aria-label={ar ? 'تصفية الأخبار' : 'Filter news'}>
            {tabs.map((tab) => {
              const count = tab === active ? all.length : undefined;
              return (
                <Link
                  key={tab}
                  href={hrefFor(tab)}
                  role="tab"
                  aria-selected={active === tab}
                  className={`x-pf-tab${active === tab ? ' is-on' : ''}`}
                >
                  {categoryLabel(tab, locale)}
                  {count !== undefined ? <span>{count}</span> : null}
                </Link>
              );
            })}
          </div>

          {lead ? (
            <Link href={`/${locale}/news/${lead.slug}`} className="x-nw-lead reveal">
              <span className="x-nw-lead-media">
                {lead.cover_url ? <img src={lead.cover_url} alt={pick(lead, 'title', locale)} data-parallax="0.03" /> : null}
                <span className="x-nw-cat">{categoryLabel(lead.category, locale)}</span>
              </span>
              <span className="x-nw-lead-body">
                <span className="x-nw-date">
                  <Calendar size={14} /> {formatDate(lead.published_at, locale)}
                </span>
                <strong className="x-nw-lead-title">{pick(lead, 'title', locale)}</strong>
                {pick(lead, 'excerpt', locale) ? <span className="x-nw-lead-ex">{pick(lead, 'excerpt', locale)}</span> : null}
                <span className="x-nw-lead-more">
                  {t.common.readMore} <ArrowUpRight size={15} />
                </span>
              </span>
            </Link>
          ) : null}

          {rest.length ? (
            <div className="x-nw-grid">
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          ) : null}

          {!items.length ? <p className="x-pf-empty">{t.common.empty}</p> : null}

          {pages > 1 ? (
            <nav className="x-nw-pager" aria-label="pagination">
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                <Link
                  key={number}
                  href={hrefFor(active, number)}
                  aria-current={number === page ? 'page' : undefined}
                  className={`x-nw-page${number === page ? ' is-on' : ''}`}
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
