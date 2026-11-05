import { getSiteSettings } from '@/lib/site-settings.server';
import { saveWhyCards } from '@/app/admin/actions';
import ContentList from '@/components/admin/content-list';

export default async function WhyContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <>
      <div className="admin-topbar">
        <h1>لماذا مجموعة البادي</h1>
        <span className="crumb">{settings.why.length} بطاقة</span>
      </div>
      <div className="admin-content">
        <ContentList
          kind="why"
          rows={settings.why.map((row) => ({ ...row }))}
          action={saveWhyCards}
          saved={saved === '1'}
        />
      </div>
    </>
  );
}
