import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import { getRelationOptions } from '@/lib/admin-data';
import CollectionForm from '@/components/admin/collection-form';

export default async function NewCollectionItemPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: key } = await params;
  const collection = collections[key];
  if (!collection) notFound();
  const relations = await getRelationOptions();

  return (
    <>
      <div className="admin-topbar">
        <h1>{collection.label}</h1>
        <span className="crumb">إضافة {collection.singular}</span>
      </div>
      <div className="admin-content">
        <CollectionForm collection={collection} relations={relations} />
      </div>
    </>
  );
}
