'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const tooLarge = /body exceeded|too large|413/i.test(error.message ?? '');

  return (
    <>
      <div className="admin-topbar">
        <h1>تعذّر تنفيذ العملية</h1>
      </div>
      <div className="admin-content">
        <div className="alert-admin">
          <b>لم يتم حفظ التغييرات.</b>{' '}
          {tooLarge ? (
            <>حجم البيانات المرسلة أكبر من الحد المسموح. جرّب صورة أصغر (حتى 3.5 ميجابايت) أو أعد المحاولة بعد تحديث الصفحة.</>
          ) : (
            <>أعد المحاولة بعد تحديث الصفحة. إذا تكرر الخطأ، أرسل رقم المرجع للمطوّر.</>
          )}{' '}
          <Link href="/admin/settings">إعدادات الشركة</Link>
          {error.digest ? <div className="row-sub" style={{ marginTop: 8 }}>رقم المرجع: {error.digest}</div> : null}
        </div>
        <button type="button" className="a-btn primary" onClick={reset} style={{ marginTop: 14 }}>
          رجوع
        </button>
      </div>
    </>
  );
}
