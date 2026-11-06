import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/jsonld';

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/api/'] }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
