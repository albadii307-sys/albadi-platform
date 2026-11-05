'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { X } from '@/components/icons';

export default function ModalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') router.back();
    };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = '';
    };
  }, [router]);

  return (
    <div
      className="a-modal is-page"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) router.back();
      }}
    >
      <div className="a-modal-card wide">
        <button type="button" className="a-modal-float-close" onClick={() => router.back()} aria-label="إغلاق النافذة">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
