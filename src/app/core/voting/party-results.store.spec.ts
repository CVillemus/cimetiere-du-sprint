import { TestBed } from '@angular/core/testing';
import { FILMS } from '../films/films.data';
import { FilmRanking } from './film-ranking';
import { readPartyResults } from './party-results';
import { PartyResultsStore } from './party-results.store';

describe('PartyResultsStore', () => {
  let partyResultsStore: PartyResultsStore;

  beforeEach(() => {
    partyResultsStore = TestBed.inject(PartyResultsStore);
  });

  it('should keep the 9 souls and one vote per soul and per film', () => {
    expect(partyResultsStore.participants.length).toBe(9);
    expect(partyResultsStore.filmVotes.length).toBe(9 * FILMS.length);
  });

  it('should crown Hérédité, then Late Night with the Devil and Sinister', () => {
    const podiumFilmIds: string[] = partyResultsStore.filmRankings
      .slice(0, 3)
      .map((filmRanking: FilmRanking): string => filmRanking.film.id);

    expect(podiumFilmIds).toEqual(['heredite', 'late-night-with-the-devil', 'sinister']);
  });

  it('should veto Get Out, buried under six « Hors de question »', () => {
    const getOutRanking: FilmRanking | undefined = partyResultsStore.filmRankings.find(
      (filmRanking: FilmRanking): boolean => filmRanking.film.id === 'get-out',
    );

    expect(getOutRanking?.isVetoed).toBe(true);
    expect(getOutRanking?.vetoCount).toBe(6);
  });

  it('should show every film as revealed, with its average', () => {
    expect(partyResultsStore.filmVoteSummary('heredite').isRevealed).toBe(true);
    expect(partyResultsStore.filmVoteSummary('heredite').averageScore).toBeCloseTo(37 / 9);
  });

  it('should refuse an archived vote for an unknown film', () => {
    expect(() =>
      readPartyResults({
        dateDeLaSoiree: '2026-10-10',
        participants: [],
        votes: [{ participantId: 'x', filmId: 'scream', score: 5 }],
      }),
    ).toThrow();
  });
});
