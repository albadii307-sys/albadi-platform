export type Locale = 'ar' | 'en';

export type Sector = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string | null;
  tagline_en: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  hero_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Company = {
  id: string;
  sector_id: string | null;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  logo_url: string | null;
  website: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Service = {
  id: string;
  sector_id: string | null;
  company_id: string | null;
  slug: string;
  name_ar: string;
  name_en: string;
  summary_ar: string | null;
  summary_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  is_requestable: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  client_ar: string | null;
  client_en: string | null;
  sector_id: string | null;
  location_ar: string | null;
  location_en: string | null;
  year: number | null;
  cover_url: string | null;
  body_ar: string | null;
  body_en: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  cover_url: string | null;
  category: 'group' | 'csr' | 'media';
  published_at: string;
  external_url: string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Page = {
  id: string;
  key: string;
  title_ar: string;
  title_en: string;
  body_ar: string | null;
  body_en: string | null;
  updated_at?: string;
};

export type RequestStatus = 'new' | 'review' | 'quoted' | 'won' | 'closed';

export type ServiceRequest = {
  id: string;
  ref: string;
  service_id: string | null;
  sector_id: string | null;
  service_name: string | null;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  message: string | null;
  attachment_url: string | null;
  status: RequestStatus;
  assignee: string | null;
  notes: string | null;
  locale: Locale;
  created_at: string;
  updated_at: string;
};

export type MediaItem = {
  id: string;
  title: string;
  url: string;
  kind: 'image' | 'pdf';
  created_at?: string;
};

export type TeamMember = {
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  bio_ar: string | null;
  bio_en: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Setting = {
  id: string;
  key: string;
  value: string;
  updated_at?: string;
};

export type TableName =
  | 'sectors'
  | 'companies'
  | 'services'
  | 'projects'
  | 'news'
  | 'pages'
  | 'requests'
  | 'media'
  | 'settings'
  | 'team';
