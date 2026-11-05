import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/login-form';
import { getSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/db';

export const metadata = { title: 'تسجيل الدخول | لوحة التحكم' };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/admin');

  return (
    <div className="login-page">
      <LoginForm demo={!isSupabaseConfigured} />
    </div>
  );
}
