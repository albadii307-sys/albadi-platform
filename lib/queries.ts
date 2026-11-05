import { list, getOne, getById } from './db';
import type { Company, MediaItem, NewsItem, Page, Project, Sector, Service, ServiceRequest, Setting, TeamMember } from './types';

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const row = await getOne<Setting>('settings', { key });
  return row?.value?.trim() || fallback;
}

export async function getSiteLogo(): Promise<string> {
  return getSetting('logo_url', '/media/brand/logo.png');
}

export async function getTeam(): Promise<TeamMember[]> {
  return list<TeamMember>('team', {
    where: { is_published: true },
    order: { column: 'sort_order', ascending: true },
  });
}

export async function getSectors(): Promise<Sector[]> {
  return list<Sector>('sectors', {
    where: { is_published: true },
    order: { column: 'sort_order', ascending: true },
  });
}

export async function getAllSectors(): Promise<Sector[]> {
  return list<Sector>('sectors', { order: { column: 'sort_order', ascending: true } });
}

export async function getSector(slug: string): Promise<Sector | null> {
  return getOne<Sector>('sectors', { slug, is_published: true });
}

export async function getServices(sectorId?: string): Promise<Service[]> {
  return list<Service>('services', {
    where: sectorId ? { sector_id: sectorId, is_published: true } : { is_published: true },
    order: { column: 'sort_order', ascending: true },
  });
}

export async function getAllServices(): Promise<Service[]> {
  return list<Service>('services', { order: { column: 'sort_order', ascending: true } });
}

export async function getService(slug: string): Promise<Service | null> {
  return getOne<Service>('services', { slug, is_published: true });
}

export async function getCompanies(): Promise<Company[]> {
  return list<Company>('companies', {
    where: { is_published: true },
    order: { column: 'sort_order', ascending: true },
  });
}

export async function getAllNews(category?: NewsItem['category']): Promise<NewsItem[]> {
  return list<NewsItem>('news', {
    where: { is_published: true, ...(category ? { category } : {}) },
    order: { column: 'published_at', ascending: false },
  });
}

export async function getNews(category?: NewsItem['category'], limit = 12): Promise<NewsItem[]> {
  const all = await getAllNews(category);
  return all.slice(0, limit);
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
  return getOne<NewsItem>('news', { slug, is_published: true });
}

export async function getProjects(featured = false, limit?: number): Promise<Project[]> {
  const rows = await list<Project>('projects', {
    where: featured ? { is_published: true, is_featured: true } : { is_published: true },
    order: { column: 'sort_order', ascending: true },
  });
  return limit ? rows.slice(0, limit) : rows;
}

export async function getAllProjects(): Promise<Project[]> {
  return list<Project>('projects', { order: { column: 'sort_order', ascending: true } });
}

export async function getProject(slug: string): Promise<Project | null> {
  return getOne<Project>('projects', { slug, is_published: true });
}

export async function getPage(key: string): Promise<Page | null> {
  return getOne<Page>('pages', { key });
}

export async function getMedia(): Promise<MediaItem[]> {
  return list<MediaItem>('media', { order: { column: 'created_at', ascending: false } });
}

export async function getRequests(): Promise<ServiceRequest[]> {
  return list<ServiceRequest>('requests', { order: { column: 'created_at', ascending: false } });
}

export async function getRequest(id: string): Promise<ServiceRequest | null> {
  return getById<ServiceRequest>('requests', id);
}
