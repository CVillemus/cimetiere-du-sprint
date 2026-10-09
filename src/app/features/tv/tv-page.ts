import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Signal,
} from '@angular/core';
import { TvNavigationStore } from '../../core/navigation/tv-navigation.store';
import { TvVotingSessionStore } from '../../core/voting/tv-voting-session.store';
import { TvSection } from '../../core/navigation/tv-section.model';
import { FilmSection } from './film-section/film-section';
import { IntroSection } from './intro-section/intro-section';
import { PixelDripTransition } from './pixel-drip-transition/pixel-drip-transition';
import { PixelDripTransitionService } from './pixel-drip-transition/pixel-drip-transition.service';
import { SectionProgress } from './section-progress/section-progress';
import { SprintReviewSection } from './sprint-review-section/sprint-review-section';
import { TvNavigator } from './tv-navigator/tv-navigator';

/** Un geste de trackpad envoie des dizaines d'événements : on n'en garde qu'un par transition. */
const WHEEL_NAVIGATION_COOLDOWN_IN_MILLISECONDS: number = 1500;
/** En dessous, c'est un effleurement de trackpad, pas une intention de navigation. */
const MINIMUM_WHEEL_DELTA: number = 15;

/**
 * Page projetée sur la TV : 12 sections plein écran.
 *
 * Il n'y a plus de scroll : la piste des sections est simplement translatée selon la section
 * courante du store. Clavier, molette et clics passent par le `TvNavigator`, qui joue chaque
 * changement derrière la coulure de pixels.
 */
@Component({
  selector: 'app-tv-page',
  imports: [IntroSection, FilmSection, SprintReviewSection, SectionProgress, PixelDripTransition],
  templateUrl: './tv-page.html',
  styleUrl: './tv-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'handleKeyboardNavigation($event)' },
})
export class TvPage {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvNavigator: TvNavigator = inject(TvNavigator);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);

  private lastWheelNavigationTimestamp: number = 0;

  protected readonly sections: readonly TvSection[] = this.tvNavigationStore.sections;
  protected readonly currentSectionIndex: Signal<number> =
    this.tvNavigationStore.currentSectionIndex;

  protected readonly sectionTrackTransform: Signal<string> = computed(
    (): string => `translateY(calc(-100dvh * ${this.currentSectionIndex()}))`,
  );

  constructor() {
    afterNextRender(() => void this.tvVotingSessionStore.startHosting());
    inject(DestroyRef).onDestroy(() => this.tvVotingSessionStore.stopHosting());
  }

  protected handleKeyboardNavigation(keyboardEvent: KeyboardEvent): void {
    switch (keyboardEvent.key) {
      case 'ArrowDown':
      case 'PageDown':
        this.tvNavigator.navigateToNextSection();
        break;
      case 'ArrowUp':
      case 'PageUp':
        this.tvNavigator.navigateToPreviousSection();
        break;
      case 'ArrowRight':
        this.tvNavigator.navigateToNextSlide();
        break;
      case 'ArrowLeft':
        this.tvNavigator.navigateToPreviousSlide();
        break;
      case 'Escape':
        this.tvNavigator.navigateToIntroSection();
        break;
      case 'r':
      case 'R':
        void this.tvVotingSessionStore.revealCurrentFilmVotes();
        break;
      default:
        return;
    }
    keyboardEvent.preventDefault();
  }

  /** Un cran de molette = une section (ou une slide si le geste est horizontal). */
  protected handleWheelNavigation(wheelEvent: WheelEvent): void {
    wheelEvent.preventDefault();
    const isWithinCooldown: boolean =
      wheelEvent.timeStamp - this.lastWheelNavigationTimestamp <
      WHEEL_NAVIGATION_COOLDOWN_IN_MILLISECONDS;
    if (this.pixelDripTransitionService.isPlaying() || isWithinCooldown) {
      return;
    }

    const isHorizontalGesture: boolean = Math.abs(wheelEvent.deltaX) > Math.abs(wheelEvent.deltaY);
    const dominantDelta: number = isHorizontalGesture ? wheelEvent.deltaX : wheelEvent.deltaY;
    if (Math.abs(dominantDelta) < MINIMUM_WHEEL_DELTA) {
      return;
    }

    this.lastWheelNavigationTimestamp = wheelEvent.timeStamp;
    if (isHorizontalGesture) {
      if (dominantDelta > 0) {
        this.tvNavigator.navigateToNextSlide();
      } else {
        this.tvNavigator.navigateToPreviousSlide();
      }
    } else if (dominantDelta > 0) {
      this.tvNavigator.navigateToNextSection();
    } else {
      this.tvNavigator.navigateToPreviousSection();
    }
  }
}
