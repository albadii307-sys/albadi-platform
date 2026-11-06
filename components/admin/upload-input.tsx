'use client';

import { useState } from 'react';
import { compressImage, replaceInputFiles } from '@/lib/compress-image';

const MB = 1024 * 1024;

export default function UploadInput({
  id,
  name,
  accept,
  types,
  maxBytes = 3.5 * MB,
  required,
}: {
  id: string;
  name: string;
  accept: string;
  types?: string[];
  maxBytes?: number;
  required?: boolean;
}) {
  const [error, setError] = useState('');

  return (
    <>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={async (event) => {
          const input = event.currentTarget;
          const files = Array.from(input.files ?? []);
          if (!files.length) return;

          const prepared: File[] = [];
          for (const file of files) {
            const output = await compressImage(file);
            if (types && !types.includes(output.type)) {
              setError('صيغة غير مدعومة — استخدم الصور المدعومة أو ملف PDF.');
              input.value = '';
              return;
            }
            if (output.size > maxBytes) {
              setError('حجم الملف كبير جداً — الحد الأقصى 3.5 ميجابايت بعد الضغط.');
              input.value = '';
              return;
            }
            prepared.push(output);
          }

          replaceInputFiles(input, prepared);
          setError('');
        }}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </>
  );
}
