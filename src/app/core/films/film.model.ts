/** Niveau sur 5, affiché en carrés pixel (■■■□□). */
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

/** Identifiant stable d'un film : servira aussi de clé dans la table des votes Supabase. */
export type FilmId =
  | 'heretic'
  | 'get-out'
  | 'conjuring'
  | 'mama'
  | 'sinister'
  | 'heredite'
  | 'ghostland'
  | 'l-orphelinat'
  | 'late-night-with-the-devil'
  | 'his-house';

/** VF : doublée ; VOST : sous-titrée en français ; VO : version originale sans sous-titres. */
export type TrailerLanguage = 'VF' | 'VOST' | 'VO';

/** Date du relevé des notes IMDb, affichée sur la slide Presse. */
export const IMDB_RATINGS_CHECKED_ON: string = 'octobre 2026';

export interface FilmTrailer {
  /**
   * Identifiant YouTube vérifié (titre, chaîne et intégration) via l'API oEmbed.
   * `null` si aucune bande-annonce intégrable n'a été trouvée.
   */
  readonly youtubeVideoId: string | null;
  readonly language: TrailerLanguage;
  readonly triggerWarnings: readonly string[];
}

export interface FilmPressReception {
  /** Identifiant IMDb du film (ex. `tt0230600`) : la source de la note. */
  readonly imdbTitleId: string;
  /** Note IMDb sur 10, relevée à la date `IMDB_RATINGS_CHECKED_ON`. */
  readonly imdbRating: number;
  /** Résumé de la critique écrit par nos soins (pas de citation d'article). */
  readonly reviewSummary: string;
  readonly containsSpoilers: boolean;
}

/** Date du relevé des plateformes sur JustWatch France : l'offre change souvent. */
export const STREAMING_CHECKED_ON: string = 'octobre 2026';

/** Où regarder le film en France (source : JustWatch). */
export interface StreamingAvailability {
  /** Identifiant de la fiche JustWatch (justwatch.com/fr/film/<slug>) : la source. */
  readonly justWatchSlug: string;
  /** Inclus dans un abonnement. */
  readonly subscriptionPlatforms: readonly string[];
  /** Location à l'unité (VOD), en plus de l'abonnement : les trois plateformes les plus connues. */
  readonly rentalPlatforms: readonly string[];
  /** Prix de location le plus bas parmi ces plateformes, ou `null` si le film ne se loue pas. */
  readonly rentalStartingPriceInEuros: number | null;
}

export interface Film {
  readonly id: FilmId;
  readonly frenchTitle: string;
  readonly originalTitle: string;
  readonly releaseYear: number;
  readonly directors: readonly string[];
  readonly durationInMinutes: number;
  readonly fearLevel: IntensityLevel;
  readonly goreLevel: IntensityLevel;
  readonly summary: string;
  readonly triggerWarnings: readonly string[];
  readonly trailer: FilmTrailer;
  readonly pressReception: FilmPressReception;
  readonly streamingAvailability: StreamingAvailability;
}
