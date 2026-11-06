'use client';

import { useState } from 'react';
import { Linkedin, Whatsapp, XSocial, Check } from './icons';
import type { Locale } from '@/lib/types';

export default function ShareActions({ url, title, locale }: { url: string; title: string; locale: Locale }) {
  const [copied, setCopied] = useState(false);
  const ar = locale === 'ar';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <Whatsapp size={16} />,
    },
    {
      key: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <XSocial size={15} />,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin size={16} />,
    },
  ];

  async function copyLink() {
    const ok = await writeClipboard(url);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="x-share">
      <span className="x-share-head">{ar ? 'شارك الخبر' : 'Share this story'}</span>
      <div className="x-share-row">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="x-share-btn"
            aria-label={link.label}
            title={link.label}
          >
            {link.icon}
          </a>
        ))}
        <button type="button" className="x-share-btn" onClick={copyLink} aria-label={ar ? 'نسخ الرابط' : 'Copy link'}>
          {copied ? <Check size={16} /> : <LinkGlyph />}
        </button>
      </div>
      {copied ? <small className="x-share-done">{ar ? 'تم نسخ الرابط' : 'Link copied'}</small> : null}
    </div>
  );
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
}

function LinkGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l1.42-1.42a5 5 0 0 0-7.07-7.07L10 5.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.42a5 5 0 0 0 7.07 7.07L14 18.07" />
    </svg>
  );
}
