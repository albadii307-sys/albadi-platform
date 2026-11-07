'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ModalShell({ path, children }: { path?: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = !path || pathname === path;

  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') router.back();
    };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = '';
    };
  }, [router, active]);

  if (!active) return null;

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
        {children}
      </div>
    </div>
  );
}
