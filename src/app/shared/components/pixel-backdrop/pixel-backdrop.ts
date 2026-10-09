import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { buildPixelGridPath, PixelGrid } from '../../pixel-art/pixel-grid';
import { prefersReducedMotion } from '../../utils/prefers-reduced-motion';
import {
  PIXEL_BACKDROP_DEFINITIONS,
  PixelBackdropDefinition,
  PixelBackdropKind,
  PixelBackdropStep,
} from './pixel-backdrop.definitions';

/** Hauteur de la zone où l'araignée monte et descend, en pixels « art ». */
const SPIDER_DROP_ZONE_HEIGHT: number = 30;
/** Décale le premier clignement au hasard : tous les crânes ne clignent pas en même temps. */
const MAXIMUM_START_DELAY_IN_MILLISECONDS: number = 3000;

/**
 * Silhouette pixel très discrète en fond d'un panneau, avec une petite animation « idle ».
 * Son opacité vient de la variable CSS globale `--skull-opacity`.
 */
@Component({
  selector: 'app-pixel-backdrop',
  templateUrl: './pixel-backdrop.html',
  styleUrl: './pixel-backdrop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelBackdrop {
  readonly backdropKind: InputSignal<PixelBackdropKind> = input.required<PixelBackdropKind>();

  protected readonly backdropDefinition: Signal<PixelBackdropDefinition> = computed(
    (): PixelBackdropDefinition => PIXEL_BACKDROP_DEFINITIONS[this.backdropKind()],
  );

  private readonly currentFrameIndexState: WritableSignal<number> = signal(0);

  protected readonly currentFramePath: Signal<string> = computed((): string => {
    const currentFrame: PixelGrid =
      this.backdropDefinition().frames[this.currentFrameIndexState()] ??
      this.backdropDefinition().frames[0];
    return buildPixelGridPath(currentFrame);
  });

  protected readonly viewBox: Signal<string> = computed((): string => {
    const backdropDefinition: PixelBackdropDefinition = this.backdropDefinition();
    const frameWidth: number = backdropDefinition.frames[0][0].length;
    const frameHeight: number = backdropDefinition.hangsFromThread
      ? SPIDER_DROP_ZONE_HEIGHT
      : Math.max(...backdropDefinition.frames.map((frame: PixelGrid): number => frame.length));
    return `0 0 ${frameWidth} ${frameHeight}`;
  });

  /** Milieu de l'araignée : là où son fil s'accroche. */
  protected readonly threadX: Signal<number> = computed((): number =>
    Math.floor(this.backdropDefinition().frames[0][0].length / 2),
  );

  protected readonly threadTopY: number = -SPIDER_DROP_ZONE_HEIGHT;
  protected readonly threadHeight: number = SPIDER_DROP_ZONE_HEIGHT;

  constructor() {
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      const backdropDefinition: PixelBackdropDefinition = this.backdropDefinition();
      this.currentFrameIndexState.set(0);
      if (prefersReducedMotion()) {
        return;
      }

      let stepIndex: number = 0;
      let nextStepTimeoutId: ReturnType<typeof setTimeout>;
      const playNextStep = (): void => {
        const step: PixelBackdropStep =
          backdropDefinition.steps[stepIndex % backdropDefinition.steps.length];
        this.currentFrameIndexState.set(step.frameIndex);
        stepIndex++;
        nextStepTimeoutId = setTimeout(playNextStep, step.durationInMilliseconds);
      };
      nextStepTimeoutId = setTimeout(
        playNextStep,
        Math.random() * MAXIMUM_START_DELAY_IN_MILLISECONDS,
      );

      onCleanup(() => clearTimeout(nextStepTimeoutId));
    });
  }
}
