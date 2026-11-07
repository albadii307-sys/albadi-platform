import { defaultTheme, type Theme } from './site-settings';

export function normalizeHex(value: string, fallback: string): string {
  const raw = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw.toLowerCase()}`;
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw
      .split('')
      .map((char) => char + char)
      .join('')
      .toLowerCase()}`;
  }
  return fallback;
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex, '#000000').slice(1);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export function rgbCsv(hex: string): string {
  return hexToRgb(hex).join(', ');
}

export function mix(hex: string, target: string, weight: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  const w = Math.min(1, Math.max(0, weight));
  const channel = (a: number, b: number) => Math.round(a + (b - a) * w);
  return `#${[channel(r1, r2), channel(g1, g2), channel(b1, b2)]
    .map((channelValue) => channelValue.toString(16).padStart(2, '0'))
    .join('')}`;
}

function rgbToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((value) => value / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / delta + 2) / 6;
  else hue = ((r - g) / delta + 4) / 6;
  return [hue, saturation, lightness];
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const channel = (p: number, q: number, t: number) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };
  const q =
    lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  const [r, g, b] = [channel(p, q, hue + 1 / 3), channel(p, q, hue), channel(p, q, hue - 1 / 3)];
  return `#${[r, g, b]
    .map((value) => Math.round(Math.min(1, Math.max(0, value)) * 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

function shade(hex: string, lightness: number, saturation?: number): string {
  const [hue, currentSaturation] = rgbToHsl(hex);
  return hslToHex(hue, Math.min(1, (saturation ?? currentSaturation * 100) / 100), lightness / 100);
}

export function themeCss(theme: Theme): string {
  const primary = normalizeHex(theme.primary, defaultTheme.primary);
  const accent = normalizeHex(theme.accent, defaultTheme.accent);
  const heading = normalizeHex(theme.heading, defaultTheme.heading);
  const background = normalizeHex(theme.background, defaultTheme.background);
  const accentOpacity = Math.min(100, Math.max(0, theme.accentOpacity)) / 100;
  const overlayOpacity = Math.min(100, Math.max(0, theme.overlayOpacity)) / 100;

  const vars: string[] = [
    `--x-primary-rgb:${rgbCsv(primary)}`,
    `--x-accent-rgb:${rgbCsv(accent)}`,
    `--site-heading-color:${heading}`,
    `--x-accent-opacity:${accentOpacity}`,
    `--x-overlay-opacity:${overlayOpacity}`,
  ];

  if (primary !== defaultTheme.primary) {
    vars.push(
      `--x-forest:${shade(primary, 4)}`,
      `--x-forest-2:${primary}`,
      `--x-forest-3:${shade(primary, 12.5, 70)}`,
      `--green-950:${primary}`,
      `--green-900:${shade(primary, 10, 80)}`,
      `--green-800:${shade(primary, 17.5, 66)}`,
      `--green-700:${shade(primary, 22.7, 66)}`,
      `--green-600:${shade(primary, 29, 76)}`,
      `--green-500:${shade(primary, 35.3, 76)}`
    );
  }

  if (accent !== defaultTheme.accent) {
    vars.push(
      `--x-accent:${accent}`,
      `--orange:${accent}`,
      `--x-amber:${shade(accent, 68, 80)}`,
      `--orange-600:${shade(accent, 43, 76)}`,
      `--orange-100:${mix(accent, '#ffffff', 0.92)}`
    );
  }

  if (background !== defaultTheme.background) {
    vars.push(
      `--x-ivory:${background}`,
      `--x-cream:${mix(background, '#ffffff', 0.55)}`,
      `--x-sand:${mix(background, '#000000', 0.06)}`,
      `--site-bg:${background}`
    );
  }

  return `:root{${vars.join(';')}}`;
}
