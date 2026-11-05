'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Company, Locale, Sector, Service } from '@/lib/types';
import { getDict, pick } from '@/lib/i18n';
import { ChevronDown, Mail, Menu, Phone, X } from './icons';

type Props = {
  locale: Locale;
  sectors: Sector[];
  companies: Company[];
  services: Service[];
  logo: string;
};

export default function SiteHeader({ locale, sectors, companies, services, logo }: Props) {
  const t = getDict(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/${locale}`;
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const switchHref = pathname.replace(/^\/(ar|en)/, `/${otherLocale}`) || `/${otherLocale}`;
  const isHome = pathname === base || pathname === `${base}/`;
  const ar = locale === 'ar';

  type NavLink = { href: string; label: string; match?: string };
  const links: NavLink[] = [
    { href: `${base}#about`, label: t.nav.about, match: `${base}/about` },
    { href: `${base}/contact`, label: t.nav.contact, match: `${base}/contact` },
    { href: `${base}/projects`, label: ar ? 'أعمالنا' : 'Our work', match: `${base}/projects` },
    { href: `${base}/media`, label: t.nav.media, match: `${base}/media` },
    { href: `${base}/news`, label: t.nav.news, match: `${base}/news` },
    { href: `${base}#team`, label: ar ? 'فريق العمل' : 'Our team' },
  ];

  const isActive = (match?: string) =>
    Boolean(match) && (pathname === match || pathname.startsWith(`${match}/`));

  return (
    <>
      <a className="skip-link" href="#main">
        {ar ? 'تجاوز إلى المحتوى' : 'Skip to content'}
      </a>

      <header className={`site-header${isHome ? ' is-home' : ''}${open ? ' is-open' : ''}`}>
        <div className="container header-top">
          <Link href={base} className="brand" aria-label={t.siteName}>
            <img src={logo} alt={t.siteName} width={375} height={63} />
          </Link>

          <div className="header-top-side">
            <a className="header-phone" href="tel:+96826854411" dir="ltr">
              <Phone size={15} /> +968 26 854 411
            </a>
            <Link href={switchHref} className="header-lang" hrefLang={otherLocale} lang={otherLocale}>
              {t.otherLang}
            </Link>
            <Link className="header-cta" href={`${base}/request`}>
              {t.nav.request}
            </Link>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={t.nav.menu}
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        <div className="header-bar">
          <div className="container header-bar-inner">
            <nav className="main-nav" aria-label={t.nav.menu}>
              <ul>
                <li>
                  <Link href={base} aria-current={isHome ? 'page' : undefined}>
                    {t.nav.home}
                  </Link>
                </li>
                {links.slice(0, 2).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={isActive(link.match) ? 'page' : undefined}>
                      {link.label}
                    </Link>
                  </li>
                ))}

                <li className="has-menu">
                  <Link href={`${base}/sectors`} aria-current={isActive(`${base}/sectors`) ? 'page' : undefined}>
                    {t.nav.sectors} <ChevronDown size={12} />
                  </Link>
                  <div className="mega">
                    <div className="mega-inner">
                      <div className="mega-head">
                        <span className="mega-eyebrow">{t.nav.sectors}</span>
                        <Link className="mega-all" href={`${base}/sectors`}>
                          {ar ? 'عرض جميع القطاعات' : 'View all sectors'}
                        </Link>
                      </div>
                      <div className="mega-grid cols-3">
                        {sectors.map((sector) => (
                          <Link key={sector.id} className="mega-link" href={`${base}/sectors/${sector.slug}`}>
                            <b>{pick(sector, 'name', locale)}</b>
                            <small>{pick(sector, 'tagline', locale)}</small>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                <li className="has-menu">
                  <Link href={`${base}/companies`} aria-current={isActive(`${base}/companies`) ? 'page' : undefined}>
                    {t.nav.companies} <ChevronDown size={12} />
                  </Link>
                  <div className="mega">
                    <div className="mega-inner">
                      <div className="mega-head">
                        <span className="mega-eyebrow">{t.nav.companies}</span>
                        <Link className="mega-all" href={`${base}/companies`}>
                          {ar ? 'عرض جميع الشركات' : 'View all companies'}
                        </Link>
                      </div>
                      <div className="mega-grid cols-2">
                        {companies.map((company) => (
                          <Link key={company.id} className="mega-link" href={`${base}/companies#company-${company.slug}`}>
                            <b>{pick(company, 'name', locale)}</b>
                            <small>{pick(company, 'description', locale)}</small>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                <li className="has-menu">
                  <Link href={`${base}/request`} aria-current={isActive(`${base}/request`) ? 'page' : undefined}>
                    {t.nav.services} <ChevronDown size={12} />
                  </Link>
                  <div className="mega mega-wide">
                    <div className="mega-inner">
                      <div className="mega-head">
                        <span className="mega-eyebrow">{t.nav.services}</span>
                        <Link className="mega-all" href={`${base}/request`}>
                          {ar ? 'طلب خدمة' : 'Request a service'}
                        </Link>
                      </div>
                      <div className="mega-grid cols-3 mega-scroll">
                        {services.map((service) => (
                          <Link key={service.id} className="mega-link sm" href={`${base}/request?service=${service.id}`}>
                            {pick(service, 'name', locale)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                {links.slice(2).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={isActive(link.match) ? 'page' : undefined}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-drawer" id="mobile-menu" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <div className="mobile-drawer-head">
            <img src={logo} alt={t.siteName} height={34} />
            <button type="button" aria-label={t.nav.close} onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <nav>
            <Link href={base} onClick={() => setOpen(false)}>
              {t.nav.home}
            </Link>
            {links.slice(0, 2).map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}

            <details className="drawer-group">
              <summary>
                {t.nav.sectors} <ChevronDown size={15} />
              </summary>
              <Link href={`${base}/sectors`} onClick={() => setOpen(false)}>
                {ar ? 'جميع القطاعات' : 'All sectors'}
              </Link>
              {sectors.map((sector) => (
                <Link key={sector.id} href={`${base}/sectors/${sector.slug}`} onClick={() => setOpen(false)}>
                  {pick(sector, 'name', locale)}
                </Link>
              ))}
            </details>

            <details className="drawer-group">
              <summary>
                {t.nav.companies} <ChevronDown size={15} />
              </summary>
              <Link href={`${base}/companies`} onClick={() => setOpen(false)}>
                {ar ? 'جميع الشركات' : 'All companies'}
              </Link>
              {companies.map((company) => (
                <Link key={company.id} href={`${base}/companies#company-${company.slug}`} onClick={() => setOpen(false)}>
                  {pick(company, 'name', locale)}
                </Link>
              ))}
            </details>

            <details className="drawer-group">
              <summary>
                {t.nav.services} <ChevronDown size={15} />
              </summary>
              <Link href={`${base}/request`} onClick={() => setOpen(false)}>
                {ar ? 'جميع الخدمات' : 'All services'}
              </Link>
              {services.map((service) => (
                <Link key={service.id} href={`${base}/request?service=${service.id}`} onClick={() => setOpen(false)}>
                  {pick(service, 'name', locale)}
                </Link>
              ))}
            </details>

            {links.slice(2).map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href={switchHref} onClick={() => setOpen(false)} className="drawer-lang">
              {t.otherLang}
            </Link>
          </nav>
          <a href="tel:+96826854411" className="drawer-phone" dir="ltr">
            <Phone size={16} /> +968 26 854 411
          </a>
          <a href="mailto:albadi@albadigroup.com" className="drawer-phone">
            <Mail size={16} /> albadi@albadigroup.com
          </a>
        </div>
      )}
    </>
  );
}
