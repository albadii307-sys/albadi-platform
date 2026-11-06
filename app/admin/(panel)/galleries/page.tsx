import Link from 'next/link';
import { getAllProjects, getAllSectors } from '@/lib/queries';
import { list } from '@/lib/db';
import type { Company, NewsItem } from '@/lib/types';
import { getSiteSettings } from '@/lib/site-settings.server';
import { saveItemGallery, saveSectorGallery } from '@/app/admin/actions';
import GalleryManager from '@/components/admin/gallery-manager';

type TabKey = 'sectors' | 'companies' | 'projects' | 'news';

export default async function AdminGalleriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; type?: string }>;
}) {
  const { saved, type: rawType } = await searchParams;
  const type: TabKey =
    rawType === 'companies' || rawType === 'projects' || rawType === 'news' ? rawType : 'sectors';

  const [sectors, companies, projects, news, settings] = await Promise.all([
    getAllSectors(),
    list<Company>('companies', { order: { column: 'sort_order', ascending: true } }),
    getAllProjects(),
    list<NewsItem>('news', { order: { column: 'published_at', ascending: false } }),
    getSiteSettings(),
  ]);

  const tabs: { key: TabKey; label: string; href: string; count: number }[] = [
    { key: 'sectors', label: 'القطاعات', href: '/admin/galleries', count: sectors.length },
    { key: 'companies', label: 'الشركات', href: '/admin/galleries?type=companies', count: companies.length },
    { key: 'projects', label: 'المشاريع', href: '/admin/galleries?type=projects', count: projects.length },
    { key: 'news', label: 'الأخبار', href: '/admin/galleries?type=news', count: news.length },
  ];

  const config =
    type === 'companies'
      ? {
          title: 'صور الشركات',
          heading: 'صور الشركة',
          items: companies.map((company) => ({
            id: company.id,
            name: company.name_ar,
            slug: company.slug,
            hero: company.logo_url,
          })),
          gallery: settings.itemGallery,
          action: saveItemGallery,
          fieldName: 'gallery_key',
          keyPrefix: 'company:',
        }
      : type === 'projects'
      ? {
          title: 'صور المشاريع',
          heading: 'صور المشروع',
          items: projects.map((project) => ({
            id: project.id,
            name: project.title_ar,
            slug: project.year ? `${project.slug} · ${project.year}` : project.slug,
            hero: project.cover_url,
          })),
          gallery: settings.itemGallery,
          action: saveItemGallery,
          fieldName: 'gallery_key',
          keyPrefix: 'project:',
        }
      : type === 'news'
        ? {
            title: 'صور الأخبار',
            heading: 'صور الخبر',
            items: news.map((item) => ({
              id: item.id,
              name: item.title_ar,
              slug: item.slug,
              hero: item.cover_url,
            })),
            gallery: settings.itemGallery,
            action: saveItemGallery,
            fieldName: 'gallery_key',
            keyPrefix: 'news:',
          }
        : {
            title: 'صور أعمال القطاعات',
            heading: 'صور القطاع',
            items: sectors.map((sector) => ({
              id: sector.id,
              name: sector.name_ar,
              slug: sector.slug,
              hero: sector.hero_url ?? null,
            })),
            gallery: settings.gallery,
            action: saveSectorGallery,
            fieldName: 'sector_id',
            keyPrefix: '',
          };

  return (
    <>
      <div className="admin-topbar">
        <h1>معارض الصور</h1>
        <span className="crumb">عدة صور لكل قطاع ومشروع وخبر — تظهر كمعرض في الصفحة العامة</span>
      </div>
      <div className="admin-content">
        <nav className="a-toolbar" aria-label="نوع المعرض">
          <div className="a-seg">
            {tabs.map((tab) => (
              <Link key={tab.key} href={tab.href} className={type === tab.key ? 'is-on' : undefined}>
                {tab.label}
                <span>{tab.count}</span>
              </Link>
            ))}
          </div>
          <span className="row-sub">{config.title}</span>
        </nav>

        <GalleryManager
          items={config.items}
          gallery={config.gallery}
          action={config.action}
          fieldName={config.fieldName}
          keyPrefix={config.keyPrefix}
          heading={config.heading}
          saved={saved === '1'}
        />
      </div>
    </>
  );
}
