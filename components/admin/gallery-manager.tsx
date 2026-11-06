'use client';

import { useState } from 'react';
import { Check, ImageIcon, Plus, Trash, X } from '@/components/icons';
import SubmitButton from './submit-button';

type SectorRow = { id: string; name: string; slug: string; hero: string | null };

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export default function GalleryManager({
  sectors,
  gallery,
  action,
  saved,
}: {
  sectors: SectorRow[];
  gallery: Record<string, string[]>;
  action: (formData: FormData) => Promise<void>;
  saved: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [picked, setPicked] = useState<File[]>([]);
  const [pickError, setPickError] = useState('');
  const [dirty, setDirty] = useState(false);

  const sector = sectors.find((item) => item.id === openId) ?? null;

  const start = (id: string) => {
    setOpenId(id);
    setImages(gallery[id] ?? []);
    setUrl('');
    setPicked([]);
    setPickError('');
    setDirty(false);
  };

  const close = () => {
    setOpenId(null);
    setImages([]);
    setPicked([]);
    setUrl('');
  };

  return (
    <>
      <div className="a-toolbar">
        <span className="a-count">{sectors.length} قطاع</span>
        {saved && !dirty ? (
          <span className="a-saved">
            <Check size={14} /> تم الحفظ
          </span>
        ) : (
          <span className="row-sub">أضف عدة صور لكل قطاع — تظهر كمعرض أعمال في صفحة القطاع.</span>
        )}
      </div>

      <div className="a-cardgrid">
        {sectors.map((item) => {
          const photos = gallery[item.id] ?? [];
          const cover = photos[0] ?? item.hero;
          return (
            <article className="a-card" key={item.id}>
              <div className="a-card-media">
                {cover ? <img src={cover} alt={item.name} /> : <span className="a-card-media-empty"><ImageIcon size={22} /></span>}
                <span className="a-card-badge">{photos.length} صورة</span>
              </div>
              <div className="a-card-body">
                <h3 className="a-card-title">{item.name}</h3>
                <p className="a-card-text" dir="ltr">{item.slug}</p>
                <div className="a-card-thumbs">
                  {photos.slice(0, 4).map((photo) => (
                    <img key={photo} src={photo} alt="" />
                  ))}
                  {photos.length > 4 ? <span>+{photos.length - 4}</span> : null}
                </div>
              </div>
              <div className="a-card-actions">
                <button type="button" className="a-btn ghost small" onClick={() => start(item.id)}>
                  <Plus size={14} /> إدارة الصور
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {openId ? (
        <div className="a-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
          <div className="a-modal-card wide">
            <form action={action} className="a-modal-form">
              <div className="a-modal-head">
                <h2 id="gallery-modal-title">صور أعمال: {sector?.name}</h2>
                <button type="button" className="a-modal-close" onClick={close} aria-label="إغلاق">
                  <X size={18} />
                </button>
              </div>

              <div className="a-modal-body">
                <input type="hidden" name="sector_id" value={openId} />
                <input type="hidden" name="images" value={JSON.stringify(images)} />

                <div className="a-gallery-grid">
                  {images.map((photo) => (
                    <figure key={photo} className="a-gallery-item">
                      <img src={photo} alt="" />
                      <button
                        type="button"
                        className="icon-btn danger"
                        aria-label="حذف الصورة"
                        onClick={() => {
                          setImages((list) => list.filter((entry) => entry !== photo));
                          setDirty(true);
                        }}
                      >
                        <Trash size={14} />
                      </button>
                    </figure>
                  ))}
                  {!images.length ? <p className="row-sub">لا توجد صور بعد — ارفع صوراً أو أضف رابطاً.</p> : null}
                </div>

                <div className="a-grid-2">
                  <div className="a-field">
                    <label htmlFor="gallery-files">رفع صور (يمكن اختيار عدة صور)</label>
                    <input
                      id="gallery-files"
                      name="files"
                      type="file"
                      accept={ACCEPTED.join(',')}
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        const valid = files.filter((file) => ACCEPTED.includes(file.type) && file.size <= MAX_BYTES);
                        const skipped = files.length - valid.length;
                        setPicked(valid);
                        setPickError(
                          skipped
                            ? `تم تجاهل ${skipped} ملفاً: الصيغة أو الحجم غير مدعوم (الحد 8 ميجابايت).`
                            : ''
                        );
                        setDirty(files.length > 0);
                      }}
                    />
                    {pickError ? <span className="field-error">{pickError}</span> : null}
                    {picked.length ? <span className="help">سيتم رفع {picked.length} صورة عند الحفظ.</span> : null}
                  </div>
                  <div className="a-field">
                    <label htmlFor="gallery-url">إضافة برابط صورة</label>
                    <div className="a-inline">
                      <input id="gallery-url" dir="ltr" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/media/projects/p1.webp" />
                      <button
                        type="button"
                        className="a-btn"
                        onClick={() => {
                          const value = url.trim();
                          if (!value) return;
                          setImages((list) => (list.includes(value) ? list : [...list, value]));
                          setUrl('');
                          setDirty(true);
                        }}
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="a-modal-foot">
                <button type="button" className="a-btn" onClick={close}>
                  إلغاء
                </button>
                <SubmitButton pendingLabel="جارٍ رفع الصور وحفظها…">
                  <Check size={15} /> حفظ الصور
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
