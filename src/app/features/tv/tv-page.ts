import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  viewChild,
} from '@angular/core';
import { TvNavigationStore } from '../../core/navigation/tv-navigation.store';
import { TvSoundDesign } from '../../core/sound/tv-sound-design';
import { TvSection } from '../../core/navigation/tv-section.model';
import { BatSwarmTransition } from './bat-swarm-transition/bat-swarm-transition';
import { FilmSection } from './film-section/film-section';
import { IntroSection } from './intro-section/intro-section';
import { PixelDripTransition } from '../../shared/components/pixel-drip-transition/pixel-drip-transition';
import { PixelDripTransitionService } from '../../shared/components/pixel-drip-transition/pixel-drip-transition.service';
import { SectionProgress } from './section-progress/section-progress';
import { SprintReviewSection } from './sprint-review-section/sprint-review-section';
import { TvNavigator } from './tv-navigator/tv-navigator';
import { CompactViewport } from '../../shared/utils/compact-viewport';
import { canScrollFurther, VerticalScrollDirection } from '../../shared/utils/vertical-scroll-edge';

/** Un geste de trackpad envoie des dizaines d'événements : on n'en garde qu'un par transition. */
const WHEEL_NAVIGATION_COOLDOWN_IN_MILLISECONDS: number = 1000;
/** En dessous, c'est un effleurement de trackpad, pas une intention de navigation. */
const MINIMUM_WHEEL_DELTA: number = 15;

/** En dessous, c'est un tapotement ou un geste hésitant, pas un balayage. */
const MINIMUM_SWIPE_DISTANCE_IN_PIXELS: number = 50;
/** Un balayage horizontal doit être franchement plus large que haut (et inversement). */
const SWIPE_DOMINANCE_RATIO: number = 1.5;

/** Où le doigt s'est posé, et si le contenu sous lui pouvait encore défiler à ce moment-là. */
interface SwipeStart {
  readonly x: number;
  readonly y: number;
  readonly canScrollForward: boolean;
  readonly canScrollBackward: boolean;
}

/**
 * Page principale : 12 sections plein écran, présentées comme des pages.
 *
 * Pas de scroll de page : la piste des sections est translatée selon la section courante du store.
 * Clavier, molette, clics et balayages au doigt passent par le `TvNavigator`, qui joue chaque
 * changement derrière sa transition (coulure de pixels entre les tombes, nuée de chauves-souris
 * entre les slides).
 *
 * Sur écran compact, une slide plus haute que l'écran défile d'abord à l'intérieur : le balayage
 * vertical ne change de tombe qu'une fois arrivé en bas (ou en haut) du contenu.
 */
