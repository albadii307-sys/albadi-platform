import { list } from './db';
import type { Setting } from './types';
import { defaultTimeline, defaultWhy, parseJson, parseMap, siteDefaults, type SiteSettings } from './site-settings';

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await list<Setting>('settings');
  const map = new Map(rows.map((row) => [row.key, row.value]));

  const value = (key: keyof typeof siteDefaults) => {
    const stored = map.get(key)?.trim();
    return stored || siteDefaults[key];
  };

  return {
    logo: map.get('logo_url')?.trim() || '/media/brand/logo.png',
    brandNameAr: value('brand_name_ar'),
    brandNameEn: value('brand_name_en'),
    taglineAr: value('brand_tagline_ar'),
    taglineEn: value('brand_tagline_en'),
    phone: value('contact_phone'),
    fax: value('contact_fax'),
    email: value('contact_email'),
    addressAr: value('contact_address_ar'),
    addressEn: value('contact_address_en'),
    hoursAr: value('contact_hours_ar'),
    hoursEn: value('contact_hours_en'),
    social: {
      instagram: map.get('social_instagram')?.trim() ?? siteDefaults.social_instagram,
      x: map.get('social_x')?.trim() ?? siteDefaults.social_x,
      linkedin: map.get('social_linkedin')?.trim() ?? siteDefaults.social_linkedin,
      facebook: map.get('social_facebook')?.trim() ?? siteDefaults.social_facebook,
      youtube: map.get('social_youtube')?.trim() ?? siteDefaults.social_youtube,
      whatsapp: map.get('social_whatsapp')?.trim() ?? siteDefaults.social_whatsapp,
    },
    why: parseJson(map.get('why_cards'), defaultWhy),
    timeline: parseJson(map.get('timeline'), defaultTimeline),
    gallery: parseMap<Record<string, string[]>>(map.get('sector_gallery'), {}),
  };
}
