/** Niveau sur 5, affiché en carrés pixel (■■■□□). */
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

/** Identifiant stable d'un film : servira aussi de clé dans la table des votes Supabase. */
export type FilmId =
  | 'les-autres'
  | 'get-out'
  | 'conjuring'
  | 'mama'
  | 'sinister'
  | 'heredite'
  | 'ghostland'
  | 'l-orphelinat'
  | 'late-night-with-the-devil'
  | 'his-house';

export interface FilmTrailer {
  /** `null` tant que l'identifiant de la bande-annonce officielle n'a pas été vérifié. */
  readonly youtubeVideoId: string | null;
  readonly triggerWarnings: readonly string[];
}

export interface FilmPressReception {
  /** Note IMDb approximative, sur 10. */
  readonly imdbRating: number;
  /** Résumé de la critique écrit par nos soins (pas de citation d'article). */
  readonly reviewSummary: string;
  readonly containsSpoilers: boolean;
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
}
