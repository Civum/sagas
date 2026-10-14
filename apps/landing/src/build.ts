import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

import tailwindConfig from '../tailwind.config';
import { content } from './content';
import { renderPage } from './render';

const SRC = import.meta.dirname;

/** Inlines the local `@import './x.css'` lines, so the output is one file. */
async function readCss(file: string): Promise<string> {
  const css = await readFile(file, 'utf8');
  const imports = [...css.matchAll(/^@import '\.\/([\w.-]+\.css)';$/gm)];
  let out = css;
  for (const [line, name] of imports) {
    if (name) out = out.replace(line, await readCss(path.join(SRC, name)));
  }
  return out;
}

/**
 * Builds the static site into `outDir`: index.html and styles.css. This is
 * what gets deployed, and what the build test checks.
 */
export async function buildSite(outDir: string): Promise<{ html: string; css: string }> {
  const html = renderPage(content);
  const result = await postcss([tailwindcss(tailwindConfig)]).process(
    await readCss(path.join(SRC, 'styles.css')),
    { from: undefined },
  );

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html);
  await writeFile(path.join(outDir, 'styles.css'), result.css);
  return { html, css: result.css };
}
