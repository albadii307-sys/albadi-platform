'use client';

import { useState } from 'react';
import { Check, ImageIcon, Plus, Trash, X } from '@/components/icons';
import { compressAll, replaceInputFiles } from '@/lib/compress-image';
import SubmitButton from './submit-button';

type GalleryItem = { id: string; name: string; slug: string; hero: string | null };

const MAX_BYTES = 3.5 * 1024 * 1024;
const MAX_TOTAL = 3.5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export default function GalleryManager({
  items,
  gallery,
  action,
  saved,
  fieldName = 'sector_id',
  keyPrefix = '',
  heading = 'صور أعمال',
}: {
  items: GalleryItem[];
  gallery: Record<string, string[]>;
  action: (formData: FormData) => Promise<void>;
  saved: boolean;
  fieldName?: string;
  keyPrefix?: string;
  heading?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [picked, setPicked] = useState<File[]>([]);
  const [pickError, setPickError] = useState('');
  const [dirty, setDirty] = useState(false);

  const keyFor = (id: string) => `${keyPrefix}${id}`;
  const photosOf = (id: string) => gallery[keyFor(id)] ?? [];
  const activeItem = items.find((item) => item.id === openId) ?? null;

  const start = (id: string) => {
    setOpenId(id);
    setImages(photosOf(id));
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
        <span className="a-count">{items.length} عنصر</span>
        {saved && !dirty ? (
          <span className="a-saved">
            <Check size={14} /> تم الحفظ
          </span>
        ) : (
          <span className="row-sub">أضف عدة صور لكل عنصر — تظهر كمعرض أعمال في صفحته.</span>
        )}
      </div>

      <div className="a-cardgrid">
        {items.map((item) => {
          const photos = photosOf(item.id);
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
                <h2 id="gallery-modal-title">{heading}: {activeItem?.name}</h2>
                <button type="button" className="a-modal-close" onClick={close} aria-label="إغلاق">
                  <X size={18} />
                </button>
              </div>

              <div className="a-modal-body">
                <input type="hidden" name={fieldName} value={keyFor(openId)} />
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
                      onChange={async (event) => {
                        const input = event.currentTarget;
                        const files = Array.from(input.files ?? []);
                        const valid = files.filter((file) => ACCEPTED.includes(file.type));
                        const compressed = await compressAll(valid);
                        const total = compressed.reduce((sum, file) => sum + file.size, 0);
                        if (compressed.some((file) => file.size > MAX_BYTES) || total > MAX_TOTAL) {
                          setPicked([]);
                          setPickError('الحجم الإجمالي كبير — أضف عدداً أقل من الصور أو صوراً أصغر.');
                          input.value = '';
                          setDirty(false);
                          return;
                        }
                        replaceInputFiles(input, compressed);
                        const skipped = files.length - compressed.length;
                        setPicked(compressed);
                        setPickError(
                          skipped ? `تم تجاهل ${skipped} ملفاً: الصيغة غير مدعومة.` : ''
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
