import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { getMedia } from '@/lib/queries';
import { Download, FileText, ImageIcon } from '@/components/icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.nav.media,
    alternates: { canonical: `/${l}/media`, languages: { ar: '/ar/media', en: '/en/media' } },
  };
}

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const media = await getMedia();
  const images = media.filter((item) => item.kind === 'image');
  const files = media.filter((item) => item.kind === 'pdf');

  return (
    <>
      <PageHero
        locale={locale}
        title={t.nav.media}
        subtitle={locale === 'ar' ? 'كتيبات المجموعة والتغطيات الإعلامية.' : 'Group brochures and press coverage.'}
        crumbs={[{ label: t.nav.media }]}
      />
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.4rem', marginBottom: 20 }}>
            {locale === 'ar' ? 'الكتيبات والملفات' : 'Brochures and files'}
          </h2>
          <div className="services-grid" style={{ marginBottom: 56 }}>
            {files.map((item) => (
              <a className="service-card" key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                <span className="service-num">
                  <FileText size={18} /> PDF
                </span>
                <h3>{item.title}</h3>
                <span className="link-arrow" style={{ marginTop: 'auto' }}>
                  <Download size={15} /> {locale === 'ar' ? 'تحميل' : 'Download'}
                </span>
              </a>
            ))}
          </div>

          <h2 className="section-title" style={{ fontSize: '1.4rem', marginBottom: 20 }}>
            {locale === 'ar' ? 'التغطيات الإعلامية' : 'Press coverage'}
          </h2>
          <div className="media-grid">
            {images.map((item) => (
              <a
                className="media-card"
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={item.url} alt="" loading="lazy" />
                <div className="media-card-body">
                  <h3>{item.title}</h3>
                  <span className="media-kind">
                    <ImageIcon size={13} /> {locale === 'ar' ? 'تغطية' : 'Coverage'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
