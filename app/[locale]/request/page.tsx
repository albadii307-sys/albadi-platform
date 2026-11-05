import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/page-hero';
import RequestForm from '@/components/request-form';
import { Check, Phone, Mail, Clock } from '@/components/icons';
import { getDict, isLocale, pick, type Locale } from '@/lib/i18n';
import { getSectors, getServices } from '@/lib/queries';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : 'ar';
  const t = getDict(l);
  return {
    title: t.services.requestTitle,
    description: t.home.servicesText,
    alternates: { canonical: `/${l}/request`, languages: { ar: '/ar/request', en: '/en/request' } },
  };
}

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string; sector?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const { service, sector } = await searchParams;
  const t = getDict(locale);

  const [sectors, services] = await Promise.all([getSectors(), getServices()]);
  const selected = services.find((item) => item.id === service);

  return (
    <>
      <PageHero
        locale={locale}
        title={t.services.requestTitle}
        subtitle={selected ? `${t.services.requestFor} ${pick(selected, 'name', locale)}` : t.home.servicesText}
        crumbs={[{ label: t.nav.request }]}
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <aside>
              <div className="side-card">
                <div className="side-card-head">{t.footer.contact}</div>
                <div style={{ padding: '8px 20px 18px' }}>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Phone size={18} />
                    </div>
                    <div>
                      <b>{t.contact.phone}</b>
                      <span dir="ltr">
                        <a href="tel:+96826854411">+968 26 854 411</a>
                      </span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Mail size={18} />
                    </div>
                    <div>
                      <b>{t.contact.email}</b>
                      <a href="mailto:albadi@albadigroup.com">albadi@albadigroup.com</a>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon">
                      <Clock size={18} />
                    </div>
                    <div>
                      <b>{t.contact.hours}</b>
                      <span>{t.contact.hoursValue}</span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="mini-list" style={{ marginTop: 26 }}>
                <li>
                  <Check size={18} /> {locale === 'ar' ? 'رد خلال يوم عمل واحد' : 'Reply within one business day'}
                </li>
                <li>
                  <Check size={18} /> {locale === 'ar' ? 'عرض سعر مفصّل حسب نطاق العمل' : 'A detailed quote based on scope'}
                </li>
                <li>
                  <Check size={18} /> {locale === 'ar' ? 'فريق متخصص لكل قطاع' : 'A dedicated team for each sector'}
                </li>
              </ul>

              <p style={{ marginTop: 22, fontSize: '0.82rem', color: 'var(--muted)' }}>
                {locale === 'ar' ? 'تريد تصفح الخدمات أولاً؟' : 'Prefer to browse first?'}{' '}
                <Link href={`/${locale}/sectors`} style={{ color: 'var(--green-700)', fontWeight: 600 }}>
                  {t.nav.sectors}
                </Link>
              </p>
            </aside>

            <RequestForm
              locale={locale}
              sectors={sectors.map((item) => ({ id: item.id, name: pick(item, 'name', locale) }))}
              services={services.map((item) => ({
                id: item.id,
                name: pick(item, 'name', locale),
                sectorId: item.sector_id,
              }))}
              defaultService={service}
              defaultSector={sector}
            />
          </div>
        </div>
      </section>
    </>
  );
}
