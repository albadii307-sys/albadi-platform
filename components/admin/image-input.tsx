'use client';

import { useRef, useState } from 'react';
import { ImageIcon } from '@/components/icons';
import { compressImage, replaceInputFiles } from '@/lib/compress-image';

const MAX_BYTES = 3.5 * 1024 * 1024;
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
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              if (!ACCEPTED.includes(file.type)) {
                setError('صيغة غير مدعومة — استخدم JPG أو PNG أو WebP أو SVG.');
                input.value = '';
                return;
              }
              setError('');
              const prepared = await compressImage(file);
              if (prepared.size > MAX_BYTES) {
                setError('حجم الصورة كبير جداً حتى بعد الضغط — جرّب صورة أصغر.');
                input.value = '';
                return;
              }
              replaceInputFiles(input, [prepared]);
              setPreview(URL.createObjectURL(prepared));
            }}
          />
        </div>
      </div>
      {error ? <span className="field-error">{error}</span> : null}
      {help ? <span className="help">{help}</span> : null}
    </div>
  );
}
