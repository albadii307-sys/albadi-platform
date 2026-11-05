import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { ScrollFX } from '@/components/x-motion';
import { isLocale, getDict, locales, type Locale } from '@/lib/i18n';
import { getCompanies, getSectors, getServices } from '@/lib/queries';
import { getSiteSettings } from '@/lib/site-settings.server';
import { fontOptions } from '@/lib/site-settings';

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : 'ar';
  const t = getDict(locale);
  const base = `/${locale}`;
  return {
    title: t.seo.homeTitle,
    description: t.seo.homeDesc,
    alternates: {
      canonical: base,
      languages: { ar: '/ar', en: '/en' },
    },
    openGraph: {
      title: t.seo.homeTitle,
      description: t.seo.homeDesc,
      locale: locale === 'ar' ? 'ar_OM' : 'en_OM',
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const [sectors, companies, services, settings] = await Promise.all([
    getSectors(),
    getCompanies(),
    getServices(),
    getSiteSettings(),
  ]);

  const typo = settings.typography;
  const bodyStack = fontOptions.find((font) => font.key === typo.bodyFont)?.stack ?? fontOptions[0].stack;
  const headingStack = fontOptions.find((font) => font.key === typo.headingFont)?.stack ?? fontOptions[0].stack;
  const typeCss = `:root{--site-body-font:${bodyStack};--site-heading-font:${headingStack};--site-line-height:${typo.lineHeight};--site-letter-spacing:${typo.letterSpacing}px;--site-heading-weight:${typo.headingWeight};font-size:${typo.baseSize}px}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: typeCss }} />
      <ScrollFX />
      <SiteHeader locale={locale} sectors={sectors} companies={companies} services={services} settings={settings} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} sectors={sectors} settings={settings} />
    </>
  );
}
