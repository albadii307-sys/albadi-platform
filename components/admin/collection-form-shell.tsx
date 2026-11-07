'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SaveState } from '@/app/admin/actions';

export default function CollectionFormShell({
  action,
  children,
}: {
  action: (prev: SaveState, formData: FormData) => Promise<SaveState>;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) router.replace(state.redirectTo);
  }, [state, router]);

  return <form action={formAction} className="a-form">{children}</form>;
}
