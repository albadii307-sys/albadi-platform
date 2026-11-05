'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '@/app/admin/actions';

export default function LoginForm({ demo }: { demo: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form className="login-card" action={action}>
      <img src="/media/brand/logo.png" alt="مجموعة البادي" />
      <h1>لوحة التحكم</h1>
      <p>سجّل الدخول لإدارة محتوى الموقع وطلبات الخدمات.</p>

      {state?.error ? (
        <div className="alert alert-error" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="a-field">
        <label htmlFor="email">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" required autoComplete="username" dir="ltr" />
      </div>
      <div className="a-field">
        <label htmlFor="password">كلمة المرور</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" dir="ltr" />
      </div>

      <button type="submit" className="a-btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }} disabled={pending}>
        {pending ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
      </button>

      {demo ? (
        <div className="login-note">
          وضع المعاينة المحلي — بيانات الدخول مضبوطة في <b dir="ltr">.env.local</b> على الخادم.
          <br />
          عند ربط Supabase يتم التحقق من حسابات المستخدمين في قاعدة البيانات.
        </div>
      ) : null}
    </form>
  );
}
