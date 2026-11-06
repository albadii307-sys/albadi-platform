'use client';

import { useEffect, useState } from 'react';

type NavItem = { id: string; slug: string; name: string };

export default function SectorIndexNav({ items, label }: { items: NavItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.slug ?? '');

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(`sector-${item.slug}`))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id.replace('sector-', ''));
      },
      { rootMargin: '-28% 0px -52% 0px', threshold: [0, 0.25, 0.5, 0.75] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="x-ed-index-wrap">
      <ol className="x-ed-index" aria-label={label}>
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#sector-${item.slug}`}
              className={active === item.slug ? 'is-on' : undefined}
              aria-current={active === item.slug ? 'true' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.name}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
