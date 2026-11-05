import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import { getById } from '@/lib/db';
import { getRelationOptions } from '@/lib/admin-data';
import CollectionForm from '@/components/admin/collection-form';

export default async function EditCollectionItemPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: key, id } = await params;
  const collection = collections[key];
  if (!collection) notFound();
  const row = await getById<Record<string, unknown>>(collection.table, id);
  if (!row) notFound();
  const relations = await getRelationOptions();

  return (
    <>
      <div className="admin-topbar">
        <h1>{collection.label}</h1>
        <span className="crumb">تعديل</span>
      </div>
      <div className="admin-content">
        <CollectionForm collection={collection} row={row} relations={relations} />
      </div>
    </>
  );
}
