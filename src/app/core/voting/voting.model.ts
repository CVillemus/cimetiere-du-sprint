import { FilmId } from '../films/film.model';

export type VoteScore = 1 | 2 | 3 | 4 | 5;

/** Où en est la soirée : salle d'attente (QR code), un film, ou la Sprint Review. */
export type VotingStage = 'lobby' | 'film' | 'sprint-review';

export interface VotingSession {
  readonly id: string;
  readonly hostUserId: string;
  readonly stage: VotingStage;
  readonly currentFilmId: FilmId | null;
  readonly revealedFilmIds: readonly FilmId[];
}

export interface Participant {
  readonly id: string;
  readonly userId: string;
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

export interface FilmVoteToCast {
  readonly sessionId: string;
  readonly participantId: string;
  readonly filmId: FilmId;
  readonly score: VoteScore;
}

/** Erreur métier : un autre participant porte déjà ce pseudo. */
export class PseudoAlreadyTakenError extends Error {
  constructor(readonly pseudo: string) {
    super(`Le pseudo « ${pseudo} » est déjà pris.`);
  }
}
