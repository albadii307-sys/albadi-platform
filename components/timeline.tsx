import { pick } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import type { Milestone } from '@/lib/site-settings';

export default function Timeline({
  items,
  locale,
  eyebrow,
  title,
  accent,
  lead,
}: {
  items: Milestone[];
  locale: Locale;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
}) {
  if (!items.length) return null;

  return (
    <section className="x-tl-sec" id="journey">
      <div className="container">
        <div className="x-sec-head reveal">
          <div>
            <span className="x-eyebrow">
              <i aria-hidden="true" />
              {eyebrow}
            </span>
            <h2 className="x-h2">
              {title}
              <br />
              <em>{accent}</em>
            </h2>
          </div>
          <p>{lead}</p>
        </div>

        <ol className="x-tl">
          {items.map((item, index) => (
            <li className="x-tl-item reveal" key={item.year} style={{ transitionDelay: `${index * 60}ms` }}>
              <span className="x-tl-year" dir="ltr">
                {item.year}
              </span>
              <span className="x-tl-dot" aria-hidden="true" />
              <b>{pick(item, 'title', locale)}</b>
              <p>{pick(item, 'text', locale)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
