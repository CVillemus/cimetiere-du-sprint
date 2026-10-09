import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Film } from '../../../core/films/film.model';
import {
  FILM_SLIDE_LABELS,
  FILM_SLIDE_ORDER,
  FilmSlideKind,
} from '../../../core/navigation/tv-section.model';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { FilmVoteSummary } from '../../../core/voting/film-vote-summary';
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';
import { TvNavigator } from '../tv-navigator/tv-navigator';
import { VoteStatus } from '../vote-status/vote-status';
import { PressSlide } from './press-slide/press-slide';
import { SummarySlide } from './summary-slide/summary-slide';
import { TrailerSlide } from './trailer-slide/trailer-slide';
import { VoteSlide } from './vote-slide/vote-slide';

interface FilmSlideTab {
  readonly slideKind: FilmSlideKind;
  readonly label: string;
}

/**
 * Une section verticale « film » : le carrousel horizontal Résumé → Presse → Trailer → Vote.
 * La piste des slides est translatée selon la slide active du store.
 */
@Component({
  selector: 'app-film-section',
  imports: [SummarySlide, PressSlide, TrailerSlide, VoteSlide, VoteStatus],
  templateUrl: './film-section.html',
  styleUrl: './film-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmSection {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);
  private readonly tvNavigator: TvNavigator = inject(TvNavigator);

  readonly film: InputSignal<Film> = input.required<Film>();
  readonly tombNumber: InputSignal<number> = input.required<number>();
  readonly isCurrentSection: InputSignal<boolean> = input.required<boolean>();

  protected readonly filmCount: number = this.tvNavigationStore.filmCount;

  protected readonly slideTabs: readonly FilmSlideTab[] = FILM_SLIDE_ORDER.map(
    (slideKind: FilmSlideKind): FilmSlideTab => ({
      slideKind,
      label: FILM_SLIDE_LABELS[slideKind],
    }),
  );

  /** Les films qui ne sont pas à l'écran restent sur le Résumé. */
  protected readonly activeSlideIndex: Signal<number> = computed((): number =>
    this.isCurrentSection() ? this.tvNavigationStore.currentSlideIndex() : 0,
  );

  /** `null` quand le film n'est pas à l'écran : aucune slide n'y est « active ». */
  protected readonly activeSlideKind: Signal<FilmSlideKind | null> = computed(
    (): FilmSlideKind | null =>
      this.isCurrentSection() ? FILM_SLIDE_ORDER[this.activeSlideIndex()] : null,
  );

  /** L'encart de progression gênerait la vidéo et ferait doublon avec la slide Vote. */
  protected readonly isVoteStatusVisible: Signal<boolean> = computed((): boolean => {
    const activeSlideKind: FilmSlideKind | null = this.activeSlideKind();
    return activeSlideKind !== 'trailer' && activeSlideKind !== 'vote';
  });

  protected readonly isVoteSlideUnlocked: Signal<boolean> = computed((): boolean => {
    const filmVoteSummary: FilmVoteSummary = this.tvVotingSessionStore.filmVoteSummary(
      this.film().id,
    );
    return filmVoteSummary.hasEveryoneVoted || filmVoteSummary.isRevealed;
  });

  protected readonly slideTrackTransform: Signal<string> = computed(
    (): string => `translateX(${-100 * this.activeSlideIndex()}%)`,
  );

  protected selectSlide(slideIndex: number): void {
    this.tvNavigator.navigateToSlide(slideIndex);
  }
}
