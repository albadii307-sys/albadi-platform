import type { Locale } from './types';

export type WhyCard = {
  icon: string;
  title_ar: string;
  title_en: string;
  text_ar: string;
  text_en: string;
};

export type Milestone = {
  year: string;
  title_ar: string;
  title_en: string;
  text_ar: string;
  text_en: string;
};

export type SocialKey = 'instagram' | 'x' | 'linkedin' | 'facebook' | 'youtube' | 'whatsapp';

export type FontKey = 'plex' | 'cairo' | 'tajawal' | 'almarai' | 'notoKufi' | 'amiri' | 'system';

export const fontOptions: { key: FontKey; label: string; stack: string }[] = [
  { key: 'plex', label: 'IBM Plex Sans Arabic (الافتراضي)', stack: 'var(--font-arabic), "Segoe UI", system-ui, sans-serif' },
  { key: 'cairo', label: 'Cairo', stack: 'var(--font-cairo), var(--font-arabic), sans-serif' },
  { key: 'tajawal', label: 'Tajawal', stack: 'var(--font-tajawal), var(--font-arabic), sans-serif' },
  { key: 'almarai', label: 'Almarai', stack: 'var(--font-almarai), var(--font-arabic), sans-serif' },
  { key: 'notoKufi', label: 'Noto Kufi Arabic', stack: 'var(--font-noto-kufi), var(--font-arabic), sans-serif' },
  { key: 'amiri', label: 'Amiri (خط نسخي)', stack: 'var(--font-amiri), var(--font-arabic), serif' },
  { key: 'system', label: 'خط النظام', stack: 'system-ui, "Segoe UI", Tahoma, Arial, sans-serif' },
];

export type Typography = {
  bodyFont: FontKey;
  headingFont: FontKey;
  baseSize: number;
  lineHeight: number;
  letterSpacing: number;
  headingWeight: number;
};

export const defaultTypography: Typography = {
  bodyFont: 'plex',
  headingFont: 'plex',
  baseSize: 16,
  lineHeight: 1.75,
  letterSpacing: 0,
  headingWeight: 600,
};

export function isFontKey(value: string | undefined): value is FontKey {
  return fontOptions.some((font) => font.key === value);
}

