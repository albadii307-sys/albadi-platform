'use client';

import { useRef, useState } from 'react';
import { ImageIcon } from '@/components/icons';

export default function ImageInput({
  name,
  label,
  defaultValue,
  help,
  full,
}: {
  name: string;
  label: string;
  defaultValue: string;
  help?: string;
  full?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(defaultValue);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`a-field ${full ? 'full' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <div className="image-field">
        <span className="preview-wrap">
          {preview ? (
            <img src={preview} alt="" className="preview" />
          ) : (
            <span className="preview preview-empty" aria-hidden="true">
              <ImageIcon size={18} />
            </span>
          )}
        </span>
        <div className="col">
          <input
            id={name}
            name={name}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setPreview(event.target.value);
              if (fileRef.current) fileRef.current.value = '';
            }}
            placeholder="/media/... أو https://..."
            dir="ltr"
          />
          <input
            ref={fileRef}
            type="file"
            name={`${name}_file`}
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>
      {help ? <span className="help">{help}</span> : null}
    </div>
  );
}
