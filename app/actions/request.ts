'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { insert, count } from '@/lib/db';
import { getOne } from '@/lib/db';
import type { Service, ServiceRequest } from '@/lib/types';

export type RequestState = {
  status: 'idle' | 'success' | 'error';
  ref?: string;
  message?: string;
  errors?: Record<string, string>;
};

const MAX_FILE = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export async function submitServiceRequest(
  _prev: RequestState,
  formData: FormData
): Promise<RequestState> {
  const locale = formData.get('locale') === 'en' ? 'en' : 'ar';
  const name = String(formData.get('name') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  const serviceId = String(formData.get('service') ?? '').trim();
  const honeypot = String(formData.get('website') ?? '').trim();

  const errors: Record<string, string> = {};
  const msg =
    locale === 'ar'
      ? {
          name: 'يرجى إدخال الاسم الكامل.',
          phone: 'يرجى إدخال رقم هاتف صحيح.',
          email: 'يرجى إدخال بريد إلكتروني صحيح.',
          service: 'يرجى اختيار الخدمة.',
          file: 'نوع الملف غير مدعوم أو الحجم أكبر من 5 ميجابايت.',
          generic: 'تعذّر إرسال الطلب، يرجى المحاولة مرة أخرى.',
        }
      : {
          name: 'Please enter your full name.',
          phone: 'Please enter a valid phone number.',
          email: 'Please enter a valid email address.',
          service: 'Please choose a service.',
          file: 'Unsupported file type or file larger than 5 MB.',
          generic: 'Could not send the request. Please try again.',
        };

  if (name.length < 2) errors.name = msg.name;
  if (!/^[+\d][\d\s()-]{6,19}$/.test(phone)) errors.phone = msg.phone;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = msg.email;

  const service = serviceId ? await getOne<Service>('services', { id: serviceId }) : null;
  if (!service) errors.service = msg.service;

  if (honeypot) return { status: 'success', ref: '' };

  const file = formData.get('attachment');
  let attachmentUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED.has(file.type) || file.size > MAX_FILE) {
      errors.attachment = msg.file;
    } else {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const dir = path.join(process.cwd(), 'public', 'uploads', 'requests');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
      attachmentUrl = `/uploads/requests/${fileName}`;
    }
  }

  if (Object.keys(errors).length) {
    return { status: 'error', message: msg.generic, errors };
  }

  const total = await count('requests');
  const year = new Date().getFullYear();
  const ref = `AB-${year}-${String(total + 1).padStart(4, '0')}`;

  const record: ServiceRequest = await insert<ServiceRequest>('requests', {
    ref,
    service_id: service!.id,
    sector_id: service!.sector_id,
    service_name: service!.name_ar,
    name,
    company: company || null,
    phone,
    email,
    message: message || null,
    attachment_url: attachmentUrl,
    status: 'new',
    assignee: null,
    notes: null,
    locale,
  });

  await notifyTeam(record, service!).catch(() => undefined);
  revalidatePath('/admin');
  revalidatePath('/admin/requests');

  return { status: 'success', ref: record.ref };
}

async function notifyTeam(request: ServiceRequest, service: Service) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.REQUESTS_NOTIFY_EMAIL ?? 'albadi@albadigroup.com';
  const from = process.env.EMAIL_FROM ?? 'Al-Badi Website <noreply@albadigroup.com>';
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const rows = [
    ['رقم الطلب', request.ref],
    ['الخدمة', service.name_ar],
    ['الاسم', request.name],
    ['الشركة', request.company ?? '—'],
    ['الهاتف', request.phone],
    ['البريد', request.email],
    ['التفاصيل', request.message ?? '—'],
  ];

  const html = `
    <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right">
      <h2 style="color:#0f4a2c">طلب خدمة جديد</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:8px 12px;background:#f7f3ec;font-weight:bold;width:120px">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${String(value)}</td></tr>`
          )
          .join('')}
      </table>
      <p><a href="${appUrl}/admin/requests" style="color:#e2601f">فتح لوحة الطلبات</a></p>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `طلب خدمة جديد ${request.ref} — ${service.name_ar}`,
      html,
    }),
  });
}
