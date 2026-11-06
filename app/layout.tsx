import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { IBM_Plex_Sans_Arabic, Cairo, Tajawal, Almarai, Noto_Kufi_Arabic, Amiri } from 'next/font/google';
import './globals.css';
import './exclusive.css';

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
  preload: false,
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-tajawal',
  display: 'swap',
  preload: false,
});

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
  preload: false,
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-kufi',
  display: 'swap',
  preload: false,
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
  preload: false,
});

const fontVars = [arabic.variable, cairo.variable, tajawal.variable, almarai.variable, notoKufi.variable, amiri.variable].join(' ');

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.albadigroup.com'),
  title: {
    default: 'مجموعة البادي للاستثمار القابضة',
    template: '%s | مجموعة البادي',
  },
  description:
    'مجموعة عُمانية متعددة الأنشطة تأسست عام 1976، تعمل في المقاولات والصناعة والتجارة والتعليم والضيافة.',
  icons: { icon: '/media/brand/favicon.png' },
  openGraph: {
    type: 'website',
    siteName: 'مجموعة البادي للاستثمار القابضة',
    images: [{ url: '/media/hero/hero-1.webp', alt: 'مجموعة البادي للاستثمار القابضة' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مجموعة البادي للاستثمار القابضة',
    description:
      'مجموعة عُمانية متعددة الأنشطة تأسست عام 1976، تعمل في المقاولات والصناعة والتجارة والتعليم والضيافة.',
    images: ['/media/hero/hero-1.webp'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await headers();
  const locale = store.get('x-locale') === 'en' ? 'en' : 'ar';

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={fontVars}>
      <body>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
