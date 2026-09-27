import type { ClaimState } from '@sagas/contracts';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { ElementDisputes } from './ElementDisputes';
import { SourcePanel } from './SourcePanel';
import { TranslationPanel } from './TranslationPanel';

/**
 * One claim, with everything the community has done to it.
 *
 * This is the composition: text, how well supported it is, where people
 * disagree, how it's been rendered, and who said it. Replace the pieces one at
 * a time.
 */
export function ClaimView({ claim }: { claim: ClaimState }) {
  return (
    <article>
      <p>{claim.claim.awaitingTranslation ? claim.claim.sourceLanguageText : claim.claim.text}</p>
      <ConfidenceIndicator claim={claim} />
      <ElementDisputes claim={claim} />
      <TranslationPanel claim={claim} />
      <SourcePanel claim={claim} />
    </article>
  );
}
