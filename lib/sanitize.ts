const allowedTags = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'span',
  'div',
  'hr',
  'sub',
  'sup',
  'small',
  'font',
]);

const allowedStyles = new Set([
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-align',
  'text-transform',
  'color',
  'background-color',
  'line-height',
  'letter-spacing',
]);

const voidTags = new Set(['br', 'hr']);

function cleanStyle(raw: string): string {
  return raw
    .split(';')
    .map((part) => {
      const index = part.indexOf(':');
      if (index === -1) return null;
      const property = part.slice(0, index).trim().toLowerCase();
      const value = part
        .slice(index + 1)
        .trim()
        .replace(/[<>"'{}]/g, '')
        .replace(/expression\s*\(|javascript:|url\s*\(/gi, '');
      if (!allowedStyles.has(property) || !value) return null;
      return `${property}: ${value}`;
    })
    .filter(Boolean)
    .join('; ');
}

function cleanHref(raw: string): string {
  const value = raw.trim();
  if (!/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return '';
  return value.replace(/"/g, '&quot;').replace(/</g, '');
}

/**
 * Keeps the formatting produced by the admin editor (headings, lists, links,
 * colours, font families/sizes) and drops scripts, event handlers and unsafe URLs.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return '';

  let output = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|meta|link|template)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|meta|link|template)\b[^>]*\/?>/gi, '');

  output = output.replace(/<\/?([a-zA-Z][\w-]*)((?:\s+(?:"[^"]*"|'[^']*'|[^"'>])*)?)\/?>/g, (_match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!allowedTags.has(tag)) return '';

    const closing = _match.startsWith('</');
    if (closing) return voidTags.has(tag) ? '' : `</${tag}>`;
    if (voidTags.has(tag)) return `<${tag}>`;

    const attrs: string[] = [];
    const style = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(rawAttrs);
    if (style) {
      const cleaned = cleanStyle(style[1] ?? style[2] ?? '');
      if (cleaned) attrs.push(`style="${cleaned}"`);
    }
    const dir = /\sdir\s*=\s*(?:"(rtl|ltr)"|'(rtl|ltr)')/i.exec(rawAttrs);
    if (dir) attrs.push(`dir="${dir[1] ?? dir[2]}"`);
    if (tag === 'a') {
      const href = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(rawAttrs);
      const safeHref = href ? cleanHref(href[1] ?? href[2] ?? '') : '';
      if (safeHref) {
        attrs.push(`href="${safeHref}"`, 'target="_blank"', 'rel="noopener noreferrer"');
      }
    }

    return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
  });

  return output.trim();
}
