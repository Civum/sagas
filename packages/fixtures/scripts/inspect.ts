/**
 * Why does a claim score what it scores?
 *
 *   pnpm inspect                     every claim at t3, one line each
 *   pnpm inspect cl-boarding         one claim, with its inputs
 *   pnpm inspect --state t1          a different snapshot
 *   pnpm inspect --state t1 cl-boarding
 *
 * This prints what went into a score rather than just the score. A number on
 * its own tells you nothing about whether your scoring is right; the inputs
 * next to it tell you whether the number is defensible.
 */

import { loadState } from '../acceptance';
import { computeWeight, classifyConfidence } from '../src/weight';
import type { ClaimState, GraphState } from '@sagas/contracts';

const argv = process.argv.slice(2);
const stateFlag = argv.indexOf('--state');
const stateId = stateFlag === -1 ? 't3' : (argv[stateFlag + 1] ?? 't3');
const stateValueIndex = stateFlag === -1 ? -1 : stateFlag + 1;
const claimId = argv.find((a, i) => !a.startsWith('--') && i !== stateValueIndex);

const state: GraphState = loadState(stateId);

function inputsFor(c: ClaimState) {
  // Source-type diversity counts this claim plus everything added onto it, the
  // same way the reducer does. Getting this wrong makes the recomputed weight
  // disagree with the stored one, which makes the whole tool a liar.
  const extensionTypes = c.extensions
    .map((id) => state.claims.find((x) => x.claim.id === id)?.claim.sourceType)
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return {
    sourceType: c.claim.sourceType,
    independentLineageCount: c.independentLineageCount,
    affirmationCount: c.affirmations.length,
    extensionCount: c.extensions.length,
    disputeCount: c.elementStatuses.reduce((n, e) => n + e.disputes.length, 0),
    sourceTypeDiversity: new Set([c.claim.sourceType, ...extensionTypes]).size,
    awaitingTranslation: c.claim.awaitingTranslation,
  };
}

function one(c: ClaimState) {
  const i = inputsFor(c);
  const line = (k: string, v: string | number | boolean, note = '') =>
    console.log(`  ${k.padEnd(26)} ${String(v).padEnd(20)} ${note}`);

  console.log('\n' + '='.repeat(72));
  console.log(`${c.claim.id}   ${state.stateId}`);
  console.log('='.repeat(72));
  console.log(`  ${c.contributor.displayName}${c.contributor.fictional ? '  (invented)' : ''}`);
  const text = c.claim.awaitingTranslation ? c.claim.sourceLanguageText : c.claim.text;
  console.log(`  "${(text ?? '').slice(0, 120)}${(text ?? '').length > 120 ? '...' : ''}"`);

  console.log('\n  WHAT WENT IN');
  line('sourceType', i.sourceType);
  line('independent family lines', i.independentLineageCount,
    i.independentLineageCount === 0 ? 'nobody outside the author\'s family' : '');
  line('affirmations', i.affirmationCount,
    i.affirmationCount > 0 && i.independentLineageCount === 0
      ? 'people agreed, none independently' : '');
  line('extensions', i.extensionCount);
  line('disputes', i.disputeCount);
  line('awaiting translation', i.awaitingTranslation);
  line('source type diversity', i.sourceTypeDiversity,
    i.sourceTypeDiversity > 1 ? 'different kinds of source agree' : '');

  console.log('\n  WHAT CAME OUT');
  const recomputed = computeWeight(i);
  line('weight', recomputed.toFixed(2),
    Math.abs(recomputed - c.weight) > 0.001
      ? `MISMATCH. Stored is ${c.weight.toFixed(2)}. Regenerate the states.`
      : 'matches the stored value');
  line('confidence', classifyConfidence({
    independentLineageCount: i.independentLineageCount,
    disputeCount: i.disputeCount,
    awaitingTranslation: i.awaitingTranslation,
  }), `stored: ${c.confidence}`);

  const contested = c.elementStatuses.filter((e) => e.disputes.length > 0);
  if (contested.length) {
    console.log('\n  WHERE PEOPLE DISAGREE');
    for (const e of contested) {
      const readings = e.competingValues
        .map((v) => `"${v.value}" (${v.count} line${v.count === 1 ? '' : 's'})`)
        .join('  vs  ');
      console.log(`    ${e.element.kind}: ${readings}`);
    }
  }
}

if (claimId) {
  const c = state.claims.find((x) => x.claim.id === claimId);
  if (!c) {
    console.error(`No claim "${claimId}" in ${stateId}. Available:`);
    for (const x of state.claims) console.error(`  ${x.claim.id}`);
    process.exit(1);
  }
  one(c);
} else {
  console.log(`\n${state.stateId}  ${state.label}\n`);
  console.log('  weight  lines  affirm  disputes  confidence          claim');
  for (const c of state.claims) {
    const i = inputsFor(c);
    console.log(
      `  ${c.weight.toFixed(2).padStart(6)}` +
      `  ${String(i.independentLineageCount).padStart(5)}` +
      `  ${String(i.affirmationCount).padStart(6)}` +
      `  ${String(i.disputeCount).padStart(8)}` +
      `  ${c.confidence.padEnd(18)}  ${c.claim.id}`,
    );
  }
  console.log('\n  pnpm inspect <claim-id> for one of them in full.\n');
}
