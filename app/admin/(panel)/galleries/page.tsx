import { getAllSectors } from '@/lib/queries';
import { getSiteSettings } from '@/lib/site-settings.server';
import { saveSectorGallery } from '@/app/admin/actions';
import GalleryManager from '@/components/admin/gallery-manager';

export default async function AdminGalleriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [sectors, settings] = await Promise.all([getAllSectors(), getSiteSettings()]);

  return (
    <>
      <div className="admin-topbar">
        <h1>صور أعمال القطاعات</h1>
        <span className="crumb">معرض صور لكل قطاع</span>
      </div>
      <div className="admin-content">
        <GalleryManager
          sectors={sectors.map((sector) => ({
            id: sector.id,
            name: sector.name_ar,
            slug: sector.slug,
            hero: sector.hero_url ?? null,
          }))}
          gallery={settings.gallery}
          action={saveSectorGallery}
          saved={saved === '1'}
        />
      </div>
    </>
  );
}
