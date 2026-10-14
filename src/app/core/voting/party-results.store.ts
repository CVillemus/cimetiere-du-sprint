import { Injectable } from '@angular/core';
import { Film, FilmId } from '../films/film.model';
import { FILMS } from '../films/films.data';
import { FilmRanking, rankFilms } from './film-ranking';
import { buildFilmVoteSummary, FilmVoteSummary } from './film-vote-summary';
import { PARTY_RESULTS } from './party-results';
import { FilmVote, Participant, VoteReceipt } from './voting.model';

/**
 * Les résultats de la soirée, en lecture seule : qui était là, ce que chacun a voté,
 * et le classement final. Tous les films sont révélés : les cartes sont déjà retournées.
 */
@Injectable({ providedIn: 'root' })
export class PartyResultsStore {
  readonly partyDate: string = PARTY_RESULTS.partyDate;
  readonly participants: readonly Participant[] = PARTY_RESULTS.participants;
  readonly filmVotes: readonly FilmVote[] = PARTY_RESULTS.filmVotes;

  private readonly voteReceipts: readonly VoteReceipt[] = this.filmVotes.map(
    ({ participantId, filmId }: FilmVote): VoteReceipt => ({ participantId, filmId }),
  );
  private readonly revealedFilmIds: readonly FilmId[] = FILMS.map((film: Film): FilmId => film.id);

  /** Classement de la Sprint Review : moyenne, puis « OHHHHH OUI ! », puis le plus court ; veto à 3 refus. */
  readonly filmRankings: readonly FilmRanking[] = rankFilms(FILMS, this.filmVotes);

  filmVoteSummary(filmId: FilmId): FilmVoteSummary {
    return buildFilmVoteSummary(filmId, {
      participants: this.participants,
      voteReceipts: this.voteReceipts,
      visibleFilmVotes: this.filmVotes,
      revealedFilmIds: this.revealedFilmIds,
    });
  }
}
