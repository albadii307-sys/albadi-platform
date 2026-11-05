import type { Locale } from './i18n';

type Forms = { one: string; two: string; few: string; many: string };

function arabic(n: number, forms: Forms) {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}

export function sectorsCount(n: number, locale: Locale) {
  return locale === 'en'
    ? `${n} ${n === 1 ? 'sector' : 'sectors'}`
    : arabic(n, { one: 'قطاع واحد', two: 'قطاعان', few: 'قطاعات', many: 'قطاعاً' });
}

export function companiesCount(n: number, locale: Locale) {
  return locale === 'en'
    ? `${n} ${n === 1 ? 'company' : 'companies'}`
    : arabic(n, { one: 'شركة واحدة', two: 'شركتان', few: 'شركات', many: 'شركة' });
}

export function enginesCount(n: number, locale: Locale) {
  return locale === 'en'
    ? `${n} ${n === 1 ? 'engine' : 'engines'}`
    : arabic(n, { one: 'محرك واحد', two: 'محركان', few: 'محركات', many: 'محركاً' });
}

export function servicesCount(n: number, locale: Locale) {
  return locale === 'en'
    ? `${n} ${n === 1 ? 'service' : 'services'}`
    : arabic(n, { one: 'خدمة واحدة', two: 'خدمتان', few: 'خدمات', many: 'خدمة' });
}

export function projectsCount(n: number, locale: Locale) {
  return locale === 'en'
    ? `${n} ${n === 1 ? 'project' : 'projects'}`
    : arabic(n, { one: 'مشروع واحد', two: 'مشروعان', few: 'مشاريع', many: 'مشروعاً' });
}
