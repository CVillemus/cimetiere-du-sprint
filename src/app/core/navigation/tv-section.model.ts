import { Film } from '../films/film.model';

/** Les 4 slides horizontales d'un film, dans leur ordre d'affichage. */
export type FilmSlideKind = 'summary' | 'press' | 'trailer' | 'vote';

export const FILM_SLIDE_ORDER: readonly FilmSlideKind[] = ['summary', 'press', 'trailer', 'vote'];

export const FILM_SLIDE_LABELS: Readonly<Record<FilmSlideKind, string>> = {
  summary: 'Résumé',
  press: 'Presse',
  trailer: 'Trailer',
  vote: 'Vote',
};

/** Index de la slide Vote : elle reste verrouillée tant que tout le monde n'a pas voté. */
export const VOTE_SLIDE_INDEX: number = FILM_SLIDE_ORDER.indexOf('vote');

/** Une section verticale de la TV : union discriminée sur `kind`. */
export type TvSection =
  | { readonly kind: 'intro' }
  | { readonly kind: 'film'; readonly film: Film; readonly tombNumber: number }
  | { readonly kind: 'sprint-review' };
