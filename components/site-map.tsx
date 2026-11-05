import { ArrowUpRight, Pin } from './icons';
import { getDict, type Locale } from '@/lib/i18n';

export default function SiteMap({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const t = getDict(locale);
  return (
    <div
      className="x-map"
      role="img"
      aria-label={ar ? 'خريطة موقع المجموعة — ولاية صحم، سلطنة عُمان' : 'Map of the group headquarters — Saham, Sultanate of Oman'}
    >
      <span className="x-map-grid" aria-hidden="true" />
      <span className="x-map-roads" aria-hidden="true" />
      <span className="x-map-pin" aria-hidden="true">
        <Pin size={30} />
      </span>
      <span className="x-map-tag">{ar ? 'ولاية صحم · سلطنة عُمان' : 'Saham · Sultanate of Oman'}</span>
      <div className="x-map-card">
        <b>{ar ? 'المقر الرئيسي' : 'Head office'}</b>
        <span>{t.contact.addressValue}</span>
        <a
          className="x-map-link"
          href="https://www.openstreetmap.org/?mlat=24.19&mlon=56.88#map=13/24.19/56.88"
          target="_blank"
          rel="noopener noreferrer"
        >
          {ar ? 'فتح في الخرائط' : 'Open in maps'}
          <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
