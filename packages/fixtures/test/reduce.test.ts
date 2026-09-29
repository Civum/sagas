import { expect, test } from 'vitest';
import { events, stateCuts } from '../fixtures/example-site/events';
import { reduceToStates } from '../src/reduce';

const states = reduceToStates(events, stateCuts);
const [t0, t1, t2, t3] = states as [
  (typeof states)[number],
  (typeof states)[number],
  (typeof states)[number],
  (typeof states)[number],
];

const expect2eq = (a: unknown, b: unknown, _m?: string) => expect(a).toEqual(b);
const expect2deep = (a: unknown, b: unknown, _m?: string) => expect(a).toEqual(b);
const expect2ok = (a: unknown, _m?: string) => expect(Boolean(a)).toBe(true);

const find = (s: typeof t0, id: string) => s.claims.find((c) => c.claim.id === id)!;

test('nothing is ever removed: claim counts are monotonic', () => {
  const counts = [t0, t1, t2, t3].map((s) => s.claims.length);
  for (let i = 1; i < counts.length; i++) expect2ok(counts[i]! >= counts[i - 1]!);
  const ids = [t0, t1, t2, t3].map((s) => new Set(s.claims.map((c) => c.claim.id)));
  for (let i = 1; i < ids.length; i++) {
    for (const id of ids[i - 1]!) expect2ok(ids[i]!.has(id), `${id} disappeared`);
  }
});

test('agreement is never independent support', () => {
  // Two people said "sounds right" and nobody brought a record of their own.
  const afterhours = find(t3, 'cl-afterhours');
  expect2eq(afterhours.affirmations.length, 2, 'the affirmations are recorded');
  expect2eq(afterhours.independentRecordCount, 0, 'but they add no source');
  expect2eq(afterhours.confidence, 'single_source');
});

test('a record somebody else brings is an independent record', () => {
  // Ana extends the boarding claim with a record of her own. The stand-in
  // counts it. Ana and the author are cousins who may have heard one telling,
  // which the stand-in cannot see: that is the open "cousin case", and working
  // it out from the graph is the intelligence layer's job.
  const boarding = find(t1, 'cl-boarding');
  expect2eq(boarding.independentRecordCount, 1);
  expect2eq(boarding.confidence, 'corroborated');
});

test('an untranslated claim is present, pinned, and outside the graph', () => {
  const d1 = find(t1, 'cl-domingo');
  expect2eq(d1.claim.awaitingTranslation, true);
  expect2eq(d1.weight, 0, 'carries no weight until rendered');
  expect2ok(d1.claim.sourceLanguageText, 'the original is preserved and readable');
  expect2eq(d1.claim.sourceLanguage, 'eu');

  const d2 = find(t2, 'cl-domingo');
  expect2eq(d2.claim.awaitingTranslation, false, 'a rendering brings it into the graph');
  expect2ok(d2.weight > 0);
  expect2eq(d2.claim.sourceLanguageText, d1.claim.sourceLanguageText, 'original untouched');
});

test('competing renderings coexist; neither replaces the other', () => {
  const d3 = find(t3, 'cl-domingo');
  expect2eq(d3.translations.length, 2);
  const authors = new Set(d3.translations.map((t) => t.contributorId));
  expect2eq(authors.size, 2, 'each independently attributed');
  expect2eq(d3.translationDisputes.length, 1, 'the objection is preserved, not resolved');
});

test('a dispute targets one detail and leaves the rest of the claim alone', () => {
  const boarding = find(t3, 'cl-boarding');
  const contested = boarding.detailStatuses.filter((e) => e.disputes.length > 0);
  expect2eq(contested.length, 1);
  expect2eq(contested[0]!.detail.kind, 'date');

  const untouched = boarding.detailStatuses.filter((e) => e.disputes.length === 0);
  expect2ok(untouched.some((e) => e.detail.kind === 'place'), 'location stays undisputed');
  expect2ok(untouched.some((e) => e.detail.kind === 'person'));
});

test('competing readings are all kept, in the order they arrived, not by headcount', () => {
  const dateEl = find(t3, 'cl-boarding').detailStatuses.find((e) => e.detail.kind === 'date')!;
  const values = dateEl.competingValues.map((v) => v.value);
  expect2eq(values[0], dateEl.detail.value, 'the claim\'s own reading comes first');
  expect2ok(values.includes('1914') && values.includes('1922'), 'both readings stay visible');
});

test('claims are ordered by weight, and disputed claims are not hidden', () => {
  for (const s of [t0, t1, t2, t3]) {
    const weights = s!.claims.map((c) => c.weight);
    expect2deep(weights, [...weights].sort((a, b) => b - a));
  }
  expect2ok(t3.claims.some((c) => c.confidence === 'contested'), 'contested claims still render');
});

test('every state knows which contributions produced it', () => {
  const prior = new Set(t2.eventIdsApplied);
  for (const id of t3.eventIdsSincePrevious) expect2ok(!prior.has(id));
  expect2eq(
    t3.eventIdsApplied.length,
    t2.eventIdsApplied.length + t3.eventIdsSincePrevious.length,
  );
});

test('integrity rises as the record fills in', () => {
  const scores = [t0, t1, t2, t3].map((s) => s.integrity.overall);
  for (let i = 1; i < scores.length; i++) expect2ok(scores[i]! > scores[i - 1]!);
  expect2ok(t0.integrity.overall < 30, 'sparse site reads as sparse');
  expect2ok(t3.integrity.overall > 70, 'rich site reads as rich');
});

