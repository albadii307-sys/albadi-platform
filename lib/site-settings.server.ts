import { list } from './db';
import type { Setting } from './types';
import {
  defaultTimeline,
  defaultTypography,
  defaultWhy,
  isFontKey,
  parseJson,
  parseMap,
  siteDefaults,
  type SiteSettings,
  type Typography,
} from './site-settings';

function numberSetting(raw: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await list<Setting>('settings');
  const map = new Map(rows.map((row) => [row.key, row.value]));

  const value = (key: keyof typeof siteDefaults) => {
    const stored = map.get(key)?.trim();
    return stored || siteDefaults[key];
  };

  const typography: Typography = {
    bodyFont: isFontKey(map.get('type_body_font')) ? (map.get('type_body_font') as Typography['bodyFont']) : defaultTypography.bodyFont,
    headingFont: isFontKey(map.get('type_heading_font'))
      ? (map.get('type_heading_font') as Typography['headingFont'])
      : defaultTypography.headingFont,
    baseSize: numberSetting(map.get('type_base_size'), defaultTypography.baseSize, 14, 20),
    lineHeight: numberSetting(map.get('type_line_height'), defaultTypography.lineHeight, 1.3, 2.2),
    letterSpacing: numberSetting(map.get('type_letter_spacing'), defaultTypography.letterSpacing, -1, 3),
    headingWeight: numberSetting(map.get('type_heading_weight'), defaultTypography.headingWeight, 400, 800),
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
    heroVideo: map.get('hero_video_url')?.trim() ?? '',
    typography,
  };
}
