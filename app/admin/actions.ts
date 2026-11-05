'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getOne, insert, remove, update } from '@/lib/db';
import { collections } from '@/lib/collections';
import { login, logout, requireSession } from '@/lib/auth';
import { saveUpload } from '@/lib/uploads';
import { defaultTimeline, defaultWhy } from '@/lib/site-settings';
import type { Setting } from '@/lib/types';

export type LoginState = { error?: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const result = await login(email, password);
  if (!result.ok) return { error: result.error };
  redirect('/admin');
}

export async function logoutAction() {
  await logout();
  redirect('/admin/login');
}

export async function saveCollectionItem(collectionKey: string, id: string | null, formData: FormData) {
  await requireSession();
  const collection = collections[collectionKey];
  if (!collection) redirect('/admin');

  const values: Record<string, unknown> = {};

  for (const field of collection.fields) {
    if (field.type === 'image') {
      const file = formData.get(`${field.name}_file`);
      const url = String(formData.get(field.name) ?? '').trim();
      if (file instanceof File && file.size > 0) {
        const uploaded = await saveUpload(file, collectionKey);
        if (uploaded) values[field.name] = uploaded;
      } else {
        values[field.name] = url || null;
      }
      continue;
    }

    const raw = formData.get(field.name);
    if (field.type === 'boolean') {
      values[field.name] = raw === 'on' || raw === 'true';
    } else if (field.type === 'number') {
      const number = Number(raw);
      values[field.name] = raw !== '' && Number.isFinite(number) ? number : null;
    } else if (field.type === 'relation') {
      values[field.name] = raw ? String(raw) : null;
    } else {
      values[field.name] = raw ? String(raw).trim() : '';
    }
  }

  const nameSource = String(values[collection.titleField] ?? '');
  if ('slug' in values && !values.slug) {
    values.slug = slugify(String(values.name_en || values.title_en || nameSource)) || crypto.randomUUID().slice(0, 8);
  }
  if ('published_at' in values && values.published_at) {
    values.published_at = new Date(String(values.published_at)).toISOString();
  }

  if (id) {
    await update(collection.table, id, values);
  } else {
    await insert(collection.table, values);
  }

  revalidatePath('/', 'layout');
  revalidatePath(`/admin/collections/${collectionKey}`);
  redirect(`/admin/collections/${collectionKey}`);
}

export async function deleteCollectionItem(collectionKey: string, id: string) {
  await requireSession();
  const collection = collections[collectionKey];
  if (!collection) redirect('/admin');
  await remove(collection.table, id);
  revalidatePath('/', 'layout');
  revalidatePath(`/admin/collections/${collectionKey}`);
}

export async function updateRequest(id: string, formData: FormData) {
  await requireSession();
  const status = String(formData.get('status') ?? 'new');
  const notes = String(formData.get('notes') ?? '');
  const assignee = String(formData.get('assignee') ?? '');
  await update('requests', id, { status, notes: notes || null, assignee: assignee || null });
  revalidatePath('/admin/requests');
  revalidatePath(`/admin/requests/${id}`);
}

export async function uploadMedia(formData: FormData) {
  await requireSession();
  const file = formData.get('file');
  const title = String(formData.get('title') ?? '').trim();
  if (file instanceof File && file.size > 0) {
    const url = await saveUpload(file, 'media');
    if (url) {
      await insert('media', {
        title: title || file.name,
        url,
        kind: file.type === 'application/pdf' ? 'pdf' : 'image',
      });
    }
  }
  revalidatePath('/admin/media');
  revalidatePath('/media');
}

async function setSetting(key: string, value: string) {
  const existing = await getOne<Setting>('settings', { key });
  if (existing) {
    await update('settings', existing.id, { value });
  } else {
    await insert('settings', { key, value });
  }
}

function cleanRows(raw: unknown, fallback: Record<string, string>[]): Record<string, string>[] {
  if (!Array.isArray(raw)) return fallback;
  const rows = raw
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
    .map((row) =>
      Object.fromEntries(
        Object.entries(row)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => [key, String(value).trim()])
      )
    )
    .filter((row) => Object.values(row).some(Boolean));
  return rows.length ? rows : fallback;
}

export async function saveSiteContent(formData: FormData) {
  await requireSession();
  const text = (key: string) => String(formData.get(key) ?? '').trim();

  const reset = formData.get('reset_logo') === 'on';
  const url = text('logo_url');
  const file = formData.get('logo_file');

  let logo = '/media/brand/logo.png';
  if (!reset) {
    logo = url || '/media/brand/logo.png';
    if (file instanceof File && file.size > 0) {
      const uploaded = await saveUpload(file, 'brand');
      if (uploaded) logo = uploaded;
    }
  }

  const plainKeys = [
    'brand_name_ar',
    'brand_name_en',
    'brand_tagline_ar',
    'brand_tagline_en',
    'contact_phone',
    'contact_fax',
    'contact_email',
    'contact_address_ar',
    'contact_address_en',
    'contact_hours_ar',
    'contact_hours_en',
    'social_instagram',
    'social_x',
    'social_linkedin',
    'social_facebook',
    'social_youtube',
    'social_whatsapp',
  ];

  await setSetting('logo_url', logo);
  for (const key of plainKeys) {
    await setSetting(key, text(key));
  }

  const parse = (field: string) => {
    try {
      return JSON.parse(String(formData.get(field) ?? '[]'));
    } catch {
      return [];
    }
  };

  await setSetting('why_cards', JSON.stringify(cleanRows(parse('why_json'), defaultWhy)));
  await setSetting('timeline', JSON.stringify(cleanRows(parse('timeline_json'), defaultTimeline)));

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
  redirect('/admin/settings?saved=1');
}
