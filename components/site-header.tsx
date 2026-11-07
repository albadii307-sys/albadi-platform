'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Company, Locale, Sector, Service } from '@/lib/types';
import { getDict, pick } from '@/lib/i18n';
import { siteName, telHref, type SiteSettings } from '@/lib/site-settings';
import SocialLinks from './social-links';
import { ChevronDown, Mail, Menu, Phone, X } from './icons';

type Props = {
  locale: Locale;
  sectors: Sector[];
  companies: Company[];
  services: Service[];
  settings: SiteSettings;
};

export default function SiteHeader({ locale, sectors, companies, services, settings }: Props) {
  const t = getDict(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, on: false });
  const base = `/${locale}`;
  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const switchHref = pathname.replace(/^\/(ar|en)/, `/${otherLocale}`) || `/${otherLocale}`;
  const isHome = pathname === base || pathname === `${base}/`;
  const ar = locale === 'ar';

  const placeIndicator = useCallback((target: EventTarget | null) => {
    const list = navRef.current;
    if (!list || !(target instanceof HTMLElement)) {
      setIndicator((current) => ({ ...current, on: false }));
      return;
    }
    const listRect = list.getBoundingClientRect();
    const itemRect = target.getBoundingClientRect();
    if (!itemRect.width) return;
    setIndicator({
      x: itemRect.left - listRect.left + 8,
      w: Math.max(0, itemRect.width - 16),
      on: true,
    });
  }, []);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? null;
    placeIndicator(active);
    const onResize = () =>
      placeIndicator(navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? null);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pathname, placeIndicator]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const serviceGroups = sectors
    .map((sector) => ({
      sector,
      items: services.filter((service) => service.sector_id === sector.id),
    }))
    .filter((group) => group.items.length > 0);
  const looseServices = services.filter(
    (service) => !service.sector_id || !sectors.some((sector) => sector.id === service.sector_id)
  );

  type NavLink = { href: string; label: string; match?: string };
  const links: NavLink[] = [
    { href: `${base}#about`, label: t.nav.about, match: `${base}/about` },
    { href: `${base}#why`, label: ar ? 'لماذا مجموعة البادي' : 'Why Al-Badi' },
    { href: `${base}#timeline`, label: ar ? 'محطات من مسيرتنا' : 'Our journey' },
    { href: `${base}#team`, label: ar ? 'فريق العمل' : 'Our team' },
    { href: `${base}/projects`, label: ar ? 'أعمالنا' : 'Our work', match: `${base}/projects` },
    { href: `${base}/request`, label: ar ? 'اطلب خدمة' : 'Request a service', match: `${base}/request` },
    { href: `${base}/news`, label: t.nav.news, match: `${base}/news` },
    { href: `${base}#location`, label: ar ? 'موقعنا' : 'Location' },
    { href: `${base}/contact`, label: t.nav.contact, match: `${base}/contact` },
    { href: `${base}/media`, label: t.nav.media, match: `${base}/media` },
  ];

  const isActive = (match?: string) =>
    Boolean(match) && (pathname === match || pathname.startsWith(`${match}/`));

  return (
    <>
      <a className="skip-link" href="#main">
        {ar ? 'تجاوز إلى المحتوى' : 'Skip to content'}
      </a>

      <header
        className={`site-header${isHome ? ' is-home' : ''}${open ? ' is-open' : ''}`}
        onMouseLeave={() =>
          placeIndicator(navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? null)
        }
      >
        <div className="container header-top">
          <Link href={base} className="brand" aria-label={siteName(locale, settings)}>
            <img src={settings.logo} alt={siteName(locale, settings)} width={375} height={63} />
          </Link>

          <div className="header-top-side">
            <a className="header-phone" href={telHref(settings.phone)} dir="ltr">
              <Phone size={15} /> {settings.phone}
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
              <ul ref={navRef}>
                <span
                  className="nav-indicator"
                  aria-hidden="true"
                  style={{
                    transform: `translateX(${indicator.x}px)`,
                    width: `${indicator.w}px`,
                    opacity: indicator.on ? 1 : 0,
                  }}
                />
                <li>
                  <Link href={base} aria-current={isHome ? 'page' : undefined} onMouseEnter={(e) => placeIndicator(e.currentTarget)}>
                    {t.nav.home}
                  </Link>
                </li>
                {links.slice(0, 3).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.match) ? 'page' : undefined}
                      onMouseEnter={(e) => placeIndicator(e.currentTarget)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

                <li className="has-menu">
                  <Link
                    href={`${base}/sectors`}
                    aria-current={isActive(`${base}/sectors`) ? 'page' : undefined}
                    onMouseEnter={(e) => placeIndicator(e.currentTarget)}
                  >
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
                  <Link
                    href={`${base}/companies`}
                    aria-current={isActive(`${base}/companies`) ? 'page' : undefined}
                    onMouseEnter={(e) => placeIndicator(e.currentTarget)}
                  >
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
                  <Link
                    href={`${base}/services`}
                    aria-current={isActive(`${base}/services`) ? 'page' : undefined}
                    onMouseEnter={(e) => placeIndicator(e.currentTarget)}
                  >
                    {t.nav.services} <ChevronDown size={12} />
                  </Link>
                  <div className="mega mega-wide">
                    <div className="mega-inner">
                      <div className="mega-head">
                        <span className="mega-eyebrow">{t.nav.services}</span>
                        <Link className="mega-all" href={`${base}/services`}>
                          {ar ? 'عرض جميع الخدمات' : 'View all services'}
                        </Link>
                      </div>
                      <div className="mega-services mega-scroll">
                        {serviceGroups.map((group) => (
                          <div className="mega-group" key={group.sector.id}>
                            <Link className="mega-group-head" href={`${base}/sectors/${group.sector.slug}`}>
                              {pick(group.sector, 'name', locale)}
                            </Link>
                            {group.items.slice(0, 6).map((service) => (
                              <Link
                                key={service.id}
                                className="mega-link sm"
                                href={`${base}/services/${service.slug}`}
                              >
                                {pick(service, 'name', locale)}
                              </Link>
                            ))}
                            {group.items.length > 6 ? (
                              <Link className="mega-link sm is-more" href={`${base}/sectors/${group.sector.slug}`}>
                                {ar
                                  ? `+${group.items.length - 6} خدمات أخرى`
                                  : `+${group.items.length - 6} more services`}
                              </Link>
                            ) : null}
                          </div>
                        ))}
                        {looseServices.length ? (
                          <div className="mega-group">
                            <span className="mega-group-head">{ar ? 'خدمات أخرى' : 'Other services'}</span>
                            {looseServices.map((service) => (
                              <Link
                                key={service.id}
                                className="mega-link sm"
                                href={`${base}/services/${service.slug}`}
                              >
                                {pick(service, 'name', locale)}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>

                {links.slice(3).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.match) ? 'page' : undefined}
                      onMouseEnter={(e) => placeIndicator(e.currentTarget)}
                    >
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
            <img src={settings.logo} alt={siteName(locale, settings)} height={34} />
            <button type="button" aria-label={t.nav.close} onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <nav>
            <Link href={base} onClick={() => setOpen(false)}>
              {t.nav.home}
            </Link>
            {links.slice(0, 3).map((link) => (
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
              <Link href={`${base}/services`} onClick={() => setOpen(false)}>
                {ar ? 'جميع الخدمات' : 'All services'}
              </Link>
              {serviceGroups.map((group) => (
                <div className="drawer-group-sub" key={group.sector.id}>
                  <Link
                    className="drawer-group-head"
                    href={`${base}/sectors/${group.sector.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    {pick(group.sector, 'name', locale)}
                  </Link>
                  {group.items.map((service) => (
                    <Link
                      key={service.id}
                      href={`${base}/services/${service.slug}`}
                      onClick={() => setOpen(false)}
                    >
                      {pick(service, 'name', locale)}
                    </Link>
                  ))}
                </div>
              ))}
              {looseServices.length ? (
                <div className="drawer-group-sub">
                  <span className="drawer-group-head">{ar ? 'خدمات أخرى' : 'Other services'}</span>
                  {looseServices.map((service) => (
                    <Link
                      key={service.id}
                      href={`${base}/services/${service.slug}`}
                      onClick={() => setOpen(false)}
                    >
                      {pick(service, 'name', locale)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </details>

            {links.slice(3).map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href={switchHref} onClick={() => setOpen(false)} className="drawer-lang">
              {t.otherLang}
            </Link>
          </nav>
          <a href={telHref(settings.phone)} className="drawer-phone" dir="ltr">
            <Phone size={16} /> {settings.phone}
          </a>
          <a href={`mailto:${settings.email}`} className="drawer-phone">
            <Mail size={16} /> {settings.email}
          </a>
          <SocialLinks settings={settings} tone="dark" label={ar ? 'حسابات التواصل الاجتماعي' : 'Social media'} />
        </div>
      )}
    </>
  );
}
