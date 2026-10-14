import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

// Checks that every text colour the page uses on a background meets WCAG 2.1
// AA contrast for normal text (4.5:1). Contrast is one part of AA; headings,
// keyboard access and the phone layout are checked in render.test.ts and by
// reviewing the page.

const css = readFileSync(path.join(import.meta.dirname, 'tokens.css'), 'utf8');

function token(name: string): [number, number, number] {
  const match = new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%;`).exec(css);
  if (!match) throw new Error(`token --${name} not found in tokens.css`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const sat = s / 100;
  const lig = l / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return lig - sat * Math.min(lig, 1 - lig) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: string, bg: string): number {
  const a = luminance(hslToRgb(token(fg)));
  const b = luminance(hslToRgb(token(bg)));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Every text-on-background pair render.ts uses.
const PAIRS: [string, string][] = [
  ['foreground', 'background'],
  ['muted-foreground', 'background'],
  ['foreground', 'muted'], // step titles, principle statement
  ['muted-foreground', 'muted'], // step text, labels, illustration caption
  ['background', 'foreground'], // the primary button
  ['accent-foreground', 'accent'], // draft banner
];

describe('design tokens', () => {
  it('computes contrast correctly (black on white is 21:1)', () => {
    const white = luminance([1, 1, 1]);
    const black = luminance([0, 0, 0]);
    expect((white + 0.05) / (black + 0.05)).toBeCloseTo(21, 5);
  });

  for (const [fg, bg] of PAIRS) {
    it(`${fg} on ${bg} meets AA (4.5:1)`, () => {
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
