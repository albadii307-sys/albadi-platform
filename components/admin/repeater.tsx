'use client';

import { useState } from 'react';
import { Plus, Trash } from '@/components/icons';

type Field = {
  name: string;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  wide?: boolean;
};

type Row = Record<string, string>;

export default function Repeater({
  name,
  initial,
  fields,
  addLabel,
}: {
  name: string;
  initial: Row[];
  fields: Field[];
  addLabel: string;
}) {
  const blank: Row = Object.fromEntries(fields.map((field) => [field.name, field.options?.[0]?.value ?? '']));
  const [rows, setRows] = useState<Row[]>(initial.length ? initial : [blank]);

  const update = (index: number, key: string, value: string) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  return (
    <div className="rep">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />

      <div className="rep-list">
        {rows.map((row, index) => (
          <div className="rep-row" key={index}>
            <div className="rep-grid">
              {fields.map((field) => (
                <label key={field.name} className={field.wide ? 'is-wide' : undefined}>
                  <span>{field.label}</span>
                  {field.options ? (
                    <select value={row[field.name] ?? ''} onChange={(event) => update(index, field.name, event.target.value)}>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={row[field.name] ?? ''}
                      placeholder={field.placeholder}
                      onChange={(event) => update(index, field.name, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
            <button
              type="button"
              className="rep-del"
              aria-label="حذف السطر"
              onClick={() => setRows((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current))}
            >
              <Trash size={15} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="rep-add" onClick={() => setRows((current) => [...current, { ...blank }])}>
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}
