'use client';

import { useEffect, useRef, useState } from 'react';
import { fontOptions } from '@/lib/site-settings';

const sizes = [12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48];
const weights = [
  { value: '300', label: 'خفيف 300' },
  { value: '400', label: 'عادي 400' },
  { value: '500', label: 'متوسط 500' },
  { value: '600', label: 'نصف عريض 600' },
  { value: '700', label: 'عريض 700' },
  { value: '800', label: 'ثقيل 800' },
];
const lineHeights = ['1.2', '1.4', '1.6', '1.8', '2', '2.2'];
const letterSpacings = [
  { value: '0', label: 'عادي' },
  { value: '0.5', label: '0.5px' },
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
  { value: '-0.5', label: '-0.5px' },
];

function ToolIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function RichEditor({
  name,
  label,
  defaultValue,
  help,
  dir = 'rtl',
  rows = 9,
  full,
}: {
  name: string;
  label: string;
  defaultValue: string;
  help?: string;
  dir?: 'rtl' | 'ltr';
  rows?: number;
  full?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState(false);
  const [html, setHtml] = useState(defaultValue);
  const [notice, setNotice] = useState('');
  const [words, setWords] = useState(0);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue;
      setWords(countWords(editorRef.current));
    }
  }, [defaultValue]);

  function countWords(node: HTMLElement) {
    return (node.textContent ?? '').trim().split(/\s+/).filter(Boolean).length;
  }

  function sync() {
    const editor = editorRef.current;
    if (!editor || !inputRef.current) return;
    inputRef.current.value = editor.innerHTML;
    setWords(countWords(editor));
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function exec(command: string, value?: string) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    sync();
  }

  function applyStyle(property: string, value: string) {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed || !editor.contains(range.commonAncestorContainer)) {
      flash('حدّد النص أولاً ثم اختر التنسيق');
      return;
    }
    const span = document.createElement('span');
    span.style.setProperty(property, value);
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    } catch {
      flash('تعذّر تطبيق التنسيق على هذا التحديد');
      return;
    }
    selection.removeAllRanges();
    const next = document.createRange();
    next.selectNodeContents(span);
    selection.addRange(next);
    sync();
  }

  function clearFormatting() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('selectAll');
    document.execCommand('removeFormat');
    editor.querySelectorAll('[style]').forEach((element) => element.removeAttribute('style'));
    editor.querySelectorAll('font, span').forEach((element) => {
      if (element.tagName === 'SPAN' || element.tagName === 'FONT') {
        element.replaceWith(...Array.from(element.childNodes));
      }
    });
    sync();
  }

  function addLink() {
    const url = window.prompt('أدخل رابطاً (https://…)');
    if (!url) return;
    const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
    exec('createLink', safe);
  }

  function toggleSource() {
    const editor = editorRef.current;
    if (!editor) return;
    if (!source) {
      setHtml(editor.innerHTML);
      setSource(true);
    } else {
      editor.innerHTML = html;
      setSource(false);
      sync();
    }
  }

  return (
    <div className={`a-field ${full ? 'full' : ''}`}>
      <div className="tx-label">
        <label htmlFor={name}>{label}</label>
        <span className="tx-count">{words} كلمة</span>
      </div>

      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />

      <div className="tx-wrap">
        <div className="tx-toolbar" role="toolbar" aria-label="خيارات تنسيق النص">
          <div className="tx-group">
            <select
              aria-label="نمط الفقرة"
              title="نمط الفقرة"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) exec('formatBlock', event.target.value);
                event.target.value = '';
              }}
            >
              <option value="">نمط الفقرة</option>
              <option value="<p>">نص عادي</option>
              <option value="<h2>">عنوان رئيسي H2</option>
              <option value="<h3>">عنوان فرعي H3</option>
              <option value="<h4>">عنوان صغير H4</option>
              <option value="<blockquote>">اقتباس</option>
            </select>
          </div>

          <div className="tx-group">
            <select
              aria-label="نوع الخط"
              title="نوع الخط"
              defaultValue=""
              onChange={(event) => {
                const font = fontOptions.find((item) => item.key === event.target.value);
                if (font) applyStyle('font-family', font.stack);
                event.target.value = '';
              }}
            >
              <option value="">نوع الخط</option>
              {fontOptions.map((font) => (
                <option key={font.key} value={font.key}>
                  {font.label}
                </option>
              ))}
            </select>

            <select
              aria-label="حجم الخط"
              title="حجم الخط"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyStyle('font-size', `${event.target.value}px`);
                event.target.value = '';
              }}
            >
              <option value="">حجم الخط</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>

            <select
              aria-label="سماكة الخط"
              title="سماكة الخط"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyStyle('font-weight', event.target.value);
                event.target.value = '';
              }}
            >
              <option value="">سماكة الخط</option>
              {weights.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </div>

          <div className="tx-group">
            <button type="button" title="عريض" aria-label="عريض" onClick={() => exec('bold')}>
              <b>B</b>
            </button>
            <button type="button" title="مائل" aria-label="مائل" onClick={() => exec('italic')}>
              <i>I</i>
            </button>
            <button type="button" title="تسطير" aria-label="تسطير" onClick={() => exec('underline')}>
              <u>U</u>
            </button>
            <button type="button" title="يتوسطه خط" aria-label="يتوسطه خط" onClick={() => exec('strikeThrough')}>
              <s>S</s>
            </button>
            <label className="tx-color" title="لون الخط">
              <span style={{ color: '#c9500f', fontWeight: 700 }}>A</span>
              <input
                type="color"
                aria-label="لون الخط"
                defaultValue="#12211a"
                onChange={(event) => applyStyle('color', event.target.value)}
              />
            </label>
            <label className="tx-color" title="لون التظليل">
              <span style={{ background: '#fdf0e7', borderRadius: 3, padding: '0 3px' }}>A</span>
              <input
                type="color"
                aria-label="لون التظليل"
                defaultValue="#fdf0e7"
                onChange={(event) => applyStyle('background-color', event.target.value)}
              />
            </label>
          </div>

          <div className="tx-group">
            <button type="button" title="محاذاة لليمين" aria-label="محاذاة لليمين" onClick={() => exec('justifyRight')}>
              <ToolIcon path="M4 6h16M8 10h12M4 14h16M8 18h12" />
            </button>
            <button type="button" title="توسيط" aria-label="توسيط" onClick={() => exec('justifyCenter')}>
              <ToolIcon path="M4 6h16M7 10h10M4 14h16M7 18h10" />
            </button>
            <button type="button" title="محاذاة لليسار" aria-label="محاذاة لليسار" onClick={() => exec('justifyLeft')}>
              <ToolIcon path="M4 6h16M4 10h12M4 14h16M4 18h12" />
            </button>
            <button type="button" title="ضبط" aria-label="ضبط" onClick={() => exec('justifyFull')}>
              <ToolIcon path="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </button>
          </div>

          <div className="tx-group">
            <select
              aria-label="ارتفاع السطر"
              title="ارتفاع السطر"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyStyle('line-height', event.target.value);
                event.target.value = '';
              }}
            >
              <option value="">ارتفاع السطر</option>
              {lineHeights.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              aria-label="تباعد الحروف"
              title="تباعد الحروف"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyStyle('letter-spacing', `${event.target.value}px`);
                event.target.value = '';
              }}
            >
              <option value="">تباعد الحروف</option>
              {letterSpacings.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="tx-group">
            <button type="button" title="قائمة نقطية" aria-label="قائمة نقطية" onClick={() => exec('insertUnorderedList')}>
              <ToolIcon path="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
            </button>
            <button type="button" title="قائمة مرقمة" aria-label="قائمة مرقمة" onClick={() => exec('insertOrderedList')}>
              <ToolIcon path="M10 6h10M10 12h10M10 18h10M4 6h1v2M4 12h2M4 16h1.5a.5.5 0 0 1 0 1H4" />
            </button>
            <button type="button" title="إدراج رابط" aria-label="إدراج رابط" onClick={addLink}>
              <ToolIcon path="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
            </button>
            <button type="button" title="إزالة الرابط" aria-label="إزالة الرابط" onClick={() => exec('unlink')}>
              <ToolIcon path="M3 3l18 18M10 13a5 5 0 0 0 7 0M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 3 8" />
            </button>
          </div>

          <div className="tx-group">
            <button type="button" title="تراجع" aria-label="تراجع" onClick={() => exec('undo')}>
              <ToolIcon path="M9 14L4 9l5-5M4 9h9a6 6 0 0 1 0 12h-3" />
            </button>
            <button type="button" title="إعادة" aria-label="إعادة" onClick={() => exec('redo')}>
              <ToolIcon path="M15 14l5-5-5-5M20 9h-9a6 6 0 0 0 0 12h3" />
            </button>
            <button type="button" title="مسح التنسيق" aria-label="مسح التنسيق" onClick={clearFormatting}>
              <ToolIcon path="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />
            </button>
            <button
              type="button"
              className={source ? 'is-on' : ''}
              title="عرض كود HTML"
              aria-label="عرض كود HTML"
              onClick={toggleSource}
            >
              <ToolIcon path="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
            </button>
          </div>
        </div>

        {source ? (
          <textarea
            className="tx-source"
            dir="ltr"
            value={html}
            rows={rows + 4}
            onChange={(event) => {
              setHtml(event.target.value);
              if (inputRef.current) inputRef.current.value = event.target.value;
            }}
          />
        ) : (
          <div
            ref={editorRef}
            id={name}
            className="tx-editor"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            dir={dir}
            onInput={sync}
          />
        )}

        <div className="tx-foot">
          <span>{notice || help || 'حدّد النص لتطبيق الخط أو اللون أو الحجم.'}</span>
          <span>{source ? 'وضع HTML' : 'محرّر مرئي'}</span>
        </div>
      </div>
    </div>
  );
}
