import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './db';

const BUCKET = 'media';
const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']);

export async function saveUpload(file: File, folder: string, maxSize = MAX_SIZE): Promise<string | null> {
  if (!ALLOWED.has(file.type) || file.size > maxSize) return null;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const name = `${crypto.randomUUID()}.${ext}`;
  const key = `${folder}/${name}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured) {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { error } = await client.storage.from(BUCKET).upload(key, body, { contentType: file.type });
    if (error) throw new Error(`storage: ${error.message}`);
    return client.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), body);
  return `/uploads/${key}`;
}
