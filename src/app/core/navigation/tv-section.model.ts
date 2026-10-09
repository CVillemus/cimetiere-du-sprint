import { Film } from '../films/film.model';

/** Les 3 slides horizontales d'un film, dans leur ordre d'affichage. */
export type FilmSlideKind = 'summary' | 'trailer' | 'press';

export const FILM_SLIDE_ORDER: readonly FilmSlideKind[] = ['summary', 'trailer', 'press'];

export const FILM_SLIDE_LABELS: Readonly<Record<FilmSlideKind, string>> = {
  summary: 'Résumé',
  trailer: 'Trailer',
  press: 'Presse',
};

/** Une section verticale de la TV : union discriminée sur `kind`. */
export type TvSection =
  | { readonly kind: 'intro' }
  | { readonly kind: 'film'; readonly film: Film; readonly tombNumber: number }
  | { readonly kind: 'sprint-review' };
