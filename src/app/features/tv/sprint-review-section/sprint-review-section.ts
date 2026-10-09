import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { FilmRanking, VETO_THRESHOLD } from '../../../core/voting/film-ranking';
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';
import { FilmScene } from '../film-section/film-scene/film-scene';
import { ReviewSpider } from './review-spider/review-spider';

interface RankedFilm {
  readonly rank: number;
  readonly filmRanking: FilmRanking;
}

const PODIUM_SIZE: number = 3;
/** Ordre d'affichage du podium : 2e à gauche, 1er au centre, 3e à droite. */
const PODIUM_DISPLAY_ORDER: readonly number[] = [2, 1, 3];

/**
 * Section finale : le podium des films, le film de la soirée, puis le reste du classement.
 * Les marches montent une à une quand la section s'affiche (3e, 2e, puis 1er).
 */
@Component({
  selector: 'app-sprint-review-section',
  imports: [FilmScene, ReviewSpider],
  templateUrl: './sprint-review-section.html',
  styleUrl: './sprint-review-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintReviewSection {
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  readonly isCurrentSection: InputSignal<boolean> = input.required<boolean>();

  protected readonly vetoThreshold: number = VETO_THRESHOLD;

  private readonly rankedFilms: Signal<readonly RankedFilm[]> = computed(
    (): readonly RankedFilm[] =>
      this.tvVotingSessionStore
        .filmRankings()
        .map((filmRanking: FilmRanking, rankingIndex: number): RankedFilm => ({
          rank: rankingIndex + 1,
          filmRanking,
        })),
  );

  /** Seuls les films votés et non vétoés peuvent monter sur le podium. */
  private readonly podiumFilms: Signal<readonly RankedFilm[]> = computed(
    (): readonly RankedFilm[] =>
      this.rankedFilms()
        .filter(
          (rankedFilm: RankedFilm): boolean =>
            !rankedFilm.filmRanking.isVetoed && rankedFilm.filmRanking.averageScore !== null,
        )
        .slice(0, PODIUM_SIZE),
  );

  protected readonly podiumSteps: Signal<readonly RankedFilm[]> = computed(
    (): readonly RankedFilm[] =>
      PODIUM_DISPLAY_ORDER.map((rank: number): RankedFilm | undefined =>
        this.podiumFilms().find((rankedFilm: RankedFilm): boolean => rankedFilm.rank === rank),
      ).filter(
        (rankedFilm: RankedFilm | undefined): rankedFilm is RankedFilm => rankedFilm !== undefined,
      ),
  );

  protected readonly winningFilm: Signal<FilmRanking | null> = computed(
    (): FilmRanking | null => this.podiumFilms()[0]?.filmRanking ?? null,
  );

  protected readonly remainingRankedFilms: Signal<readonly RankedFilm[]> = computed(
    (): readonly RankedFilm[] => this.rankedFilms().slice(this.podiumFilms().length),
  );

  protected formatAverageScore(averageScore: number | null): string {
    return averageScore === null ? '–' : averageScore.toFixed(1).replace('.', ',');
  }

  protected formatDuration(durationInMinutes: number): string {
    const hours: number = Math.floor(durationInMinutes / 60);
    const minutes: string = String(durationInMinutes % 60).padStart(2, '0');
    return `${hours}h${minutes}`;
  }
}
