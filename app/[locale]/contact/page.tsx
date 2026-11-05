import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import ContactForm from '@/components/contact-form';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { getSiteSettings } from '@/lib/site-settings.server';
import { siteAddress, siteHours, telHref } from '@/lib/site-settings';
import SocialLinks from '@/components/social-links';
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
  const settings = await getSiteSettings();

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
                <a href={telHref(settings.phone)} dir="ltr">
                  {settings.phone}
                </a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Phone size={19} />
              </div>
              <div>
                <b>{t.contact.fax}</b>
                <a href={telHref(settings.fax)} dir="ltr">
                  {settings.fax}
                </a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Mail size={19} />
              </div>
              <div>
                <b>{t.contact.email}</b>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Pin size={19} />
              </div>
              <div>
                <b>{t.contact.address}</b>
                <span>{siteAddress(locale, settings)}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <Clock size={19} />
              </div>
              <div>
                <b>{t.contact.hours}</b>
                <span>{siteHours(locale, settings)}</span>
              </div>
            </div>

            <div className="contact-social">
              <b>{locale === 'ar' ? 'تابعنا على' : 'Follow us'}</b>
              <SocialLinks
                settings={settings}
                tone="light"
                label={locale === 'ar' ? 'حسابات التواصل الاجتماعي' : 'Social media'}
              />
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
