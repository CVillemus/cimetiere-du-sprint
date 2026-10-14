import { FilmId } from '../films/film.model';

export type VoteScore = 1 | 2 | 3 | 4 | 5;

export interface Participant {
  readonly id: string;
  readonly pseudo: string;
}

/** « Untel a voté pour ce film », sans le score. */
export interface VoteReceipt {
  readonly participantId: string;
  readonly filmId: FilmId;
}

export interface FilmVote {
  readonly participantId: string;
  readonly filmId: FilmId;
  readonly score: VoteScore;
}
