import type { MetadataRoute } from 'next';
import { getAllNews, getAllProjects, getSectors } from '@/lib/queries';
import { locales } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const staticPaths = [
  '',
  '/about',
  '/vision',
  '/sectors',
  '/companies',
  '/projects',
  '/news',
  '/csr',
  '/media',
  '/careers',
  '/contact',
  '/request',
];

function entry(site: string, path: string, lastModified?: string): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${site}/${locale}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: path === '' || path === '/news' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.startsWith('/sectors') ? 0.9 : 0.7,
    alternates: {
      languages: {
        ar: `${site}/ar${path}`,
        en: `${site}/en${path}`,
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.albadigroup.com').replace(/\/$/, '');
  const [sectors, projects, news] = await Promise.all([getSectors(), getAllProjects(), getAllNews()]);

  const rows: MetadataRoute.Sitemap = staticPaths.flatMap((path) => entry(site, path));

  for (const sector of sectors) rows.push(...entry(site, `/sectors/${sector.slug}`));
  for (const project of projects) rows.push(...entry(site, `/projects/${project.slug}`));
  for (const item of news) rows.push(...entry(site, `/news/${item.slug}`, item.published_at));

  return rows;
}
