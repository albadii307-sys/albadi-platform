import { Facebook, Instagram, Linkedin, Whatsapp, XSocial, Youtube } from './icons';
import { activeSocials, type SiteSettings } from '@/lib/site-settings';

const iconMap = {
  instagram: Instagram,
  x: XSocial,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  whatsapp: Whatsapp,
};

export default function SocialLinks({
  settings,
  tone = 'light',
  label,
}: {
  settings: SiteSettings;
  tone?: 'light' | 'dark';
  label?: string;
}) {
  const items = activeSocials(settings);
  if (!items.length) return null;

  return (
    <div className={`x-social is-${tone}`} aria-label={label}>
      {items.map((item) => {
        const Icon = iconMap[item.key];
        return (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            title={item.label}
          >
            <Icon size={17} />
          </a>
        );
      })}
    </div>
  );
}
