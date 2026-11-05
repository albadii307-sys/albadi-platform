'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, ImageIcon, Search, Trash, X } from '@/components/icons';

export type MediaRow = {
  id: string;
  title: string;
  url: string;
  kind: 'image' | 'pdf';
  date: string;
  deleteAction: () => Promise<void>;
};

const filters = [
  { key: 'all', label: 'الكل' },
  { key: 'image', label: 'صور' },
  { key: 'pdf', label: 'PDF' },
] as const;

export default function MediaLibrary({ items }: { items: MediaRow[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'pdf'>('all');
  const [active, setActive] = useState<MediaRow | null>(null);
  const [copied, setCopied] = useState(false);

  const counts = useMemo(
    () => ({
      all: items.length,
      image: items.filter((item) => item.kind === 'image').length,
      pdf: items.filter((item) => item.kind === 'pdf').length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
    });
  }, [items, query, filter]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const copy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="a-toolbar">
        <div className="a-search">
          <Search size={15} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم الملف أو الرابط…"
            aria-label="بحث في الوسائط"
          />
        </div>
        <div className="a-seg" role="group" aria-label="تصفية الوسائط">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={filter === item.key ? 'is-on' : undefined}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
              <span>{counts[item.key]}</span>
            </button>
          ))}
        </div>
        <span className="a-count">
          {visible.length} من {items.length}
        </span>
      </div>

      {visible.length ? (
        <div className="media-grid">
          {visible.map((item) => (
            <div className="media-card" key={item.id}>
              <button
                type="button"
                className="media-thumb"
                onClick={() => {
                  setCopied(false);
                  setActive(item);
                }}
                aria-label={`معاينة ${item.title}`}
              >
                {item.kind === 'image' ? (
                  <img src={item.url} alt={item.title} loading="lazy" />
                ) : (
                  <span className="media-pdf">
                    <FileText size={34} />
                    FILE
                  </span>
                )}
                <span className="media-zoom">{item.kind === 'image' ? 'معاينة' : 'عرض'}</span>
              </button>
              <div className="media-meta">
                <b title={item.title}>{item.title}</b>
                <span>
                  {item.kind === 'image' ? <ImageIcon size={12} /> : <Download size={12} />}
                  {item.kind === 'image' ? 'صورة' : 'PDF'} · {item.date}
                </span>
                <div className="media-actions">
                  <a href={item.url} target="_blank" rel="noreferrer" className="icon-btn" aria-label="فتح الملف">
                    <Download size={14} />
                  </a>
                  <form
                    action={item.deleteAction}
                    onSubmit={(event) => {
                      if (!window.confirm('حذف هذا الملف نهائياً؟')) event.preventDefault();
                    }}
                  >
                    <button type="submit" className="icon-btn danger" aria-label="حذف الملف">
                      <Trash size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel">
          <div className="empty-state">{items.length ? 'لا ملفات مطابقة للبحث أو التصفية.' : 'لا توجد ملفات مرفوعة.'}</div>
        </div>
      )}

      {active ? (
        <div className="a-lightbox" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => setActive(null)}>
          <div className="a-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="a-lightbox-x" onClick={() => setActive(null)} aria-label="إغلاق">
              <X size={18} />
            </button>
            <div className="a-lightbox-media">
              {active.kind === 'image' ? (
                <img src={active.url} alt={active.title} />
              ) : (
                <iframe src={active.url} title={active.title} />
              )}
            </div>
            <div className="a-lightbox-meta">
              <b>{active.title}</b>
              <code dir="ltr">{active.url}</code>
              <div className="a-lightbox-actions">
                <button type="button" className="a-btn primary" onClick={copy}>
                  {copied ? 'تم النسخ ✓' : 'نسخ الرابط'}
                </button>
                <a href={active.url} target="_blank" rel="noreferrer" className="a-btn">
                  فتح في نافذة جديدة
                </a>
                <a href={active.url} download className="a-btn">
                  تنزيل
                </a>
                <form
                  action={active.deleteAction}
                  onSubmit={(event) => {
                    if (!window.confirm('حذف هذا الملف نهائياً؟')) event.preventDefault();
                  }}
                >
                  <button type="submit" className="a-btn danger">
                    <Trash size={14} /> حذف
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