@Component({
  selector: 'app-tv-page',
  imports: [
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
    '(document:touchstart)': 'handleSwipeStart($event)',
    '(document:touchend)': 'handleSwipeEnd($event)',
  },
})
export class TvPage {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvNavigator: TvNavigator = inject(TvNavigator);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );
  private readonly tvSoundDesign: TvSoundDesign = inject(TvSoundDesign);
  private readonly compactViewport: CompactViewport = inject(CompactViewport);

  protected readonly isCompact: Signal<boolean> = this.compactViewport.isCompact;

  private readonly pageElement: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('pageElement');

  protected readonly isSoundAwake: Signal<boolean> = this.tvSoundDesign.isAwake;
  protected readonly isSoundMuted: Signal<boolean> = this.tvSoundDesign.isMuted;

  private lastWheelNavigationTimestamp: number = 0;
  private swipeStart: SwipeStart | null = null;

  protected readonly sections: readonly TvSection[] = this.tvNavigationStore.sections;
  protected readonly currentSectionIndex: Signal<number> =
    this.tvNavigationStore.currentSectionIndex;

  protected readonly sectionTrackTransform: Signal<string> = computed(
    (): string => `translateY(calc(-100dvh * ${this.currentSectionIndex()}))`,
  );

  /** Écran compact : le bouton du son remplace la touche M. Le premier appui réveille le son. */
  protected toggleSoundFromButton(): void {
    if (!this.isSoundAwake()) {
      this.tvSoundDesign.wakeUp();
      return;
    }
    this.tvSoundDesign.toggleMute();
  }

  /** Le navigateur n'autorise le son qu'après un geste : la première touche ou le premier clic. */
  protected wakeUpSoundDesign(): void {
    // Écran compact : le son reste coupé tant qu'on n'a pas touché le bouton du son.
    if (this.isCompact()) {
      return;
    }
    this.tvSoundDesign.wakeUp();
  }

  protected handleKeyboardNavigation(keyboardEvent: KeyboardEvent): void {
    this.tvSoundDesign.wakeUp();
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
    // Écran compact : la molette fait d'abord défiler la slide, si elle dépasse de l'écran.
    const wheelDirection: VerticalScrollDirection = wheelEvent.deltaY > 0 ? 'forward' : 'backward';
    if (this.isCompact() && this.canContentScrollUnder(wheelEvent.target, wheelDirection)) {
      return;
    }
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

  /** Écran compact : on retient le point de départ du doigt et l'état du défilement sous lui. */
  protected handleSwipeStart(touchEvent: TouchEvent): void {
    if (!this.isCompact() || touchEvent.touches.length !== 1) {
      this.swipeStart = null;
      return;
    }
    const touch: Touch = touchEvent.touches[0];
    this.swipeStart = {
      x: touch.clientX,
      y: touch.clientY,
      canScrollForward: this.canContentScrollUnder(touchEvent.target, 'forward'),
      canScrollBackward: this.canContentScrollUnder(touchEvent.target, 'backward'),
    };
  }

  /**
   * Balayage horizontal : slide suivante ou précédente.
   * Balayage vertical : tombe suivante ou précédente, sauf si le doigt faisait défiler la slide.
   */
  protected handleSwipeEnd(touchEvent: TouchEvent): void {
    const swipeStart: SwipeStart | null = this.swipeStart;
    this.swipeStart = null;
    if (swipeStart === null || touchEvent.changedTouches.length !== 1) {
      return;
    }
    const touch: Touch = touchEvent.changedTouches[0];
    const horizontalDistance: number = touch.clientX - swipeStart.x;
    const verticalDistance: number = touch.clientY - swipeStart.y;
    const isHorizontalSwipe: boolean =
      Math.abs(horizontalDistance) >= MINIMUM_SWIPE_DISTANCE_IN_PIXELS &&
      Math.abs(horizontalDistance) > SWIPE_DOMINANCE_RATIO * Math.abs(verticalDistance);
    const isVerticalSwipe: boolean =
      Math.abs(verticalDistance) >= MINIMUM_SWIPE_DISTANCE_IN_PIXELS &&
      Math.abs(verticalDistance) > SWIPE_DOMINANCE_RATIO * Math.abs(horizontalDistance);

    // Le doigt part vers la gauche : on avance, comme on tourne une page.
    if (isHorizontalSwipe && horizontalDistance < 0) {
      this.tvNavigator.navigateToNextSlide();
    } else if (isHorizontalSwipe) {
      this.tvNavigator.navigateToPreviousSlide();
    } else if (isVerticalSwipe && verticalDistance < 0 && !swipeStart.canScrollForward) {
      this.tvNavigator.navigateToNextSection();
    } else if (isVerticalSwipe && verticalDistance > 0 && !swipeStart.canScrollBackward) {
      this.tvNavigator.navigateToPreviousSection();
    }
  }

  private canContentScrollUnder(
    target: EventTarget | null,
    direction: VerticalScrollDirection,
  ): boolean {
    return canScrollFurther(
      target instanceof Element ? target : null,
      this.pageElement().nativeElement,
      direction,
    );
  }
}
