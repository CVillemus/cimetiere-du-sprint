import { findVoteCard } from '../voting/vote-card.model';
import { RevealedVoteCard } from '../voting/film-vote-summary';
import { VoteScore } from '../voting/voting.model';
import { chooseRevealMood } from './reveal-mood';

function revealedCards(...scores: VoteScore[]): readonly RevealedVoteCard[] {
  return scores.map((score: VoteScore, cardIndex: number): RevealedVoteCard => ({
    pseudo: `Âme ${cardIndex}`,
    voteCard: findVoteCard(score),
  }));
}

describe('chooseRevealMood', () => {
  it('should celebrate a film averaging 4 or more', () => {
    expect(chooseRevealMood(4.2, revealedCards(5, 4, 4))).toBe('triumph');
  });

  it('should keep the suspense between 3 and 4', () => {
    expect(chooseRevealMood(3.5, revealedCards(4, 3))).toBe('suspense');
  });

  it('should sound disappointed between 2 and 3', () => {
    expect(chooseRevealMood(2.5, revealedCards(3, 2))).toBe('disappointment');
  });

  it('should bury a film averaging less than 2', () => {
    expect(chooseRevealMood(1.5, revealedCards(2, 1))).toBe('doom');
  });

  it('should bury a vetoed film even with a good average', () => {
    expect(chooseRevealMood(3.25, revealedCards(5, 5, 5, 5, 5, 1, 1, 1))).toBe('doom');
  });

  it('should keep the suspense when nobody voted', () => {
    expect(chooseRevealMood(null, [])).toBe('suspense');
  });
});
