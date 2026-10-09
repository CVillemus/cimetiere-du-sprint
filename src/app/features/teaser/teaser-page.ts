import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { buildCountdown, Countdown, padCountdownUnit } from '../../core/party/countdown';
import { PARTY_DATE_LABEL, PARTY_STARTS_AT } from '../../core/party/party-schedule';
import { PixelBackdrop } from '../../shared/components/pixel-backdrop/pixel-backdrop';
import { PixelPainter } from '../../shared/pixel-art/pixel-painter';
import { prefersReducedMotion } from '../../shared/utils/prefers-reduced-motion';
import {
  paintTeaserLandscape,
  paintTeaserSky,
  TEASER_SCENE_HEIGHT,
  TEASER_SCENE_WIDTH,
} from './teaser-graveyard.scene';
import { TeaserNightAnimator } from './teaser-night-animator';

interface CountdownUnit {
  readonly label: string;
  readonly value: string;
}

const ONE_SECOND_IN_MILLISECONDS: number = 1000;
/** ~10 images par seconde : assez pour que ça vive, assez peu pour garder un rendu pixel art. */
const ANIMATION_FRAME_INTERVAL_IN_MILLISECONDS: number = 100;

/**
 * Page teaser à partager avant la soirée : un seul écran, un cimetière pixel animé,
 * la date et un compte à rebours jusqu'à samedi 18h, dans une carte opaque bien lisible.
 *
 * Le décor est empilé en cinq canvas : ciel, ciel animé (étoiles, nuages), paysage,
 * lumières (bougies qui vacillent en CSS) et créatures (arbre, corbeau, serpent).
 */
@Component({
  selector: 'app-teaser-page',
  imports: [PixelBackdrop],
  templateUrl: './teaser-page.html',
  styleUrl: './teaser-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeaserPage {
  protected readonly partyDateLabel: string = PARTY_DATE_LABEL;
  protected readonly sceneWidth: number = TEASER_SCENE_WIDTH;
  protected readonly sceneHeight: number = TEASER_SCENE_HEIGHT;

  private readonly nowState: WritableSignal<Date> = signal(new Date());

  protected readonly countdown: Signal<Countdown> = computed((): Countdown =>
    buildCountdown(this.nowState(), PARTY_STARTS_AT),
  );

  protected readonly countdownUnits: Signal<readonly CountdownUnit[]> = computed(
    (): readonly CountdownUnit[] => {
      const countdown: Countdown = this.countdown();
      return [
        { label: 'jours', value: padCountdownUnit(countdown.days) },
        { label: 'heures', value: padCountdownUnit(countdown.hours) },
        { label: 'min', value: padCountdownUnit(countdown.minutes) },
        { label: 'sec', value: padCountdownUnit(countdown.seconds) },
      ];
    },
  );

  private readonly skyCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('skyCanvas');
  private readonly skyAnimationCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('skyAnimationCanvas');
  private readonly landscapeCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('landscapeCanvas');
  private readonly lightCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('lightCanvas');
  private readonly creaturesCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('creaturesCanvas');

  constructor() {
    const destroyRef: DestroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.paintStaticScene();
      const stopNightAnimation: () => void = this.startNightAnimation();
      const clockIntervalId: ReturnType<typeof setInterval> = setInterval(
        () => this.nowState.set(new Date()),
        ONE_SECOND_IN_MILLISECONDS,
      );
      destroyRef.onDestroy(() => {
        clearInterval(clockIntervalId);
        stopNightAnimation();
      });
    });
  }

  private paintStaticScene(): void {
    const skyPainter: PixelPainter | null = PixelPainter.fromCanvas(this.skyCanvas().nativeElement);
    const landscapePainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.landscapeCanvas().nativeElement,
    );
    const lightPainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.lightCanvas().nativeElement,
    );
    if (skyPainter === null || landscapePainter === null || lightPainter === null) {
      return;
    }
    paintTeaserSky(skyPainter);
    paintTeaserLandscape(landscapePainter, lightPainter);
  }

  /** Lance la boucle d'animation ; renvoie la fonction qui l'arrête. */
  private startNightAnimation(): () => void {
    const skyAnimationPainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.skyAnimationCanvas().nativeElement,
    );
    const creaturesPainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.creaturesCanvas().nativeElement,
    );
    if (skyAnimationPainter === null || creaturesPainter === null) {
      return (): void => undefined;
    }

    const teaserNightAnimator: TeaserNightAnimator = new TeaserNightAnimator();
    const paintFrame = (elapsedMilliseconds: number): void => {
      teaserNightAnimator.paintSkyAnimation(skyAnimationPainter, elapsedMilliseconds);
      teaserNightAnimator.paintCreatures(creaturesPainter, elapsedMilliseconds);
    };

    // Animations réduites : une seule image, figée.
    if (prefersReducedMotion()) {
      paintFrame(0);
      return (): void => undefined;
    }

    const animationStartTime: number = performance.now();
    let lastFrameTime: number = -ANIMATION_FRAME_INTERVAL_IN_MILLISECONDS;
    let animationFrameId: number = 0;
    const animateFrame = (frameTime: number): void => {
      if (frameTime - lastFrameTime >= ANIMATION_FRAME_INTERVAL_IN_MILLISECONDS) {
        lastFrameTime = frameTime;
        paintFrame(frameTime - animationStartTime);
      }
      animationFrameId = requestAnimationFrame(animateFrame);
    };
    animationFrameId = requestAnimationFrame(animateFrame);
    return (): void => cancelAnimationFrame(animationFrameId);
  }
}