export const socialMeta: { key: SocialKey; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X (Twitter)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

export const defaultWhy: WhyCard[] = [
  {
    icon: 'award',
    title_ar: 'خبرة ممتدة',
    title_en: 'Proven experience',
    text_ar: 'منذ 1976 نراكم خبراتنا في المقاولات والصناعة والتجارة والخدمات لنقدم حلولاً متكاملة.',
    text_en: 'Since 1976 we have combined construction, industry, trade and service expertise into integrated solutions.',
  },
  {
    icon: 'layers',
    title_ar: 'تنوّع استراتيجي',
    title_en: 'Strategic diversity',
    text_ar: 'قطاعات متكاملة تعمل معاً، وتحمي المجموعة من تقلبات أي سوق منفرد.',
    text_en: 'Integrated sectors working together, shielding the group from the swings of any single market.',
  },
  {
    icon: 'users',
    title_ar: 'كوادر عُمانية',
    title_en: 'Omani talent',
    text_ar: 'نؤمن بأن الإنسان العُماني هو رأس المال الحقيقي، بنسب تعمين تتجاوز 90% في بعض الإدارات.',
    text_en: 'We believe Omani people are our real capital, with Omanisation above 90% in some departments.',
  },
  {
    icon: 'shield',
    title_ar: 'جودة معتمدة',
    title_en: 'Certified quality',
    text_ar: 'الدرجة الممتازة من مجلس المناقصات، وتراخيص وزارة الدفاع، وشهادات الجودة العالمية.',
    text_en: 'Excellent grade from the Tender Board, Ministry of Defence licences and international quality certificates.',
  },
  {
    icon: 'leaf',
    title_ar: 'شراكات موثوقة',
    title_en: 'Trusted partnerships',
    text_ar: 'علاقات طويلة الأمد مع الجهات الحكومية والخاصة، قائمة على الوفاء بالمواعيد والشفافية.',
    text_en: 'Long-term relationships with public and private clients, built on delivery and transparency.',
  },
  {
    icon: 'compass',
    title_ar: 'رؤية مستقبلية',
    title_en: 'Forward vision',
    text_ar: 'نستثمر في التطوير العقاري واللوجستيات والطاقة بما يواكب رؤية عُمان 2040.',
    text_en: 'We invest in real estate, logistics and energy in step with Oman Vision 2040.',
  },
];

export const defaultTimeline: Milestone[] = [
  {
    year: '1976',
    title_ar: 'التأسيس',
    title_en: 'Foundation',
    text_ar: 'تسجيل أول نشاط تجاري للمجموعة في ولاية صحم.',
    text_en: 'The group registers its first commercial activity in Saham.',
  },
  {
    year: '1984',
    title_ar: 'التوسّع في المقاولات',
    title_en: 'Entering construction',
    text_ar: 'دخول قطاع المقاولات والبناء وتنفيذ أول المشاريع الحكومية.',
    text_en: 'The group enters contracting and delivers its first government projects.',
  },
  {
    year: '1990s',
    title_ar: 'التنويع الصناعي',
    title_en: 'Industrial diversification',
    text_ar: 'إطلاق أعمال الألمنيوم والأخشاب والحديد والخرسانة الجاهزة.',
    text_en: 'Aluminium, wood, steel and ready-mix concrete operations are launched.',
  },
  {
    year: '2000s',
    title_ar: 'البنية الأساسية',
    title_en: 'Infrastructure',
    text_ar: 'التوسّع في الطرق والجسور وتشغيل محاجر الرمل والحصباء.',
    text_en: 'Expansion into roads and bridges, alongside sand and gravel quarries.',
  },
  {
    year: '2010s',
    title_ar: 'الضيافة والتعليم',
    title_en: 'Hospitality & education',
    text_ar: 'افتتاح فندق الواحة الخضراء ومدرسة صحم الخاصة.',
    text_en: 'Green Oasis Hotel and Saham Private School open their doors.',
  },
  {
    year: '2020s',
    title_ar: 'الاستثمار المستقبلي',
    title_en: 'Future investment',
    text_ar: 'إطلاق التطوير العقاري والخدمات اللوجستية والتجارة والاستثمار.',
    text_en: 'Real estate development, logistics, trade and investment take shape.',
  },
];

export const siteDefaults = {
  brand_name_ar: 'مجموعة البادي للاستثمار القابضة',
  brand_name_en: 'Al-Badi Investment Holding Group',
  brand_tagline_ar: 'نبني عُمان منذ 1976',
  brand_tagline_en: 'Building Oman since 1976',
  contact_phone: '+968 26 854 411',
  contact_fax: '+968 26 855 744',
  contact_email: 'albadi@albadigroup.com',
  contact_address_ar: 'ص.ب. 70، الرمز البريدي 319، ولاية صحم، سلطنة عُمان',
  contact_address_en: 'P.O. Box 70, Postal Code 319, Saham, Sultanate of Oman',
  contact_hours_ar: 'الأحد – الخميس، 8:00 صباحاً – 4:00 مساءً',
  contact_hours_en: 'Sun – Thu, 8:00 AM – 4:00 PM',
  social_instagram: 'https://www.instagram.com/albadigroup/',
  social_x: '',
  social_linkedin: 'https://www.linkedin.com/company/al-badi-group',
  social_facebook: '',
  social_youtube: '',
  social_whatsapp: '',
  hero_video_url: '',
} as const;

export type SiteSettings = {
  logo: string;
  brandNameAr: string;
  brandNameEn: string;
  taglineAr: string;
  taglineEn: string;
  phone: string;
  fax: string;
  email: string;
  addressAr: string;
  addressEn: string;
  hoursAr: string;
  hoursEn: string;
  social: Record<SocialKey, string>;
  heroVideo: string;
  gallery: Record<string, string[]>;
  why: WhyCard[];
  timeline: Milestone[];
  typography: Typography;
};

export function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function parseMap<T extends object>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && Object.keys(parsed).length ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

export function siteName(locale: Locale, settings: SiteSettings): string {
  return locale === 'ar' ? settings.brandNameAr : settings.brandNameEn;
}

export function siteTagline(locale: Locale, settings: SiteSettings): string {
  return locale === 'ar' ? settings.taglineAr : settings.taglineEn;
}

export function siteAddress(locale: Locale, settings: SiteSettings): string {
  return locale === 'ar' ? settings.addressAr : settings.addressEn;
}

export function siteHours(locale: Locale, settings: SiteSettings): string {
  return locale === 'ar' ? settings.hoursAr : settings.hoursEn;
}

export function activeSocials(settings: SiteSettings) {
  return socialMeta
    .map((item) => ({ ...item, href: settings.social[item.key] }))
    .filter((item) => Boolean(item.href));
}
