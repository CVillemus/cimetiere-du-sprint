import { describeStreamingOffers, StreamingOffer } from '../../../core/films/streaming-offers';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Film, STREAMING_CHECKED_ON } from '../../../core/films/film.model';
import { TvSoundDesign } from '../../../core/sound/tv-sound-design';
import { FilmRanking, VETO_THRESHOLD } from '../../../core/voting/film-ranking';
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';
import { FilmScene } from '../film-section/film-scene/film-scene';
import { GothicLettrine } from './gothic-lettrine/gothic-lettrine';
import { ReviewSpider } from './review-spider/review-spider';

interface RankedFilm {
  readonly rank: number;
  readonly filmRanking: FilmRanking;
}

/** Les 2e et 3e sont mis en avant dans le reste du classement. */
const RUNNER_UP_MAXIMUM_RANK: number = 3;
/** Avec ce délai, le glas de l'orgue tombe quand la gravure du 1 se termine (2,5 s). */
const WINNER_SOUND_DELAY_IN_SECONDS: number = 0.3;

/**
 * Section finale : l'illustration du film de la soirée, son « 1 » gothique gravé à l'arrivée,
 * où le regarder, puis le reste du classement.
 */
@Component({
  selector: 'app-sprint-review-section',
  imports: [FilmScene, GothicLettrine, ReviewSpider],
  templateUrl: './sprint-review-section.html',
  styleUrl: './sprint-review-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintReviewSection {
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);
  private readonly tvSoundDesign: TvSoundDesign = inject(TvSoundDesign);

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

  /** Le film de la soirée : le premier film voté et non vétoé. */
  protected readonly winningFilm: Signal<FilmRanking | null> = computed(
    (): FilmRanking | null =>
      this.rankedFilms().find(
        (rankedFilm: RankedFilm): boolean =>
          !rankedFilm.filmRanking.isVetoed && rankedFilm.filmRanking.averageScore !== null,
      )?.filmRanking ?? null,
  );

  protected readonly otherRankedFilms: Signal<readonly RankedFilm[]> = computed(
    (): readonly RankedFilm[] =>
      this.rankedFilms().filter(
        (rankedFilm: RankedFilm): boolean => rankedFilm.filmRanking !== this.winningFilm(),
      ),
  );

  protected readonly runnerUpMaximumRank: number = RUNNER_UP_MAXIMUM_RANK;
  protected readonly streamingCheckedOn: string = STREAMING_CHECKED_ON;

  /** Comme sous la bande-annonce : l'abonnement d'abord, puis la location et son prix. */
  protected readonly winnerStreamingOffers: Signal<readonly StreamingOffer[]> = computed(
    (): readonly StreamingOffer[] => {
      const winningFilm: Film | undefined = this.winningFilm()?.film;
      return winningFilm === undefined
        ? []
        : describeStreamingOffers(winningFilm.streamingAvailability);
    },
  );

  /** Le classement est recalculé à chaque vote rechargé : on ne joue l'orgue qu'une fois par visite. */
  private hasPlayedWinnerSoundThisVisit: boolean = false;

  constructor() {
    effect(() => {
      if (!this.isCurrentSection()) {
        this.hasPlayedWinnerSoundThisVisit = false;
        return;
      }
      if (this.winningFilm() !== null && !this.hasPlayedWinnerSoundThisVisit) {
        this.hasPlayedWinnerSoundThisVisit = true;
        this.tvSoundDesign.playWinnerElected(WINNER_SOUND_DELAY_IN_SECONDS);
      }
    });
  }

  protected formatAverageScore(averageScore: number | null): string {
    return averageScore === null ? '–' : averageScore.toFixed(1).replace('.', ',');
  }

  protected formatDuration(durationInMinutes: number): string {
    const hours: number = Math.floor(durationInMinutes / 60);
    const minutes: string = String(durationInMinutes % 60).padStart(2, '0');
    return `${hours}h${minutes}`;
  }
}
