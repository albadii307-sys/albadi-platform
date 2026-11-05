'use client';

import { useActionState } from 'react';
import { submitContactMessage, type ContactState } from '@/app/actions/contact';
import type { Locale } from '@/lib/types';
import { getDict } from '@/lib/i18n';
import { Check } from './icons';

const initial: ContactState = { status: 'idle' };

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [state, formAction, pending] = useActionState(submitContactMessage, initial);

  if (state.status === 'success') {
    return (
      <div className="form-card success-panel">
        <div className="success-icon">
          <Check size={30} />
        </div>
        <h2 style={{ marginBottom: 8 }}>{t.contact.sent}</h2>
        <p style={{ color: 'var(--muted)' }}>{t.services.successText}</p>
      </div>
    );
  }

  return (
    <form className="form-card" action={formAction} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '-9999px' }}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 20 }}>{t.contact.formTitle}</h2>
      {state.status === 'error' && !state.errors ? (
        <div className="alert alert-error">{locale === 'ar' ? 'تعذّر الإرسال.' : 'Could not send.'}</div>
      ) : null}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="c-name">
            {t.services.name} <span className="req">*</span>
          </label>
          <input id="c-name" name="name" autoComplete="name" required />
          {state.errors?.name && <span className="field-error">{state.errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="c-phone">{t.services.phone}</label>
          <input id="c-phone" name="phone" type="tel" dir="ltr" autoComplete="tel" />
        </div>
        <div className="field field-full">
          <label htmlFor="c-email">
            {t.services.email} <span className="req">*</span>
          </label>
          <input id="c-email" name="email" type="email" dir="ltr" autoComplete="email" required />
          {state.errors?.email && <span className="field-error">{state.errors.email}</span>}
        </div>
        <div className="field field-full">
          <label htmlFor="c-message">
            {t.contact.message} <span className="req">*</span>
          </label>
          <textarea id="c-message" name="message" />
          {state.errors?.message && <span className="field-error">{state.errors.message}</span>}
        </div>
      </div>
      <div className="form-foot">
        <p className="form-note">{t.services.consent}</p>
        <button type="submit" className="btn btn-orange" disabled={pending}>
          {pending ? t.services.sending : t.contact.send}
        </button>
      </div>
    </form>
  );
}
