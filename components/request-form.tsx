'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { submitServiceRequest, type RequestState } from '@/app/actions/request';
import type { Locale } from '@/lib/types';
import { getDict } from '@/lib/i18n';
import { Check } from './icons';

type Option = { id: string; name: string; sectorId: string | null };

const initial: RequestState = { status: 'idle' };

export default function RequestForm({
  locale,
  sectors,
  services,
  defaultService,
  defaultSector,
}: {
  locale: Locale;
  sectors: { id: string; name: string }[];
  services: Option[];
  defaultService?: string;
  defaultSector?: string;
}) {
  const t = getDict(locale);
  const [state, formAction, pending] = useActionState(submitServiceRequest, initial);
  const [sectorId, setSectorId] = useState<string>(() => {
    const selected = services.find((s) => s.id === defaultService);
    return selected?.sectorId ?? defaultSector ?? sectors[0]?.id ?? '';
  });
  const [serviceId, setServiceId] = useState(defaultService ?? '');
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'success') successRef.current?.scrollIntoView({ block: 'center' });
  }, [state.status]);

  const filtered = useMemo(
    () => services.filter((service) => service.sectorId === sectorId),
    [services, sectorId]
  );

  if (state.status === 'success') {
    return (
      <div className="form-card success-panel" ref={successRef}>
        <div className="success-icon">
          <Check size={30} />
        </div>
        <h2 style={{ marginBottom: 10 }}>{t.services.success}</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '44ch', margin: '0 auto 8px' }}>{t.services.successText}</p>
        {state.ref ? (
          <p style={{ fontWeight: 600, color: 'var(--green-800)' }}>
            {t.services.ref}: <span dir="ltr">{state.ref}</span>
          </p>
        ) : null}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <a href={`/${locale}/request`} className="btn btn-ghost">
            {t.services.newRequest}
          </a>
          <Link href={`/${locale}`} className="btn btn-dark">
            {t.common.home}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="form-card" action={formAction} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden="true" className="form-honeypot">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === 'error' && state.message ? (
        <div className="alert alert-error" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="sector">{locale === 'ar' ? 'القطاع' : 'Sector'}</label>
          <select
            id="sector"
            value={sectorId}
            onChange={(event) => {
              setSectorId(event.target.value);
              setServiceId('');
            }}
          >
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field field-full">
          <label htmlFor="service">
            {t.services.chooseService} <span className="req">*</span>
          </label>
          <select
            id="service"
            name="service"
            required
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="">{locale === 'ar' ? '— اختر الخدمة —' : '— Select a service —'}</option>
            {filtered.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          {state.errors?.service && <span className="field-error">{state.errors.service}</span>}
        </div>

        <div className="field">
          <label htmlFor="name">
            {t.services.name} <span className="req">*</span>
          </label>
          <input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(state.errors?.name)} />
          {state.errors?.name && <span className="field-error">{state.errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="company">{t.services.company}</label>
          <input id="company" name="company" autoComplete="organization" />
        </div>

        <div className="field">
          <label htmlFor="phone">
            {t.services.phone} <span className="req">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            placeholder="+968 9xxx xxxx"
            autoComplete="tel"
            required
            aria-invalid={Boolean(state.errors?.phone)}
          />
          {state.errors?.phone && <span className="field-error">{state.errors.phone}</span>}
        </div>

        <div className="field">
          <label htmlFor="email">
            {t.services.email} <span className="req">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.errors?.email)}
          />
          {state.errors?.email && <span className="field-error">{state.errors.email}</span>}
        </div>

        <div className="field field-full">
          <label htmlFor="message">{t.services.message}</label>
          <textarea id="message" name="message" placeholder={t.services.messageHint} />
        </div>

        <div className="field field-full">
          <label htmlFor="attachment">{t.services.attachment}</label>
          <input id="attachment" name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" />
          <span className="field-hint">{t.services.attachmentHint}</span>
          {state.errors?.attachment && <span className="field-error">{state.errors.attachment}</span>}
        </div>
      </div>

      <div className="form-foot">
        <p className="form-note">{t.services.consent}</p>
        <button type="submit" className="btn btn-orange" disabled={pending}>
          {pending ? t.services.sending : t.services.submit}
        </button>
      </div>
    </form>
  );
}
