import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import ContactForm from '@/components/contact-form';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { Clock, Mail, Phone, Pin } from '@/components/icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.contact.title,
    description: t.contact.subtitle,
    alternates: { canonical: `/${l}/contact`, languages: { ar: '/ar/contact', en: '/en/contact' } },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);

  return (
    <>
      <PageHero locale={locale} title={t.contact.title} subtitle={t.contact.subtitle} crumbs={[{ label: t.nav.contact }]} />
      <section className="section">
        <div className="container contact-grid">
          <div>
            <div className="contact-item">
              <div className="contact-icon">
                <Phone size={19} />
              </div>
              <div>
                <b>{t.contact.phone}</b>
                <a href="tel:+96826854411" dir="ltr">
                  +968 26 854 411
                </a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Phone size={19} />
              </div>
              <div>
                <b>{t.contact.fax}</b>
                <span dir="ltr">+968 26 855 744</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Mail size={19} />
              </div>
              <div>
                <b>{t.contact.email}</b>
                <a href="mailto:albadi@albadigroup.com">albadi@albadigroup.com</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Pin size={19} />
              </div>
              <div>
                <b>{t.contact.address}</b>
                <span>{t.contact.addressValue}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Clock size={19} />
              </div>
              <div>
                <b>{t.contact.hours}</b>
                <span>{t.contact.hoursValue}</span>
              </div>
            </div>

            <div className="side-cta" style={{ marginTop: 28 }}>
              <h3 style={{ marginBottom: 8, fontSize: '1.05rem' }}>{t.home.quoteTitle}</h3>
              <p>{t.home.quoteText}</p>
              <a href={`/${locale}/request`} className="btn btn-orange btn-block">
                {t.nav.request}
              </a>
            </div>
          </div>

          <ContactForm locale={locale} />
        </div>
      </section>
    </>
  );
}
