'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export default function SubmitButton({
  children,
  className = 'a-btn primary',
  pendingLabel = 'جارٍ الحفظ…',
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
