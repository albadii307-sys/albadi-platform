'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText } from './icons';

export default function PdfThumb({ url, title }: { url: string; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    const host = canvasRef.current?.parentElement;
    if (!host) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px' }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let pdf: { destroy: () => Promise<void> } | null = null;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const document = await pdfjs.getDocument({ url, isEvalSupported: false, disableRange: true, disableStream: true }).promise;
        pdf = document;
        const page = await document.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(2.5, 900 / base.width) });
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context || cancelled) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: context, viewport }).promise;
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('failed');
      }
    })();

    return () => {
      cancelled = true;
      pdf?.destroy().catch(() => {});
    };
  }, [visible, url]);

  return (
    <span className={`x-md-pdf${status === 'ready' ? ' is-ready' : ''}`}>
      <canvas ref={canvasRef} role="img" aria-label={title} />
      {status !== 'ready' ? (
        <span className="x-md-pdf-fallback" aria-hidden="true">
          <FileText size={28} />
          <span>{status === 'failed' ? 'PDF' : '…'}</span>
        </span>
      ) : null}
      <span className="x-md-pdf-tag" aria-hidden="true">
        PDF
      </span>
    </span>
  );
}
