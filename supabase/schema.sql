-- ═══════════════════════════════════════════════════════════════════════
--  مجموعة البادي — مخطط قاعدة البيانات (Supabase / Postgres)
--  نفّذ هذا الملف كاملاً من: Supabase Dashboard → SQL Editor → New query
--  بعد التنفيذ: املأ .env.local بمفاتيح المشروع ثم أعد تشغيل الموقع.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── دوال مساعدة ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── القطاعات ───────────────────────────────────────────────────────────
create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null default '',
  tagline_ar text,
  tagline_en text,
  summary_ar text,
  summary_en text,
  body_ar text,
  body_en text,
  hero_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── الشركات التابعة ────────────────────────────────────────────────────
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid references public.sectors(id) on delete set null,
  slug text not null unique,
  name_ar text not null,
  name_en text not null default '',
  description_ar text,
  description_en text,
  logo_url text,
  website text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── الخدمات (القابلة للطلب من الموقع) ──────────────────────────────────
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid references public.sectors(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  slug text not null unique,
  name_ar text not null,
  name_en text not null default '',
  summary_ar text,
  summary_en text,
  body_ar text,
  body_en text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  is_requestable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── المشاريع ───────────────────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null default '',
  client_ar text,
  client_en text,
  sector_id uuid references public.sectors(id) on delete set null,
  location_ar text,
  location_en text,
  year integer,
  cover_url text,
  body_ar text,
  body_en text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── الأخبار والتغطيات ──────────────────────────────────────────────────
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null default '',
  excerpt_ar text,
  excerpt_en text,
  body_ar text,
  body_en text,
  cover_url text,
  category text not null default 'group' check (category in ('group', 'csr', 'media')),
  published_at timestamptz not null default now(),
  external_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── الصفحات الثابتة (من نحن، الرؤية...) ────────────────────────────────
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title_ar text not null,
  title_en text not null default '',
  body_ar text,
  body_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── طلبات الخدمات والرسائل ─────────────────────────────────────────────
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  service_id uuid references public.services(id) on delete set null,
  sector_id uuid references public.sectors(id) on delete set null,
  service_name text,
  name text not null,
  company text,
  phone text not null,
  email text not null,
  message text,
  attachment_url text,
  status text not null default 'new' check (status in ('new', 'review', 'quoted', 'won', 'closed')),
  assignee text,
  notes text,
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── مكتبة الوسائط / الكتيبات ───────────────────────────────────────────
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  kind text not null default 'image' check (kind in ('image', 'pdf')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── مستخدمو لوحة التحكم ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor', 'requests')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── فريق العمل والقيادة ────────────────────────────────────────────────
create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null default '',
  role_ar text not null,
  role_en text not null default '',
  bio_ar text,
  bio_en text,
  photo_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── إعدادات الموقع (الشعار وغيره) ──────────────────────────────────────
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── مشغّلات updated_at ─────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array['sectors', 'companies', 'services', 'projects', 'news', 'pages', 'requests', 'media', 'profiles', 'team', 'settings']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ── فهارس ──────────────────────────────────────────────────────────────
create index if not exists idx_services_sector on public.services (sector_id);
create index if not exists idx_projects_sector on public.projects (sector_id);
create index if not exists idx_news_published on public.news (published_at desc);
create index if not exists idx_requests_status on public.requests (status, created_at desc);
create index if not exists idx_requests_created on public.requests (created_at desc);
create index if not exists idx_companies_sector on public.companies (sector_id);

-- ═══════════════════════════════════════════════════════════════════════
--  الصلاحيات و RLS
--  ملاحظة: التطبيق يستخدم service_role على الخادم (يتجاوز RLS)،
--  وهذه السياسات تحمي المفاتيح العامة إن استُخدم anon key مستقبلاً.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.current_staff_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_staff_role() in ('admin', 'editor'), false);
$$;

alter table public.sectors   enable row level security;
alter table public.companies enable row level security;
alter table public.services  enable row level security;
alter table public.projects  enable row level security;
alter table public.news     enable row level security;
alter table public.pages    enable row level security;
alter table public.requests enable row level security;
alter table public.media    enable row level security;
alter table public.profiles enable row level security;
alter table public.team     enable row level security;
alter table public.settings enable row level security;

-- قراءة عامة للمحتوى المنشور
drop policy if exists "public read sectors" on public.sectors;
create policy "public read sectors" on public.sectors
  for select using (is_published = true or public.is_staff());

drop policy if exists "public read companies" on public.companies;
create policy "public read companies" on public.companies
  for select using (is_published = true or public.is_staff());

drop policy if exists "public read services" on public.services;
create policy "public read services" on public.services
  for select using (is_published = true or public.is_staff());

drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects
  for select using (is_published = true or public.is_staff());

drop policy if exists "public read news" on public.news;
create policy "public read news" on public.news
  for select using (is_published = true or public.is_staff());

drop policy if exists "public read pages" on public.pages;
create policy "public read pages" on public.pages
  for select using (true);

drop policy if exists "public read media" on public.media;
create policy "public read media" on public.media
  for select using (true);

drop policy if exists "public read team" on public.team;
create policy "public read team" on public.team
  for select using (is_published = true or public.is_staff());

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings
  for select using (true);

-- كتابة المحتوى: admin / editor فقط
do $$
declare
  t text;
begin
  foreach t in array array['sectors', 'companies', 'services', 'projects', 'news', 'pages', 'media', 'team', 'settings']
  loop
    execute format('drop policy if exists "staff write %1$s" on public.%1$s', t);
    execute format(
      'create policy "staff write %1$s" on public.%1$s for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      t
    );
  end loop;
end;
$$;

-- الطلبات: إدخال عام (anon) — قراءة وتعديل للفريق فقط
drop policy if exists "anyone can submit request" on public.requests;
create policy "anyone can submit request" on public.requests
  for insert to anon, authenticated
  with check (true);

drop policy if exists "staff read requests" on public.requests;
create policy "staff read requests" on public.requests
  for select to authenticated
  using (public.current_staff_role() in ('admin', 'editor', 'requests'));

drop policy if exists "staff update requests" on public.requests;
create policy "staff update requests" on public.requests
  for update to authenticated
  using (public.current_staff_role() in ('admin', 'editor', 'requests'))
  with check (public.current_staff_role() in ('admin', 'editor', 'requests'));

drop policy if exists "admin delete requests" on public.requests;
create policy "admin delete requests" on public.requests
  for delete to authenticated
  using (public.current_staff_role() = 'admin');

-- الملف الشخصي: كل مستخدم يقرأ صفّه، والمدير يدير الجميع
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_staff_role() = 'admin');

drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles
  for all to authenticated
  using (public.current_staff_role() = 'admin')
  with check (public.current_staff_role() = 'admin');

-- الصلاحيات الصريحة
grant usage on schema public to anon, authenticated;
grant select on public.sectors, public.companies, public.services, public.projects, public.news, public.pages, public.media to anon, authenticated;
grant insert on public.requests to anon, authenticated;
grant select, update, insert, delete on public.sectors, public.companies, public.services, public.projects, public.news, public.pages, public.media to authenticated;
grant select, update, delete on public.requests to authenticated;
grant select, update on public.profiles to authenticated;

-- ── إنشاء ملف شخصي تلقائياً عند إضافة مستخدم ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'editor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════
--  التخزين: حاوية media للصور والكتيبات
-- ═══════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media staff write" on storage.objects;
create policy "media staff write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media staff update" on storage.objects;
create policy "media staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "media staff delete" on storage.objects;
create policy "media staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());

-- ═══════════════════════════════════════════════════════════════════════
--  الخطوة التالية (يدوياً):
--  1) Authentication → Users → Add user (بريد الشركة + كلمة مرور).
--  2) نفّذ: update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
--  3) انسخ URL و anon key و service_role key إلى .env.local وأعد التشغيل.
--  4) نقل المحتوى: npm run seed:supabase (اختياري — راجع README).
-- ═══════════════════════════════════════════════════════════════════════
