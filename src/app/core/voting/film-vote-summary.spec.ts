import { buildFilmVoteSummary, FilmVoteSummary } from './film-vote-summary';
import { Participant } from './voting.model';

const MORTICIA: Participant = { id: 'participant-1', userId: 'user-1', pseudo: 'Morticia' };
const GOMEZ: Participant = { id: 'participant-2', userId: 'user-2', pseudo: 'Gomez' };

describe('buildFilmVoteSummary', () => {
  it('should not consider everyone has voted when nobody joined', () => {
    const filmVoteSummary: FilmVoteSummary = buildFilmVoteSummary('mama', {
      participants: [],
      voteReceipts: [],
      visibleFilmVotes: [],
      revealedFilmIds: [],
    });

    expect(filmVoteSummary.hasEveryoneVoted).toBe(false);
  });

  it('should wait for every participant before unlocking the vote', () => {
    const filmVoteSummary: FilmVoteSummary = buildFilmVoteSummary('mama', {
      participants: [MORTICIA, GOMEZ],
      voteReceipts: [{ participantId: MORTICIA.id, filmId: 'mama' }],
      visibleFilmVotes: [],
      revealedFilmIds: [],
    });

    expect(filmVoteSummary.votedCount).toBe(1);
    expect(filmVoteSummary.hasEveryoneVoted).toBe(false);
  });

  it('should only count receipts of the requested film', () => {
    const filmVoteSummary: FilmVoteSummary = buildFilmVoteSummary('mama', {
      participants: [MORTICIA],
      voteReceipts: [{ participantId: MORTICIA.id, filmId: 'sinister' }],
      visibleFilmVotes: [],
      revealedFilmIds: [],
    });

    expect(filmVoteSummary.votedCount).toBe(0);
  });

  it('should hide the cards until the film is revealed, then sort them best first', () => {
    const sources = {
      participants: [MORTICIA, GOMEZ],
      voteReceipts: [
        { participantId: MORTICIA.id, filmId: 'mama' as const },
        { participantId: GOMEZ.id, filmId: 'mama' as const },
      ],
      visibleFilmVotes: [
        { participantId: MORTICIA.id, filmId: 'mama' as const, score: 2 as const },
        { participantId: GOMEZ.id, filmId: 'mama' as const, score: 5 as const },
      ],
    };

    expect(
      buildFilmVoteSummary('mama', { ...sources, revealedFilmIds: [] }).revealedVoteCards,
    ).toEqual([]);

    const revealedSummary: FilmVoteSummary = buildFilmVoteSummary('mama', {
      ...sources,
      revealedFilmIds: ['mama'],
    });
    expect(revealedSummary.hasEveryoneVoted).toBe(true);
    expect(revealedSummary.revealedVoteCards.map((card) => card.pseudo)).toEqual([
      'Gomez',
      'Morticia',
    ]);
    expect(revealedSummary.averageScore).toBe(3.5);
  });
});
