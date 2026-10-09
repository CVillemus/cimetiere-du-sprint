import { Film, FilmId } from '../films/film.model';
import { FILMS } from '../films/films.data';
import { FilmRanking, rankFilms } from './film-ranking';
import { FilmVote, VoteScore } from './voting.model';

function findFilm(filmId: FilmId): Film {
  const film: Film | undefined = FILMS.find((knownFilm: Film): boolean => knownFilm.id === filmId);
  if (film === undefined) {
    throw new Error(`Film inconnu : ${filmId}`);
  }
  return film;
}

function buildFilmVotes(filmId: FilmId, scores: readonly VoteScore[]): FilmVote[] {
  return scores.map((score: VoteScore, voteIndex: number): FilmVote => ({
    participantId: `participant-${voteIndex}`,
    filmId,
    score,
  }));
}

function rankedFilmIds(filmRankings: readonly FilmRanking[]): FilmId[] {
  return filmRankings.map((filmRanking: FilmRanking): FilmId => filmRanking.film.id);
}

describe('rankFilms', () => {
  it('should rank by average score first', () => {
    const filmRankings: FilmRanking[] = rankFilms(
      [findFilm('mama'), findFilm('get-out')],
      [...buildFilmVotes('mama', [3, 3]), ...buildFilmVotes('get-out', [4, 5])],
    );

    expect(rankedFilmIds(filmRankings)).toEqual(['get-out', 'mama']);
    expect(filmRankings[0].averageScore).toBe(4.5);
  });

  it('should break a tie with the number of « OHHHHH OUI ! »', () => {
    const filmRankings: FilmRanking[] = rankFilms(
      [findFilm('mama'), findFilm('sinister')],
      [...buildFilmVotes('mama', [4, 4]), ...buildFilmVotes('sinister', [5, 3])],
    );

    expect(rankedFilmIds(filmRankings)).toEqual(['sinister', 'mama']);
  });

  it('should break a remaining tie with the shortest film', () => {
    // Ghostland (91 min) est plus court qu'Hérédité (127 min).
    const filmRankings: FilmRanking[] = rankFilms(
      [findFilm('heredite'), findFilm('ghostland')],
      [...buildFilmVotes('heredite', [4]), ...buildFilmVotes('ghostland', [4])],
    );

    expect(rankedFilmIds(filmRankings)).toEqual(['ghostland', 'heredite']);
  });

  it('should send a film with 3 « Hors de question » to the bottom, whatever its average', () => {
    const filmRankings: FilmRanking[] = rankFilms(
      [findFilm('conjuring'), findFilm('mama')],
      [...buildFilmVotes('conjuring', [5, 5, 5, 5, 5, 5, 1, 1, 1]), ...buildFilmVotes('mama', [2])],
    );

    expect(rankedFilmIds(filmRankings)).toEqual(['mama', 'conjuring']);
    expect(filmRankings[1].isVetoed).toBe(true);
  });

  it('should rank films without votes after voted films', () => {
    const filmRankings: FilmRanking[] = rankFilms(
      [findFilm('his-house'), findFilm('mama')],
      buildFilmVotes('mama', [1]),
    );

    expect(rankedFilmIds(filmRankings)).toEqual(['mama', 'his-house']);
    expect(filmRankings[1].averageScore).toBeNull();
  });
});
