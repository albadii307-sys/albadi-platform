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

      <div className="panel">
        {visible.length ? (
          <table className="a-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  {columns.map((column, index) =>
                    index === 0 ? (
                      <td key={column} className="row-title">
                        <div className="row-lead">
                          {showThumbs ? (
                            row.image ? (
                              <span className="thumb">
                                <img src={row.image} alt="" loading="lazy" />
                              </span>
                            ) : (
                              <span className="thumb is-empty" aria-hidden="true">
                                <ImageIcon size={16} />
                              </span>
                            )
                          ) : null}
                          <span className="row-lead-text">{row.title}</span>
                        </div>
                      </td>
                    ) : (
                      <td key={column}>{row.cells[index]}</td>
                    )
                  )}
                  <td>
                    <span className={`badge ${row.published ? 'live' : 'hidden'}`}>
                      {row.published ? 'منشور' : 'مخفي'}
                    </span>
                  </td>
                  <td>
                    <div className="a-actions">
                      <Link href={row.editHref} className="icon-btn" aria-label="تعديل">
                        <Edit size={15} />
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            {rows.length ? 'لا نتائج مطابقة للبحث أو التصفية.' : (
              <>
                لا توجد عناصر بعد.{' '}
                <Link href={createHref} style={{ textDecoration: 'underline' }}>
                  أضف {singular}
                </Link>
                .
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
