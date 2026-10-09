import { VETO_THRESHOLD } from '../voting/film-ranking';
import { RevealedVoteCard } from '../voting/film-vote-summary';

/** La couleur du coup de théâtre, selon l'accueil réservé au film. */
export type RevealMood = 'triumph' | 'suspense' | 'disappointment' | 'doom';

const TRIUMPH_MINIMUM_AVERAGE: number = 4;
const SUSPENSE_MINIMUM_AVERAGE: number = 3;
const DISAPPOINTMENT_MINIMUM_AVERAGE: number = 2;
const REFUSAL_SCORE: number = 1;

/**
 * Moyenne ≥ 4 : triomphe ; 3 à 4 : suspense ; 2 à 3 : déception ;
 * moins de 2, ou veto (au moins 3 « Hors de question ») : enterré.
 * Sans vote, on garde le suspense.
 */
export function chooseRevealMood(
  averageScore: number | null,
  revealedVoteCards: readonly RevealedVoteCard[],
): RevealMood {
  const refusalCount: number = revealedVoteCards.filter(
    (revealedVoteCard: RevealedVoteCard): boolean =>
      revealedVoteCard.voteCard.score === REFUSAL_SCORE,
  ).length;
  if (refusalCount >= VETO_THRESHOLD) {
    return 'doom';
  }
  if (averageScore === null) {
    return 'suspense';
  }
  if (averageScore >= TRIUMPH_MINIMUM_AVERAGE) {
    return 'triumph';
  }
  if (averageScore >= SUSPENSE_MINIMUM_AVERAGE) {
    return 'suspense';
  }
  if (averageScore >= DISAPPOINTMENT_MINIMUM_AVERAGE) {
    return 'disappointment';
  }
  return 'doom';
}
