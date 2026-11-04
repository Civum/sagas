// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { loadSiteState } from '@sagas/fixtures/acceptance';
import { ArticleView } from './ArticleView';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
type HistoryState = 't0' | 't1' | 't2' | 't3';
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

function showState(state: HistoryState): HTMLDivElement {
  if (!container || !root) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  const currentRoot = root;
  act(() => currentRoot.render(<ArticleView state={loadSiteState('corner-shop', state)} />));
  return container;
}

function phrase(page: HTMLElement, words: string): HTMLButtonElement {
  const button = [...page.querySelectorAll('button')].find((item) => item.textContent === words);
  if (!button) throw new Error(`missing phrase button: ${words}`);
  return button;
}

function openedPhrases(page: HTMLElement): (string | null)[] {
  return [...page.querySelectorAll('button[aria-expanded="true"]')].map((button) => button.textContent);
}

function shownClaims(page: HTMLElement): (string | null)[] {
  return [...page.querySelectorAll('[aria-label="Claims behind this phrase"] [data-claim-id]')].map(
    (element) => element.getAttribute('data-claim-id'),
  );
}

describe('phrase interactions', () => {
  it('closes a phrase and returns focus to its button', () => {
    const page = showState('t3');
    act(() => phrase(page, 'Mr. Ferris').click());
    expect(openedPhrases(page)).toEqual(['Mr. Ferris']);
    expect(shownClaims(page).sort()).toEqual(['cl-cs-shop', 'cl-cs-uncle']);

    const back = [...page.querySelectorAll('button')].find((button) => button.textContent === 'Back to passage');
    if (!back) throw new Error('missing Back to passage button');
    act(() => back.click());
    expect(openedPhrases(page)).toEqual([]);
    expect(shownClaims(page)).toEqual([]);
    expect(document.activeElement).toBe(phrase(page, 'Mr. Ferris'));
  });

  it('closes an open phrase when the history state changes', () => {
    let page = showState('t1');
    act(() => phrase(page, 'around 1950').click());
    expect(openedPhrases(page)).toEqual(['around 1950']);
    page = showState('t2');
    expect(openedPhrases(page)).toEqual([]);
    expect(shownClaims(page)).toEqual([]);

    act(() => phrase(page, 'Mr. Ferris').click());
    page = showState('t3');
    expect(openedPhrases(page)).toEqual([]);
    expect(shownClaims(page)).toEqual([]);
  });
});
