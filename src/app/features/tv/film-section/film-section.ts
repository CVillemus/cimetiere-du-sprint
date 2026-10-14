import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  untracked,
  viewChild,
  viewChildren,
  WritableSignal,
} from '@angular/core';
import { Film } from '../../../core/films/film.model';
import {
  FILM_SLIDE_LABELS,
  FILM_SLIDE_ORDER,
  FilmSlideKind,
} from '../../../core/navigation/tv-section.model';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { FilmVoteSummary } from '../../../core/voting/film-vote-summary';
import { PartyResultsStore } from '../../../core/voting/party-results.store';
import { CompactViewport } from '../../../shared/utils/compact-viewport';
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

/** Une slide est « visible » quand elle occupe plus de la moitié du carrousel. */
const VISIBLE_SLIDE_THRESHOLD: number = 0.55;

/**
 * Une section verticale « film » : le carrousel horizontal Résumé → Presse → Trailer → Vote.
 * - Sur grand écran : la piste des slides est translatée selon la slide active du store.
 * - Sur écran compact : carrousel natif au doigt, avec aimant ; la slide visible devient
 *   la slide active du store quand le film est à l'écran.
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
  private readonly partyResultsStore: PartyResultsStore = inject(PartyResultsStore);
  private readonly tvNavigator: TvNavigator = inject(TvNavigator);
  private readonly compactViewport: CompactViewport = inject(CompactViewport);

  protected readonly isCompact: Signal<boolean> = this.compactViewport.isCompact;

  private readonly slideTrack: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('slideTrack');
  private readonly slideElements: Signal<readonly ElementRef<HTMLElement>[]> =
    viewChildren<ElementRef<HTMLElement>>('slideElement');

  /** Écran compact : la slide que le doigt a amenée à l'écran. */
  private readonly visibleSlideIndexState: WritableSignal<number> = signal(0);

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

  /**
   * Grand écran : les films qui ne sont pas à l'écran restent sur le Résumé.
   * Écran compact : chaque carrousel garde la slide où on l'a laissé.
   */
  protected readonly activeSlideIndex: Signal<number> = computed((): number => {
    if (this.isCompact()) {
      return this.visibleSlideIndexState();
    }
    return this.isCurrentSection() ? this.tvNavigationStore.currentSlideIndex() : 0;
  });

  /** `null` quand le film n'est pas à l'écran : aucune slide n'y est « active ». */
  protected readonly activeSlideKind: Signal<FilmSlideKind | null> = computed(
    (): FilmSlideKind | null =>
      this.isCurrentSection() ? FILM_SLIDE_ORDER[this.activeSlideIndex()] : null,
  );

  /**
   * L'encart de progression n'apparaît qu'après le premier vote (pas de « 0 / 0 âmes ont voté »).
   * Il gênerait la vidéo et ferait doublon avec la slide Vote : on le cache sur ces deux slides.
   */
  protected readonly isVoteStatusVisible: Signal<boolean> = computed((): boolean => {
    const activeSlideKind: FilmSlideKind | null = this.activeSlideKind();
    const filmVoteSummary: FilmVoteSummary = this.partyResultsStore.filmVoteSummary(this.film().id);
    const hasVotingStarted: boolean = filmVoteSummary.votedCount > 0 || filmVoteSummary.isRevealed;
    return hasVotingStarted && activeSlideKind !== 'trailer' && activeSlideKind !== 'vote';
  });

  protected readonly slideTrackTransform: Signal<string> = computed(
    (): string => `translateX(${-100 * this.activeSlideIndex()}%)`,
  );

  constructor() {
    // Écran compact : on suit la slide visible du carrousel natif.
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      const slideElements: readonly ElementRef<HTMLElement>[] = this.slideElements();
      if (!this.isCompact() || typeof IntersectionObserver === 'undefined') {
        return;
      }
      const visibleSlideObserver: IntersectionObserver = new IntersectionObserver(
        (slideEntries: IntersectionObserverEntry[]) =>
          slideEntries
            .filter((slideEntry: IntersectionObserverEntry): boolean => slideEntry.isIntersecting)
            .forEach((slideEntry: IntersectionObserverEntry) =>
              this.visibleSlideIndexState.set(
                Number((slideEntry.target as HTMLElement).dataset['slideIndex']),
              ),
            ),
        { root: this.slideTrack().nativeElement, threshold: VISIBLE_SLIDE_THRESHOLD },
      );
      slideElements.forEach((slideElement: ElementRef<HTMLElement>) =>
        visibleSlideObserver.observe(slideElement.nativeElement),
      );
      onCleanup(() => visibleSlideObserver.disconnect());
    });

    // Écran compact : quand ce film est à l'écran, sa slide visible devient la slide du store
    // (la bande-annonce ne se lance que sur la slide active, le son du Vote aussi).
    effect(() => {
      const visibleSlideIndex: number = this.visibleSlideIndexState();
      if (!this.isCompact() || !this.isCurrentSection()) {
        return;
      }
      untracked(() => {
        if (this.tvNavigationStore.currentSlideIndex() !== visibleSlideIndex) {
          this.tvNavigationStore.goToSlide(visibleSlideIndex);
        }
      });
    });
  }

  protected selectSlide(slideIndex: number): void {
    if (this.isCompact()) {
      const slideTrackElement: HTMLElement = this.slideTrack().nativeElement;
      slideTrackElement.scrollTo({
        left: slideIndex * slideTrackElement.clientWidth,
        behavior: 'smooth',
      });
      return;
    }
    this.tvNavigator.navigateToSlide(slideIndex);
  }
}
