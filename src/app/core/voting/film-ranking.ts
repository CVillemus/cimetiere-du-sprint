import { Film } from '../films/film.model';
import { FilmVote } from './voting.model';

/** À partir de 3 « Hors de question », un film est éliminé du podium, quelle que soit sa moyenne. */
export const VETO_THRESHOLD: number = 3;

const VETO_SCORE: number = 1;
const ENTHUSIASTIC_SCORE: number = 5;

export interface FilmRanking {
  readonly film: Film;
  readonly voteCount: number;
  /** `null` si personne n'a voté pour ce film. */
  readonly averageScore: number | null;
  /** Nombre de « OHHHHH OUI ! » : premier départage. */
  readonly enthusiasticVoteCount: number;
  /** Nombre de « Hors de question ». */
  readonly vetoCount: number;
  readonly isVetoed: boolean;
}

function buildFilmRanking(film: Film, filmVotes: readonly FilmVote[]): FilmRanking {
  const scores: number[] = filmVotes
    .filter((filmVote: FilmVote): boolean => filmVote.filmId === film.id)
    .map((filmVote: FilmVote): number => filmVote.score);
  const vetoCount: number = scores.filter((score: number): boolean => score === VETO_SCORE).length;
  const scoreSum: number = scores.reduce((sum: number, score: number): number => sum + score, 0);
  return {
    film,
    voteCount: scores.length,
    averageScore: scores.length > 0 ? scoreSum / scores.length : null,
    enthusiasticVoteCount: scores.filter((score: number): boolean => score === ENTHUSIASTIC_SCORE)
      .length,
    vetoCount,
    isVetoed: vetoCount >= VETO_THRESHOLD,
  };
}

/** 0 = en tête : films éligibles et votés, puis films sans vote, puis films vétoés. */
function rankingTier(filmRanking: FilmRanking): number {
  if (filmRanking.isVetoed) {
    return 2;
  }
  return filmRanking.averageScore === null ? 1 : 0;
}

/**
 * Classement de la Sprint Review :
 * 1. moyenne des scores ;
 * 2. à égalité, le plus de « OHHHHH OUI ! » ;
 * 3. encore à égalité, le film le plus court (on n'est pas là pour finir à 3 h du matin).
 * Les films vétoés passent en fin de classement.
 */
export function rankFilms(films: readonly Film[], filmVotes: readonly FilmVote[]): FilmRanking[] {
  return films
    .map((film: Film): FilmRanking => buildFilmRanking(film, filmVotes))
    .sort((firstRanking: FilmRanking, secondRanking: FilmRanking): number => {
      const tierDifference: number = rankingTier(firstRanking) - rankingTier(secondRanking);
      if (tierDifference !== 0) {
        return tierDifference;
      }
      const averageDifference: number =
        (secondRanking.averageScore ?? 0) - (firstRanking.averageScore ?? 0);
      if (averageDifference !== 0) {
        return averageDifference;
      }
      const enthusiasmDifference: number =
        secondRanking.enthusiasticVoteCount - firstRanking.enthusiasticVoteCount;
      if (enthusiasmDifference !== 0) {
        return enthusiasmDifference;
      }
      return firstRanking.film.durationInMinutes - secondRanking.film.durationInMinutes;
    });
}
