import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import { getDict, isLocale, type Locale } from '@/lib/i18n';
import { getSiteSettings } from '@/lib/site-settings.server';
import { Check, Mail } from '@/components/icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.nav.careers,
    alternates: { canonical: `/${l}/careers`, languages: { ar: '/ar/careers', en: '/en/careers' } },
  };
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDict(locale);
  const settings = await getSiteSettings();

  const steps =
    locale === 'ar'
      ? [
          ['استلام السيرة الذاتية', 'نراجع كل سيرة ذاتية تصلنا ونحتفظ بها في قاعدة بيانات الكفاءات.'],
          ['الفرز والمقابلة الأولية', 'يتواصل معك فريق الموارد البشرية لتحديد موعد المقابلة.'],
          ['المقابلة الفنية', 'مقابلة مع مدير القطاع المعني لتقييم الخبرة والمهارات.'],
          ['العرض والتوظيف', 'إصدار العرض الوظيفي وإكمال إجراءات التعيين.'],
        ]
      : [
          ['Application received', 'Every CV is reviewed and kept in our talent database.'],
          ['Screening and first interview', 'Our HR team will contact you to schedule an interview.'],
          ['Technical interview', 'A meeting with the relevant sector manager to assess experience.'],
          ['Offer and onboarding', 'We issue the offer and complete the joining formalities.'],
        ];

  return (
    <>
      <PageHero
        locale={locale}
        title={t.nav.careers}
        subtitle={locale === 'ar' ? 'انضم إلى فريق مجموعة البادي.' : 'Join the Al-Badi team.'}
        crumbs={[{ label: t.nav.careers }]}
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="service-card" style={{ padding: 32 }}>
            <span className="service-num">{locale === 'ar' ? 'الوظائف الشاغرة' : 'OPEN POSITIONS'}</span>
            <h2 style={{ fontSize: '1.4rem' }}>
              {locale === 'ar' ? 'لا توجد شواغر معلنة حالياً' : 'No open positions at the moment'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
              {locale === 'ar'
                ? 'نرحب باستلام سيرتكم الذاتية للاحتفاظ بها في قاعدة بيانات الكفاءات، وسنتواصل معكم عند توفر وظيفة مناسبة.'
                : 'We welcome your CV for our talent database and will contact you when a suitable role opens.'}
            </p>
            <a
              className="btn btn-dark"
              href={`mailto:${settings.email}?subject=${encodeURIComponent('CV - Al-Badi Group')}`}
            >
              <Mail size={16} /> {locale === 'ar' ? 'أرسل سيرتك الذاتية' : 'Send your CV'}
            </a>
          </div>

          <h2 className="section-title" style={{ fontSize: '1.4rem', margin: '40px 0 12px' }}>
            {locale === 'ar' ? 'مراحل التوظيف' : 'Recruitment process'}
          </h2>
          <div className="timeline">
            {steps.map(([title, text], index) => (
              <div className="timeline-item" key={title}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>

          <ul className="mini-list" style={{ marginTop: 32 }}>
            <li>
              <Check size={18} /> {locale === 'ar' ? 'بيئة عمل تدعم التطوير والتدريب' : 'A culture that supports training and growth'}
            </li>
            <li>
              <Check size={18} /> {locale === 'ar' ? 'أولوية للكفاءات العُمانية' : 'Priority for Omani talent'}
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
