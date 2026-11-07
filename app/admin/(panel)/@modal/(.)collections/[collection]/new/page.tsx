import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import { getRelationOptions } from '@/lib/admin-data';
import CollectionForm from '@/components/admin/collection-form';
import ModalShell from '@/components/admin/modal-shell';

export default async function InterceptedNewCollectionItem({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: key } = await params;
  const collection = collections[key];
  if (!collection) notFound();
  const relations = await getRelationOptions();

  return (
    <ModalShell path={`/admin/collections/${collection.key}/new`}>
      <CollectionForm collection={collection} relations={relations} afterSave={`/admin/collections/${collection.key}`} />
    </ModalShell>
  );
}
