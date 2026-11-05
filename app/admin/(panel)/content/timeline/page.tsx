import { getSiteSettings } from '@/lib/site-settings.server';
import { saveTimeline } from '@/app/admin/actions';
import ContentList from '@/components/admin/content-list';

export default async function TimelineContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <>
      <div className="admin-topbar">
        <h1>محطات من مسيرتنا</h1>
        <span className="crumb">{settings.timeline.length} محطة</span>
      </div>
      <div className="admin-content">
        <ContentList
          kind="timeline"
          rows={settings.timeline.map((row) => ({ ...row }))}
          action={saveTimeline}
          saved={saved === '1'}
        />
      </div>
    </>
  );
}
