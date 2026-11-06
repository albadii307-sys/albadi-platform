'use client';

import { useRef, useState } from 'react';
import { ImageIcon } from '@/components/icons';

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

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
  const [error, setError] = useState('');
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
            accept={ACCEPTED.join(',')}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (!ACCEPTED.includes(file.type)) {
                setError('صيغة غير مدعومة — استخدم JPG أو PNG أو WebP أو SVG.');
                event.target.value = '';
                return;
              }
              if (file.size > MAX_BYTES) {
                setError('حجم الملف أكبر من 8 ميجابايت — صغّره ثم أعد المحاولة.');
                event.target.value = '';
                return;
              }
              setError('');
              setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>
      {error ? <span className="field-error">{error}</span> : null}
      {help ? <span className="help">{help}</span> : null}
    </div>
  );
}
