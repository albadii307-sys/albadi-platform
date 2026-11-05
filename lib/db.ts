import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import seed from './seed.json';

export type Query = {
  where?: Record<string, string | number | boolean | null>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
};

type Row = Record<string, unknown> & { id: string };
type LocalDb = Record<string, Row[]>;

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

let admin: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (!admin) {
    admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return admin;
}

const tableDefaults: Record<string, string> = {
  sectors: 'sort_order',
  companies: 'sort_order',
  services: 'sort_order',
  projects: 'sort_order',
  news: 'published_at',
  requests: 'created_at',
  settings: 'key',
  team: 'sort_order',
};

async function readLocal(): Promise<LocalDb> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const db = JSON.parse(raw) as LocalDb;
    let changed = false;
    for (const [table, rows] of Object.entries(seed as LocalDb)) {
      if (!db[table]) {
        db[table] = JSON.parse(JSON.stringify(rows)) as Row[];
        changed = true;
      }
    }
    if (changed) await writeLocal(db).catch(() => undefined);
    return db;
  } catch {
    const initial = JSON.parse(JSON.stringify(seed)) as LocalDb;
    await writeLocal(initial).catch(() => undefined);
    return initial;
  }
}

async function writeLocal(db: LocalDb) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch {
    throw new Error('التخزين المحلي غير قابل للكتابة على هذا الخادم — اربط Supabase لتعديل المحتوى');
  }
}

function matches(row: Row, where?: Query['where']) {
  if (!where) return true;
  return Object.entries(where).every(([key, value]) => row[key] === value);
}

export async function list<T>(table: string, query: Query = {}): Promise<T[]> {
  if (isSupabaseConfigured) {
    let q = supabase().from(table).select('*');
    for (const [key, value] of Object.entries(query.where ?? {})) {
      q = value === null ? q.is(key, null) : q.eq(key, value);
    }
    const order = query.order ?? { column: tableDefaults[table] ?? 'created_at', ascending: false };
    q = q.order(order.column, { ascending: order.ascending ?? false });
    if (query.limit) q = q.limit(query.limit);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data ?? []) as T[];
  }

  const db = await readLocal();
  const rows = (db[table] ?? []).filter((row) => matches(row, query.where));
  const order = query.order ?? { column: tableDefaults[table] ?? 'created_at', ascending: false };
  rows.sort((a, b) => {
    const av = a[order.column];
    const bv = b[order.column];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    const result = av > bv ? 1 : -1;
    return order.ascending ? result : -result;
  });
  return (query.limit ? rows.slice(0, query.limit) : rows) as T[];
}

export async function getById<T>(table: string, id: string): Promise<T | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase().from(table).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data as T) ?? null;
  }
  const db = await readLocal();
  return ((db[table] ?? []).find((row) => row.id === id) as T) ?? null;
}

export async function getOne<T>(table: string, where: Query['where']): Promise<T | null> {
  const rows = await list<T>(table, { where, limit: 1 });
  return rows[0] ?? null;
}

export async function insert<T>(table: string, values: Record<string, unknown>): Promise<T> {
  const now = new Date().toISOString();
  const row = {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    ...values,
  };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase().from(table).insert(row).select().single();
    if (error) throw new Error(`${table}: ${error.message}`);
    return data as T;
  }
  const db = await readLocal();
  db[table] = [row, ...(db[table] ?? [])];
  await writeLocal(db);
  return row as T;
}

export async function update<T>(table: string, id: string, values: Record<string, unknown>): Promise<T> {
  const patch = { ...values, updated_at: new Date().toISOString() };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase().from(table).update(patch).eq('id', id).select().single();
    if (error) throw new Error(`${table}: ${error.message}`);
    return data as T;
  }
  const db = await readLocal();
  const rows = db[table] ?? [];
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) throw new Error(`${table}: row not found`);
  rows[index] = { ...rows[index], ...patch };
  await writeLocal(db);
  return rows[index] as T;
}

export async function remove(table: string, id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase().from(table).delete().eq('id', id);
    if (error) throw new Error(`${table}: ${error.message}`);
    return;
  }
  const db = await readLocal();
  db[table] = (db[table] ?? []).filter((row) => row.id !== id);
  await writeLocal(db);
}

export async function count(table: string, where?: Query['where']): Promise<number> {
  const rows = await list(table, { where });
  return rows.length;
}
