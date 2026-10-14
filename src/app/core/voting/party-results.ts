import { Film, FilmId } from '../films/film.model';
import { FILMS } from '../films/films.data';
import { FilmVote, Participant, VoteScore } from './voting.model';
import partyResultsFile from './resultats-de-la-soiree.json';

/** Les votes de la soirée du 10 octobre 2026, figés : le site est une archive, sans back-end. */
export interface PartyResults {
  readonly partyDate: string;
  readonly participants: readonly Participant[];
  readonly filmVotes: readonly FilmVote[];
}

interface RawFilmVote {
  readonly participantId: string;
  readonly filmId: string;
  readonly score: number;
}

const KNOWN_FILM_IDS: ReadonlySet<string> = new Set(FILMS.map((film: Film): FilmId => film.id));

function isFilmId(filmId: string): filmId is FilmId {
  return KNOWN_FILM_IDS.has(filmId);
}

function isVoteScore(score: number): score is VoteScore {
  return Number.isInteger(score) && score >= 1 && score <= 5;
}

/** Lit le fichier exporté de Supabase et refuse toute ligne incohérente (film inconnu, note hors 1-5). */
export function readPartyResults(rawPartyResults: {
  readonly dateDeLaSoiree: string;
  readonly participants: readonly Participant[];
  readonly votes: readonly RawFilmVote[];
}): PartyResults {
  const filmVotes: FilmVote[] = rawPartyResults.votes.map((rawFilmVote: RawFilmVote): FilmVote => {
    const { participantId, filmId, score }: RawFilmVote = rawFilmVote;
    if (!isFilmId(filmId) || !isVoteScore(score)) {
      throw new Error(`Vote archivé invalide : ${filmId} / ${score}`);
    }
    return { participantId, filmId, score };
  });
  return {
    partyDate: rawPartyResults.dateDeLaSoiree,
    participants: rawPartyResults.participants,
    filmVotes,
  };
}

export const PARTY_RESULTS: PartyResults = readPartyResults(partyResultsFile);
