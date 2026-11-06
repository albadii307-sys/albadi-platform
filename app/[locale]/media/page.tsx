import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MediaGallery from '@/components/media-gallery';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { getMedia } from '@/lib/queries';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.nav.media,
    description:
      l === 'ar' ? 'مكتبة صور المجموعة والكتيبات والتغطيات الإعلامية.' : 'Group photography, brochures and press materials.',
    alternates: { canonical: `/${l}/media`, languages: { ar: '/ar/media', en: '/en/media' } },
  };
}

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const ar = locale === 'ar';
  const t = getDict(locale);
  const media = await getMedia();

  const items = media.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    kind: item.kind,
    year: item.created_at ? new Date(item.created_at).getFullYear() : null,
  }));

  const photos = items.filter((item) => item.kind === 'image').length;
  const files = items.filter((item) => item.kind === 'pdf').length;

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
            {ar ? 'المكتبة الإعلامية' : 'Media library'}
          </span>
          <h1 className="x-nw-title">{t.nav.media}</h1>
          <p className="x-nw-sub">
            {ar
              ? 'صور المجموعة ومشاريعها، والكتيبات الرسمية، والتغطيات الإعلامية — في مكان واحد.'
              : 'Group and project photography, official brochures and press coverage — in one place.'}
          </p>
          <div className="x-md-stats">
            <div>
              <b>{photos}</b>
              <small>{ar ? 'صورة' : 'Photos'}</small>
            </div>
            <div>
              <b>{files}</b>
              <small>{ar ? 'ملف PDF' : 'PDF files'}</small>
            </div>
            <div>
              <b>{items.length}</b>
              <small>{ar ? 'عنصر في المكتبة' : 'Library items'}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="x-md-wrap">
        <div className="container">
          {items.length ? (
            <MediaGallery items={items} locale={locale} />
          ) : (
            <p className="x-pf-empty">{t.common.empty}</p>
          )}
        </div>
      </section>
    </>
  );
}
