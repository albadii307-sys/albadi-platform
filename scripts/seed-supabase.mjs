import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const file = path.join(root, '.env.local');
  let raw = '';
  try {
    raw = readFileSync(file, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
}

const ORDER = ['sectors', 'companies', 'services', 'projects', 'news', 'pages', 'media', 'team', 'settings'];

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const seed = JSON.parse(readFileSync(path.join(root, 'lib', 'seed.json'), 'utf8'));
const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

let failed = false;
for (const table of ORDER) {
  const rows = seed[table] ?? [];
  if (!rows.length) {
    console.log(`${table}: no rows, skipped`);
    continue;
  }
  const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    failed = true;
    console.error(`${table}: ${error.message}`);
  } else {
    console.log(`${table}: ${rows.length} rows upserted`);
  }
}

process.exit(failed ? 1 : 0);
