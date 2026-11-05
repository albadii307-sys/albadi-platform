import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { getDict } from '@/lib/i18n';

export type Crumb = { label: string; href?: string };

export default function PageHero({
  locale,
  title,
  subtitle,
  crumbs,
}: {
  locale: Locale;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  const t = getDict(locale);
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href={`/${locale}`}>{t.common.home}</Link>
          {crumbs?.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <span>/</span>
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </span>
          ))}
        </nav>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}
