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
import { TvSoundDesign } from '../../core/sound/tv-sound-design';
import { TvSection } from '../../core/navigation/tv-section.model';
import { BatSwarmTransition } from './bat-swarm-transition/bat-swarm-transition';
import { FilmSection } from './film-section/film-section';
import { IntroSection } from './intro-section/intro-section';
import { WaitingRoomSection } from './waiting-room-section/waiting-room-section';
import { PixelDripTransition } from '../../shared/components/pixel-drip-transition/pixel-drip-transition';
import { PixelDripTransitionService } from '../../shared/components/pixel-drip-transition/pixel-drip-transition.service';
import { SectionProgress } from './section-progress/section-progress';
import { SprintReviewSection } from './sprint-review-section/sprint-review-section';
import { TvNavigator } from './tv-navigator/tv-navigator';

/** Touches réservées au serpent de la salle d'attente (gérées par le composant du jeu). */
const WAITING_ROOM_SNAKE_KEYS: Readonly<Record<string, true>> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
};
/** Un geste de trackpad envoie des dizaines d'événements : on n'en garde qu'un par transition. */
const WHEEL_NAVIGATION_COOLDOWN_IN_MILLISECONDS: number = 1000;
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
  imports: [
    WaitingRoomSection,
    IntroSection,
    FilmSection,
    SprintReviewSection,
    SectionProgress,
    PixelDripTransition,
    BatSwarmTransition,
  ],
  templateUrl: './tv-page.html',
  styleUrl: './tv-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'handleKeyboardNavigation($event)',
    '(document:pointerdown)': 'wakeUpSoundDesign()',
  },
})
export class TvPage {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvNavigator: TvNavigator = inject(TvNavigator);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);
  private readonly tvSoundDesign: TvSoundDesign = inject(TvSoundDesign);

  protected readonly isSoundAwake: Signal<boolean> = this.tvSoundDesign.isAwake;
  protected readonly isSoundMuted: Signal<boolean> = this.tvSoundDesign.isMuted;

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

  /** Le navigateur n'autorise le son qu'après un geste : la première touche ou le premier clic. */
  protected wakeUpSoundDesign(): void {
    this.tvSoundDesign.wakeUp();
  }

  protected handleKeyboardNavigation(keyboardEvent: KeyboardEvent): void {
    this.tvSoundDesign.wakeUp();
    // Salle d'attente : les flèches pilotent le serpent, Entrée ouvre le cimetière.
    if (this.tvNavigationStore.currentSection().kind === 'waiting-room') {
      if (keyboardEvent.key in WAITING_ROOM_SNAKE_KEYS) {
        return;
      }
      if (keyboardEvent.key === 'Enter') {
        keyboardEvent.preventDefault();
        this.tvNavigator.navigateToNextSection();
        return;
      }
    }
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
        this.tvNavigator.forceNavigationToVoteSlide();
        break;
      case 'm':
      case 'M':
        this.tvSoundDesign.toggleMute();
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
