'use server';

import { insert, count } from '@/lib/db';
import type { ServiceRequest } from '@/lib/types';

export type ContactState = { status: 'idle' | 'success' | 'error'; message?: string; errors?: Record<string, string> };

export async function submitContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const locale = formData.get('locale') === 'en' ? 'en' : 'ar';
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  const honeypot = String(formData.get('website') ?? '').trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = locale === 'ar' ? 'يرجى إدخال الاسم.' : 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = locale === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email.';
  if (!message.trim()) errors.message = locale === 'ar' ? 'يرجى كتابة رسالتك.' : 'Please write your message.';

  if (honeypot) return { status: 'success' };
  if (Object.keys(errors).length) return { status: 'error', errors };

  const total = await count('requests');
  const year = new Date().getFullYear();
  const ref = `MSG-${year}-${String(total + 1).padStart(4, '0')}`;

  await insert<ServiceRequest>('requests', {
    ref,
    service_id: null,
    sector_id: null,
    service_name: locale === 'ar' ? 'رسالة من صفحة التواصل' : 'Contact page message',
    name,
    company: null,
    phone: phone || '—',
    email,
    message,
    attachment_url: null,
    status: 'new',
    assignee: null,
    notes: null,
    locale,
  });

  return { status: 'success' };
}
