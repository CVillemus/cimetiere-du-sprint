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
import { TvNavigator } from '../tv-navigator/tv-navigator';
import { VoteStatus } from '../vote-status/vote-status';
import { PressSlide } from './press-slide/press-slide';
import { SummarySlide } from './summary-slide/summary-slide';
import { TrailerSlide } from './trailer-slide/trailer-slide';

interface FilmSlideTab {
  readonly slideKind: FilmSlideKind;
  readonly label: string;
}

/**
 * Une section verticale « film » : le carrousel horizontal Résumé → Trailer → Presse.
 * La piste des slides est translatée selon la slide active du store.
 */
@Component({
  selector: 'app-film-section',
  imports: [SummarySlide, TrailerSlide, PressSlide, VoteStatus],
  templateUrl: './film-section.html',
  styleUrl: './film-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmSection {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
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

  protected readonly isTrailerSlideActive: Signal<boolean> = computed(
    (): boolean =>
      this.isCurrentSection() && FILM_SLIDE_ORDER[this.activeSlideIndex()] === 'trailer',
  );

  protected readonly slideTrackTransform: Signal<string> = computed(
    (): string => `translateX(${-100 * this.activeSlideIndex()}%)`,
  );

  protected selectSlide(slideIndex: number): void {
    this.tvNavigator.navigateToSlide(slideIndex);
  }
}
