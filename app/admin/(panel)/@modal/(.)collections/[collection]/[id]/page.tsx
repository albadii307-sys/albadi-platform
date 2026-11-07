import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import { getById } from '@/lib/db';
import { getRelationOptions } from '@/lib/admin-data';
import { getSiteSettings } from '@/lib/site-settings.server';
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
  const settings = collection.key === 'services' ? await getSiteSettings() : null;

  return (
    <ModalShell path={`/admin/collections/${collection.key}/${id}`}>
      <CollectionForm
        collection={collection}
        row={row}
        relations={relations}
        afterSave={`/admin/collections/${collection.key}`}
        iconName={settings?.serviceIcons[String(row.id)]}
      />
    </ModalShell>
  );
}
