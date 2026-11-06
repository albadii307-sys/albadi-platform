import { getMedia } from '@/lib/queries';
import { uploadMedia, deleteCollectionItem } from '@/app/admin/actions';
import { Plus } from '@/components/icons';
import MediaLibrary, { type MediaRow } from '@/components/admin/media-library';
import UploadInput from '@/components/admin/upload-input';

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('ar-OM-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(value)
      )
    : '—';

export default async function AdminMediaPage() {
  const media = await getMedia();

  const items: MediaRow[] = media.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    kind: item.kind,
    date: formatDate(item.created_at),
    deleteAction: deleteCollectionItem.bind(null, 'media', item.id),
  }));

  return (
    <>
      <div className="admin-topbar">
        <h1>الوسائط</h1>
        <span className="crumb">{media.length} ملف</span>
      </div>
      <div className="admin-content">
        <div className="panel">
          <div className="panel-head">
            <h2>رفع ملف جديد</h2>
            <span className="row-sub">صور أو PDF حتى 3.5MB</span>
          </div>
          <div className="panel-body">
            <form
              action={uploadMedia}
              className="a-form"
              style={{ gridTemplateColumns: '1fr auto', display: 'grid', gap: 12 }}
            >
              <div className="a-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="a-field">
                  <label htmlFor="title">عنوان الملف</label>
                  <input id="title" name="title" placeholder="مثال: كتيب المجموعة 2026" />
                </div>
                <div className="a-field">
                  <label htmlFor="file">الملف (صورة أو PDF، حتى 3.5MB)</label>
                  <UploadInput id="file" name="file" accept="image/*,.pdf" required />
                </div>
              </div>
              <button type="submit" className="a-btn primary" style={{ alignSelf: 'end' }}>
                <Plus size={15} /> رفع
              </button>
            </form>
          </div>
        </div>

        <MediaLibrary items={items} />
      </div>
    </>
  );
}
