import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import './exclusive.css';

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.albadigroup.com'),
  title: {
    default: 'مجموعة البادي للاستثمار القابضة',
    template: '%s | مجموعة البادي',
  },
  description:
    'مجموعة عُمانية متعددة الأنشطة تأسست عام 1976، تعمل في المقاولات والصناعة والتجارة والتعليم والضيافة.',
  icons: { icon: '/media/brand/favicon.png' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await headers();
  const locale = store.get('x-locale') === 'en' ? 'en' : 'ar';

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={arabic.variable}>
      <body>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
