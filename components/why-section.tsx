import { Award, Compass, Layers, Leaf, Shield, Users } from './icons';
import { pick } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import type { WhyCard } from '@/lib/site-settings';

const iconMap: Record<string, typeof Award> = {
  award: Award,
  layers: Layers,
  users: Users,
  shield: Shield,
  leaf: Leaf,
  compass: Compass,
};

export default function WhySection({
  items,
  locale,
  eyebrow,
  title,
  accent,
  lead,
}: {
  items: WhyCard[];
  locale: Locale;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
}) {
  if (!items.length) return null;

  return (
    <section className="x-why">
      <span className="x-why-photo" aria-hidden="true" />
      <span className="x-why-veil" aria-hidden="true" />
      <div className="container x-why-inner">
        <div className="x-why-head reveal">
          <span className="x-eyebrow light">
            <i aria-hidden="true" />
            {eyebrow}
          </span>
          <h2 className="x-h2">
            {title}
            <br />
            <em>{accent}</em>
          </h2>
          <p>{lead}</p>
        </div>

        <div className="x-why-grid">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] ?? Award;
            return (
              <article
                className="x-why-card reveal"
                key={`${item.title_en}-${index}`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="x-why-ic" aria-hidden="true">
                  <Icon size={21} />
                </span>
                <b>{pick(item, 'title', locale)}</b>
                <p>{pick(item, 'text', locale)}</p>
                <span className="x-why-n" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
