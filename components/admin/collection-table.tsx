'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit, ImageIcon, Search, Trash } from '@/components/icons';

export type AdminTableRow = {
  id: string;
  title: string;
  cells: string[];
  image: string | null;
  published: boolean;
  editHref: string;
  deleteAction: () => Promise<void>;
};

type Props = {
  rows: AdminTableRow[];
  columns: string[];
  singular: string;
  showThumbs: boolean;
  createHref: string;
};

type Filter = 'all' | 'live' | 'hidden';

export default function CollectionTable({ rows, columns, singular, showThumbs, createHref }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(
    () => ({
      all: rows.length,
      live: rows.filter((row) => row.published).length,
      hidden: rows.filter((row) => !row.published).length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'live' && !row.published) return false;
      if (filter === 'hidden' && row.published) return false;
      if (!q) return true;
      return row.title.toLowerCase().includes(q) || row.cells.some((cell) => cell.toLowerCase().includes(q));
    });
  }, [rows, query, filter]);

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'live', label: 'منشور' },
    { key: 'hidden', label: 'مخفي' },
  ];

  return (
    <>
      <div className="a-toolbar">
        <div className="a-search">
          <Search size={15} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`ابحث في ${singular}…`}
            aria-label={`بحث في ${singular}`}
          />
        </div>
        <div className="a-seg" role="group" aria-label="تصفية حسب الحالة">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={filter === tab.key ? 'is-on' : undefined}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span>{counts[tab.key]}</span>
            </button>
          ))}
        </div>
        <span className="a-count">
          {visible.length} من {rows.length}
        </span>
      </div>

      {visible.length ? (
        <div className="a-cardgrid">
          {visible.map((row) => (
            <article className={`a-card${row.published ? '' : ' is-hidden'}`} key={row.id}>
              {showThumbs ? (
                <Link href={row.editHref} className="a-card-media" aria-label={`تعديل ${row.title}`}>
                  {row.image ? (
                    <img src={row.image} alt="" loading="lazy" />
                  ) : (
                    <span className="a-card-media-empty" aria-hidden="true">
                      <ImageIcon size={26} />
                    </span>
                  )}
                </Link>
              ) : null}
              <div className="a-card-body">
                <div className="a-card-top">
                  <h3>
                    <Link href={row.editHref}>{row.title}</Link>
                  </h3>
                  <span className={`badge ${row.published ? 'live' : 'hidden'}`}>
                    {row.published ? 'منشور' : 'مخفي'}
                  </span>
                </div>
                {columns.length > 1 ? (
                  <dl className="a-card-meta">
                    {columns.slice(1).map((column, index) => (
                      <div key={column}>
                        <dt>{column}</dt>
                        <dd>{row.cells[index + 1] ?? '—'}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
              <div className="a-card-actions">
                <Link href={row.editHref} className="a-btn ghost small">
                  <Edit size={14} /> تعديل
                </Link>
                <form
                  action={row.deleteAction}
                  onSubmit={(event) => {
                    if (!window.confirm('حذف هذا العنصر نهائياً؟ لا يمكن التراجع.')) {
                      event.preventDefault();
                    }
                  }}
                >
                  <button type="submit" className="icon-btn danger" aria-label="حذف">
                    <Trash size={15} />
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <div className="empty-state">
            {rows.length ? (
              'لا نتائج مطابقة للبحث أو التصفية.'
            ) : (
              <>
                لا توجد عناصر بعد.{' '}
                <Link href={createHref} style={{ textDecoration: 'underline' }}>
                  أضف {singular}
                </Link>
                .
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
