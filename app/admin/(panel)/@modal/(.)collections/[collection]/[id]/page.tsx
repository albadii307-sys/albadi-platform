import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import { getById } from '@/lib/db';
import { getRelationOptions } from '@/lib/admin-data';
import CollectionForm from '@/components/admin/collection-form';
import ModalShell from '@/components/admin/modal-shell';

export default async function InterceptedEditCollectionItem({
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
    <ModalShell>
      <CollectionForm
        collection={collection}
        row={row}
        relations={relations}
        afterSave={`/admin/collections/${collection.key}`}
      />
    </ModalShell>
  );
}
