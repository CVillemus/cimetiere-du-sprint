import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  viewChild,
  viewChildren,
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

/** Un geste de trackpad envoie des dizaines d'événements : on n'en garde qu'un par transition. */
const WHEEL_NAVIGATION_COOLDOWN_IN_MILLISECONDS: number = 1000;
/** En dessous, c'est un effleurement de trackpad, pas une intention de navigation. */
const MINIMUM_WHEEL_DELTA: number = 15;

/**
 * La bande « au milieu de l'écran » : la section qui la traverse est la section courante.
 * Une fine bande plutôt qu'un pourcentage visible, car une section peut être plus haute que l'écran.
 */
const CURRENT_SECTION_ROOT_MARGIN: string = '-45% 0px -45% 0px';

/**
 * Page principale : 12 sections plein écran.
 *
 * - Sur grand écran (TV) : pas de scroll, la piste des sections est translatée selon la section
 *   courante du store. Clavier, molette et clics passent par le `TvNavigator`, qui joue chaque
 *   changement derrière la coulure de pixels.
 * - Sur écran compact (téléphone) : défilement natif au doigt, avec aimant. La section qui passe
 *   au milieu de l'écran devient la section courante du store, pour que tout ce qui en dépend
 *   (bande-annonce, sons, animations) suive.
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

  private readonly scrollContainer: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('scrollContainer');
  private readonly sectionElements: Signal<readonly ElementRef<HTMLElement>[]> =
    viewChildren<ElementRef<HTMLElement>>('sectionElement');

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
    // Écran compact : la section qui traverse le milieu de l'écran devient la section courante.
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      const sectionElements: readonly ElementRef<HTMLElement>[] = this.sectionElements();
      if (!this.isCompact() || typeof IntersectionObserver === 'undefined') {
        return;
      }
      const currentSectionObserver: IntersectionObserver = new IntersectionObserver(
        (sectionEntries: IntersectionObserverEntry[]) => {
          const crossingEntry: IntersectionObserverEntry | undefined = sectionEntries.find(
            (sectionEntry: IntersectionObserverEntry): boolean => sectionEntry.isIntersecting,
          );
          if (crossingEntry !== undefined) {
            this.tvNavigationStore.goToSection(
              Number((crossingEntry.target as HTMLElement).dataset['sectionIndex']),
            );
          }
        },
        { root: this.scrollContainer().nativeElement, rootMargin: CURRENT_SECTION_ROOT_MARGIN },
      );
      sectionElements.forEach((sectionElement: ElementRef<HTMLElement>) =>
        currentSectionObserver.observe(sectionElement.nativeElement),
      );
      onCleanup(() => currentSectionObserver.disconnect());
    });
  }

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
    this.tvSoundDesign.wakeUp();
  }

  protected handleKeyboardNavigation(keyboardEvent: KeyboardEvent): void {
    this.tvSoundDesign.wakeUp();
    // Écran compact : on défile au doigt (ou avec les touches natives du navigateur) ; seule M reste.
    if (this.isCompact() && keyboardEvent.key.toLowerCase() !== 'm') {
      return;
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
    // Écran compact : la molette fait défiler la page normalement.
    if (this.isCompact()) {
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
}
