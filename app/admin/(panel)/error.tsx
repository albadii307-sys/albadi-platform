'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="admin-topbar">
        <h1>تعذّر تنفيذ العملية</h1>
      </div>
      <div className="admin-content">
        <div className="alert-admin">
          <b>لم يتم حفظ التغييرات.</b> هذه النسخة المنشورة تعمل بوضع العرض فقط، وتحتاج ربط Supabase لتفعيل حفظ
          المحتوى واستقبال الطلبات. <Link href="/admin/settings">إعدادات الشركة</Link>
        </div>
        <button type="button" className="a-btn primary" onClick={reset} style={{ marginTop: 14 }}>
          رجوع
        </button>
      </div>
    </>
  );
}
