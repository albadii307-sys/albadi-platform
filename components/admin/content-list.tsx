'use client';

import { useState } from 'react';
import { Award, Check, Compass, Layers, Leaf, Plus, Shield, Trash, Users, X } from '@/components/icons';
import SubmitButton from './submit-button';

type Row = Record<string, string>;

const ICONS = [
  { key: 'award', label: 'خبرة', Icon: Award },
  { key: 'layers', label: 'تنوّع', Icon: Layers },
  { key: 'users', label: 'كوادر', Icon: Users },
  { key: 'shield', label: 'جودة', Icon: Shield },
  { key: 'leaf', label: 'استدامة', Icon: Leaf },
  { key: 'compass', label: 'رؤية', Icon: Compass },
];

const iconFor = (key: string) => ICONS.find((item) => item.key === key)?.Icon ?? Award;

export type ContentKind = 'why' | 'timeline';

export default function ContentList({
  kind,
  rows,
  action,
  saved,
}: {
  kind: ContentKind;
  rows: Row[];
  action: (formData: FormData) => Promise<void>;
  saved: boolean;
}) {
  const [items, setItems] = useState<Row[]>(rows);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Row>({});
  const [dirty, setDirty] = useState(false);

  const empty: Row =
    kind === 'why'
      ? { icon: 'award', title_ar: '', title_en: '', text_ar: '', text_en: '' }
      : { year: '', title_ar: '', title_en: '', text_ar: '', text_en: '' };

  const startAdd = () => {
    setDraft({ ...empty });
    setIndex(null);
    setOpen(true);
  };

  const startEdit = (position: number) => {
    setDraft({ ...items[position] });
    setIndex(position);
    setOpen(true);
  };

  const commit = () => {
    setItems((current) => {
      if (index === null) return [...current, draft];
      return current.map((row, i) => (i === index ? draft : row));
    });
    setDirty(true);
    setOpen(false);
  };

  const drop = (position: number) => {
    setItems((current) => current.filter((_, i) => i !== position));
    setDirty(true);
  };

  const set = (key: string, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <>
      <div className="a-toolbar">
        <span className="a-count">{items.length} عنصر</span>
        <button type="button" className="a-btn primary" onClick={startAdd}>
          <Plus size={15} /> {kind === 'why' ? 'إضافة بطاقة' : 'إضافة محطة'}
        </button>
      </div>

      <div className="a-cardgrid">
        {items.map((row, position) => {
          const Icon = iconFor(row.icon);
          return (
            <article className="a-card" key={position}>
              <div className={`a-card-body ${kind === 'why' ? 'has-icon' : ''}`}>
                {kind === 'why' ? (
                  <span className="a-card-icon">
                    <Icon size={20} />
                  </span>
                ) : null}
                <span className="a-card-kicker">{kind === 'why' ? ICONS.find((i) => i.key === row.icon)?.label : row.year}</span>
                <h3 className="a-card-title">{row.title_ar}</h3>
                <p className="a-card-text">{row.text_ar}</p>
              </div>
              <div className="a-card-actions">
                <button type="button" className="a-btn ghost small" onClick={() => startEdit(position)}>
                  تعديل
                </button>
                <button type="button" className="icon-btn danger" aria-label="حذف" onClick={() => drop(position)}>
                  <Trash size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <form action={action} className="a-savebar">
        <input type="hidden" name="rows" value={JSON.stringify(items)} />
        {dirty ? (
          <span className="a-unsaved">تغييرات غير محفوظة — اضغط «حفظ التغييرات» لتطبيقها على الموقع.</span>
        ) : saved ? (
          <span className="a-saved">
            <Check size={14} /> تم الحفظ وظهرت التغييرات على الموقع
          </span>
        ) : (
          <span className="row-sub">احفظ بعد الإضافة أو التعديل أو الحذف.</span>
        )}
        <SubmitButton pendingLabel="جارٍ الحفظ…">حفظ التغييرات</SubmitButton>
      </form>

      {open ? (
        <div className="a-modal" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
          <div className="a-modal-card">
            <div className="a-modal-head">
              <h2 id="content-modal-title">{index === null ? 'إضافة عنصر' : 'تعديل العنصر'}</h2>
              <button type="button" className="a-modal-close" onClick={() => setOpen(false)} aria-label="إغلاق">
                <X size={18} />
              </button>
            </div>

            <div className="a-modal-body a-form">
              {kind === 'timeline' ? (
                <div className="a-field">
                  <label htmlFor="row-year">السنة</label>
                  <input id="row-year" value={draft.year ?? ''} onChange={(event) => set('year', event.target.value)} />
                </div>
              ) : (
                <div className="icon-picker">
                  <span className="icon-picker-label">اختر الأيقونة</span>
                  <div className="icon-picker-grid">
                    {ICONS.map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        className={draft.icon === key ? 'is-on' : undefined}
                        onClick={() => set('icon', key)}
                      >
                        <Icon size={20} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="a-grid-2">
                <div className="a-field">
                  <label htmlFor="row-title-ar">العنوان (عربي)</label>
                  <input id="row-title-ar" value={draft.title_ar ?? ''} onChange={(event) => set('title_ar', event.target.value)} />
                </div>
                <div className="a-field">
                  <label htmlFor="row-title-en">العنوان (إنجليزي)</label>
                  <input
                    id="row-title-en"
                    dir="ltr"
                    value={draft.title_en ?? ''}
                    onChange={(event) => set('title_en', event.target.value)}
                  />
                </div>
                <div className="a-field">
                  <label htmlFor="row-text-ar">الوصف (عربي)</label>
                  <textarea id="row-text-ar" rows={3} value={draft.text_ar ?? ''} onChange={(event) => set('text_ar', event.target.value)} />
                </div>
                <div className="a-field">
                  <label htmlFor="row-text-en">الوصف (إنجليزي)</label>
                  <textarea
                    id="row-text-en"
                    dir="ltr"
                    rows={3}
                    value={draft.text_en ?? ''}
                    onChange={(event) => set('text_en', event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="a-modal-foot">
              <button type="button" className="a-btn" onClick={() => setOpen(false)}>
                إلغاء
              </button>
              <button type="button" className="a-btn primary" onClick={commit}>
                <Check size={15} /> تأكيد
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
