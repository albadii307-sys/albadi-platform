import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import { list } from '@/lib/db';
import { getAllSectors, getCompanies } from '@/lib/queries';
import { Plus } from '@/components/icons';
import CollectionTable, { type AdminTableRow } from '@/components/admin/collection-table';
import { deleteCollectionItem } from '@/app/admin/actions';

type Params = { params: Promise<{ collection: string }>; searchParams: Promise<{ saved?: string }> };

const hiddenColumns = new Set(['id', 'created_at', 'updated_at', 'body_ar', 'body_en', 'is_published']);
const imageKeys = ['cover_url', 'hero_url', 'logo_url', 'image_url', 'photo_url'];

export default async function CollectionListPage({ params, searchParams }: Params) {
  const { collection: key } = await params;
  const { saved } = await searchParams;
  const collection = collections[key];
  if (!collection) notFound();

  const order = collection.listFields.includes('published_at')
    ? { column: 'published_at', ascending: false }
    : collection.fields.some((field) => field.name === 'sort_order')
      ? { column: 'sort_order', ascending: true }
      : { column: collection.titleField, ascending: true };
  const rows = await list<Record<string, unknown>>(collection.table, { order });

  const relations: Record<string, { id: string; label: string }[]> = {};
  if (collection.fields.some((field) => field.relation === 'sectors')) {
    relations.sectors = (await getAllSectors()).map((s) => ({ id: s.id, label: s.name_ar }));
  }
  if (collection.fields.some((field) => field.relation === 'companies')) {
    relations.companies = (await getCompanies()).map((c) => ({ id: c.id, label: c.name_ar }));
  }

  const columns = collection.fields
    .filter((field) => collection.listFields.includes(field.name) && !hiddenColumns.has(field.name))
    .slice(0, 4);

  const display = (row: Record<string, unknown>, fieldName: string) => {
    const field = collection.fields.find((f) => f.name === fieldName);
    const value = row[fieldName];
    if (field?.type === 'boolean') return value ? 'نعم' : 'لا';
    if (field?.type === 'relation') {
      const options = relations[field.relation ?? ''] ?? [];
      return options.find((o) => o.id === value)?.label ?? '—';
    }
    if (field?.type === 'select') return field.options?.find((o) => o.value === value)?.label ?? String(value ?? '');
    if (fieldName === 'published_at' && value) {
      return new Intl.DateTimeFormat('ar-OM-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(String(value))
      );
    }
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  };

  const tableRows: AdminTableRow[] = rows.map((row) => {
    const image = imageKeys
      .map((imageKey) => row[imageKey])
      .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
    return {
      id: String(row.id),
      title: String(row[collection.titleField] ?? '—'),
      cells: columns.map((field) => display(row, field.name)),
      image: image ?? null,
      published: row.is_published !== false,
      editHref: `/admin/collections/${key}/${row.id}`,
      deleteAction: deleteCollectionItem.bind(null, key, String(row.id)),
    };
  });

  return (
    <>
      <div className="admin-topbar">
        <span className="crumb">المحتوى / {collection.label}</span>
        <span className="crumb">
          {rows.length} عنصر · {tableRows.filter((row) => !row.published).length} مخفي
        </span>
      </div>
      <div className="admin-content">
        <div className="admin-head">
          <div>
            <h2 className="page-title">{collection.label}</h2>
            {collection.description ? <p className="page-sub">{collection.description}</p> : null}
          </div>
          <Link href={`/admin/collections/${key}/new`} className="a-btn primary">
            <Plus size={15} /> إضافة {collection.singular}
          </Link>
        </div>

        {saved ? (
          <div className="alert-admin success" role="status" data-saved={saved}>
            {saved === 'new' ? `تمت إضافة ${collection.singular} بنجاح.` : 'تم حفظ التعديل بنجاح.'}
          </div>
        ) : null}

        <CollectionTable
          rows={tableRows}
          columns={columns.map((field) => field.label)}
          singular={collection.singular}
          showThumbs={imageKeys.some((imageKey) => collection.fields.some((field) => field.name === imageKey))}
          createHref={`/admin/collections/${key}/new`}
        />
      </div>
    </>
  );
}
