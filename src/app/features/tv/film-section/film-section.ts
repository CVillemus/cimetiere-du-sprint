import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  viewChild,
} from '@angular/core';
import { Film } from '../../../core/films/film.model';
import {
  FILM_SLIDE_LABELS,
  FILM_SLIDE_ORDER,
  FilmSlideKind,
} from '../../../core/navigation/tv-section.model';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { PressSlide } from './press-slide/press-slide';
import { SummarySlide } from './summary-slide/summary-slide';
import { TrailerSlide } from './trailer-slide/trailer-slide';

interface FilmSlideTab {
  readonly slideKind: FilmSlideKind;
  readonly label: string;
}

/**
 * Une section verticale « film » : contient le carrousel horizontal Résumé → Trailer → Presse.
 * Même principe que la TvPage, sur l'axe horizontal : le store décide, le scroll suit.
 */
@Component({
  selector: 'app-film-section',
  imports: [SummarySlide, TrailerSlide, PressSlide],
  templateUrl: './film-section.html',
  styleUrl: './film-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmSection {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);

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

  private readonly slideTrack: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('slideTrack');

  constructor() {
    afterRenderEffect(() => {
      const slideTrackElement: HTMLElement = this.slideTrack().nativeElement;
      const targetScrollLeft: number = this.activeSlideIndex() * slideTrackElement.clientWidth;
      if (Math.abs(slideTrackElement.scrollLeft - targetScrollLeft) < 1) {
        return;
      }
      slideTrackElement.scrollTo({
        left: targetScrollLeft,
        // Hors écran, on revient au Résumé sans animation.
        behavior: this.isCurrentSection() ? 'smooth' : 'instant',
      });
    });
  }

  protected selectSlide(slideIndex: number): void {
    this.tvNavigationStore.goToSlide(slideIndex);
  }

  /** Fin d'un scroll horizontal manuel (trackpad, swipe) : on informe le store. */
  protected handleSlideTrackScrollEnd(): void {
    if (!this.isCurrentSection()) {
      return;
    }
    const slideTrackElement: HTMLElement = this.slideTrack().nativeElement;
    const visibleSlideIndex: number = Math.round(
      slideTrackElement.scrollLeft / slideTrackElement.clientWidth,
    );
    this.tvNavigationStore.syncSlideFromScroll(visibleSlideIndex);
  }
}
