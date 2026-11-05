import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from './db';

const COOKIE = 'albadi_admin';
const MAX_AGE = 60 * 60 * 8;
const SECRET = process.env.AUTH_SECRET ?? 'dev-only-secret-change-me';

export type Role = 'admin' | 'editor' | 'requests';
export type Session = { email: string; role: Role; exp: number };

function sign(payload: string) {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

function encode(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(value: string): Session | null {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  if (isSupabaseConfigured) {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { ok: false as const, error: 'بيانات الدخول غير صحيحة' };

    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    const role: Role = (profile?.role as Role) ?? 'editor';
    await setSession({ email: data.user.email ?? email, role, exp: Date.now() + MAX_AGE * 1000 });
    return { ok: true as const };
  }

  const expectedEmail = process.env.ADMIN_EMAIL ?? 'admin@albadigroup.com';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedPassword) {
    return { ok: false as const, error: 'لم تُضبط بيانات دخول المدير على الخادم' };
  }
  const emailOk = email.trim().toLowerCase() === expectedEmail.toLowerCase();
  if (!emailOk || password !== expectedPassword) {
    return { ok: false as const, error: 'بيانات الدخول غير صحيحة' };
  }
  await setSession({ email: expectedEmail, role: 'admin', exp: Date.now() + MAX_AGE * 1000 });
  return { ok: true as const };
}

async function setSession(session: Session) {
  const store = await cookies();
  store.set(COOKIE, encode(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function logout() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  return value ? decode(value) : null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
