/**
 * Seeds real work photos into the sector galleries (settings key: sector_gallery).
 * Only fills sectors that do not already have a gallery, so admin edits are never overwritten.
 * Usage: node scripts/seed-galleries.mjs [--remote]
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();

const galleries = {
  'sec-contracting': [
    '/media/projects/p1.webp',
    '/media/projects/p2.webp',
    '/media/projects/p3.webp',
    '/media/projects/p4.webp',
    '/media/projects/p5.webp',
    '/media/projects/p6.webp',
    '/media/projects/p8.webp',
    '/media/projects/p10.webp',
    '/media/projects/p11.webp',
    '/media/projects/p12.webp',
  ],
  'sec-roads': ['/media/projects/p7.webp', '/media/projects/p9.webp'],
  'sec-realestate': [
    '/media/news/n6.webp',
    '/media/news/n8.webp',
    '/media/news/n9.webp',
    '/media/news/n11.webp',
    '/media/news/n12.webp',
    '/media/news/n13.webp',
    '/media/news/n19.webp',
    '/media/news/n23.webp',
  ],
  'sec-school': ['/media/news/n24.webp', '/media/news/n18.webp', '/media/news/n4.webp', '/media/news/n5.webp'],
  'sec-trade': ['/media/news/n16.webp', '/media/news/n17.webp', '/media/news/n3.webp'],
};

if (!process.argv.includes('--remote')) {
  console.log(JSON.stringify(galleries, null, 2));
  process.exit(0);
}

const env = Object.fromEntries(
  (await fs.readFile(path.join(root, '.env.local'), 'utf8'))
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2].replace(/^["']|["']$/g, '')])
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase credentials missing from .env.local');

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: rows, error } = await supabase.from('settings').select('*').eq('key', 'sector_gallery');
if (error) throw new Error(`settings: ${error.message}`);

const existing = rows?.[0];
let current = {};
if (existing?.value) {
  try {
    const parsed = JSON.parse(existing.value);
    if (parsed && typeof parsed === 'object') current = parsed;
  } catch {
    current = {};
  }
}

let added = 0;
for (const [sectorId, images] of Object.entries(galleries)) {
  if (Array.isArray(current[sectorId]) && current[sectorId].length) continue;
  current[sectorId] = images;
  added += 1;
}

const value = JSON.stringify(current);
if (existing) {
  const { error: updateError } = await supabase.from('settings').update({ value }).eq('id', existing.id);
  if (updateError) throw new Error(`update: ${updateError.message}`);
} else {
  const { error: insertError } = await supabase
    .from('settings')
    .insert({ id: crypto.randomUUID(), key: 'sector_gallery', value, updated_at: new Date().toISOString() });
  if (insertError) throw new Error(`insert: ${insertError.message}`);
}

console.log(`sector galleries synced: ${Object.keys(current).length} sectors (${added} filled now)`);
