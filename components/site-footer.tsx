import Link from 'next/link';
import type { Locale, Sector } from '@/lib/types';
import { getDict, pick } from '@/lib/i18n';
import { Mail, Phone, Pin, ArrowUpRight } from './icons';

export default function SiteFooter({ locale, sectors, logo }: { locale: Locale; sectors: Sector[]; logo: string }) {
  const t = getDict(locale);
  const base = `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="x-foot-top">
          <p>{locale === 'ar' ? 'لنبنِ مشروعك القادم معاً.' : 'Let’s build your next project together.'}</p>
          <Link href={`${base}/contact`} className="x-foot-cta">
            {t.nav.contact} <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="footer-grid">
          <div>
            <Link href={base} className="brand">
              <img src={logo} alt={t.siteName} width={375} height={63} />
            </Link>
            <p style={{ marginTop: 18, maxWidth: '38ch', lineHeight: 1.8 }}>{t.footer.about}</p>
          </div>

          <div>
            <h4>{t.footer.quickLinks}</h4>
            <ul>
              <li><Link href={`${base}/about`}>{t.nav.about}</Link></li>
              <li><Link href={`${base}/vision`}>{t.nav.vision}</Link></li>
              <li><Link href={`${base}/projects`}>{t.nav.projects}</Link></li>
              <li><Link href={`${base}/news`}>{t.nav.news}</Link></li>
              <li><Link href={`${base}/csr`}>{t.nav.csr}</Link></li>
              <li><Link href={`${base}/careers`}>{t.nav.careers}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t.footer.sectors}</h4>
            <ul>
              {sectors.slice(0, 6).map((sector) => (
                <li key={sector.id}>
                  <Link href={`${base}/sectors/${sector.slug}`}>{pick(sector, 'name', locale)}</Link>
                </li>
              ))}
              <li><Link href={`${base}/sectors`}>{t.common.viewAll}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t.footer.contact}</h4>
            <ul className="footer-contact">
              <li>
                <Phone size={16} />
                <span dir="ltr">
                  <a href="tel:+96826854411">+968 26 854 411</a>
                  <br />
                  <a href="tel:+96826855744">+968 26 855 744</a>
                </span>
              </li>
              <li>
                <Mail size={16} />
                <a href="mailto:albadi@albadigroup.com">albadi@albadigroup.com</a>
              </li>
              <li>
                <Pin size={16} />
                <span>{t.contact.addressValue}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {t.footer.rights}
          </span>
          <span>
            {t.footer.madeBy} · Al-Badi Digital
          </span>
        </div>

        <div className="x-foot-word" aria-hidden="true">
          AL-BADI
        </div>
      </div>
    </footer>
  );
}
