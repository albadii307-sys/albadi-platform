'use client';

import type { Locale } from '@/lib/types';

export type TeamCardItem = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  order: number;
};

export function TeamCard({ member, locale }: { member: TeamCardItem; locale: Locale }) {
  return (
    <article
      className={`x-tm reveal${member.photo ? '' : ' no-photo'}`}
      data-order={String(member.order).padStart(2, '0')}
      tabIndex={0}
      aria-label={`${member.name} — ${member.role}`}
      onPointerMove={(event) => {
        const el = event.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        el.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      }}
    >
      {member.photo ? (
        <div className="x-tm-media">
          <img src={member.photo} alt={member.name} loading="lazy" />
          <span className="x-tm-glow" aria-hidden="true" />
          <span className="x-tm-n" aria-hidden="true">
            {String(member.order).padStart(2, '0')}
          </span>
        </div>
      ) : null}
      <div className="x-tm-body">
        {member.photo ? null : (
          <span className="x-tm-idx" aria-hidden="true">
            {String(member.order).padStart(2, '0')}
          </span>
        )}
        <b className="x-tm-name">{member.name}</b>
        <span className="x-tm-role">{member.role}</span>
        {member.bio ? <p className="x-tm-bio">{member.bio}</p> : null}
      </div>
      <span className="x-tm-line" aria-hidden="true" />
    </article>
  );
}

export default function TeamGrid({ items, locale }: { items: TeamCardItem[]; locale: Locale }) {
  return (
    <div className="x-tm-grid">
      {items.map((member) => (
        <TeamCard key={member.id} member={member} locale={locale} />
      ))}
      {items.length === 0 ? (
        <p className="x-tm-empty">{locale === 'ar' ? 'سيتم إضافة أعضاء الفريق قريباً.' : 'Team members will be added soon.'}</p>
      ) : null}
    </div>
  );
}
