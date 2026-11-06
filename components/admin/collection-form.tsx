import Link from 'next/link';
import type { Collection } from '@/lib/collections';
import { saveCollectionItem } from '@/app/admin/actions';
import { ArrowLeft, ArrowUpRight } from '@/components/icons';
import ImageInput from './image-input';
import RichEditor from './rich-editor';
import SubmitButton from './submit-button';

type Option = { id: string; label: string };

export default function CollectionForm({
  collection,
  row,
  relations,
  afterSave,
}: {
  collection: Collection;
  row?: Record<string, unknown>;
  relations: Record<string, Option[]>;
  afterSave?: string;
}) {
  const action = saveCollectionItem.bind(null, collection.key, row ? String(row.id) : null);
  const value = (name: string) => {
    const raw = row?.[name];
    if (raw === null || raw === undefined) return '';
    if (name === 'published_at' || name === 'created_at') return String(raw).slice(0, 10);
    return String(raw);
  };

  const publicSection: string | undefined = {
    sectors: 'sectors',
    companies: 'companies',
    projects: 'projects',
    news: 'news',
  }[collection.key];
  const previewHref =
    row && row.is_published && publicSection && row.slug
      ? `/ar/${publicSection}/${String(row.slug)}`
      : null;

  return (
    <form action={action} className="a-form">
      <div className="panel">
        <div className="panel-head">
          <h2>{row ? `تعديل: ${String(row[collection.titleField] ?? collection.singular)}` : `إضافة ${collection.singular}`}</h2>
          <div className="a-head-actions">
            {previewHref ? (
              <a href={previewHref} target="_blank" rel="noreferrer" className="a-btn ghost small">
                <ArrowUpRight size={14} /> عرض في الموقع
              </a>
            ) : null}
            <Link href={afterSave ?? `/admin/collections/${collection.key}`} className="a-btn">
              <ArrowLeft size={15} /> رجوع
            </Link>
          </div>
        </div>
        <div className="panel-body">
          <div className="a-grid">
            {collection.fields.map((field) => {
              if (field.type === 'boolean') {
                return (
                  <label className="a-check" key={field.name}>
                    <input type="checkbox" name={field.name} defaultChecked={row ? Boolean(row[field.name]) : true} />
                    {field.label}
                  </label>
                );
              }

              if (field.type === 'relation') {
                const options = relations[field.relation ?? ''] ?? [];
                return (
                  <div className="a-field" key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <select id={field.name} name={field.name} defaultValue={value(field.name)}>
                      <option value="">— بدون —</option>
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div className="a-field" key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <select id={field.name} name={field.name} defaultValue={value(field.name)}>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === 'image') {
                return (
                  <ImageInput
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    defaultValue={value(field.name)}
                    help={field.help}
                    full={field.full}
                  />
                );
              }

              if (field.type === 'richtext') {
                return (
                  <RichEditor
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    defaultValue={value(field.name)}
                    dir={field.name.endsWith('_en') ? 'ltr' : 'rtl'}
                    full={field.full}
                  />
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div className={`a-field ${field.full ? 'full' : ''}`} key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <textarea
                      id={field.name}
                      name={field.name}
                      defaultValue={value(field.name)}
                      required={field.required}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                );
              }

              return (
                <div className={`a-field ${field.full ? 'full' : ''}`} key={field.name}>
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    defaultValue={value(field.name)}
                    required={field.required}
                    placeholder={field.placeholder}
                    dir={['slug', 'website', 'external_url', 'published_at'].includes(field.name) ? 'ltr' : undefined}
                  />
                  {field.help ? <span className="help">{field.help}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="form-bar">
        <Link href={afterSave ?? `/admin/collections/${collection.key}`} className="a-btn">
          إلغاء
        </Link>
        <SubmitButton>حفظ</SubmitButton>
      </div>
    </form>
  );
}
