import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Signal,
  viewChild,
} from '@angular/core';
import { PixelPainter, PixelPoint } from '../../pixel-art/pixel-painter';
import { BONE_SNAKE_SKIN, SnakeSkin } from '../../pixel-art/snake-skins';
import { prefersReducedMotion } from '../../utils/prefers-reduced-motion';

/** Le serpent tourne en rond sur un cercle de 9 pixels de rayon, dans un canvas de 24 × 24. */
const CANVAS_SIZE: number = 24;
const CIRCLE_CENTER: number = CANVAS_SIZE / 2;
const CIRCLE_RADIUS: number = 8.5;
/** 32 positions sur le cercle : le serpent avance d'une position à chaque pas. */
const CIRCLE_POSITION_COUNT: number = 32;
const STEP_INTERVAL_IN_MILLISECONDS: number = 70;
/** Il manque quatre positions pour boucler le cercle : la tête court après sa queue. */
const GAP_BEHIND_TAIL: number = 4;
const SNAKE_LENGTH: number = CIRCLE_POSITION_COUNT - GAP_BEHIND_TAIL;
const SPINNER_SNAKE_SKIN: SnakeSkin = BONE_SNAKE_SKIN;

/** Les positions du cercle, dans le sens des aiguilles d'une montre, en partant du haut. */
const CIRCLE_POSITIONS: readonly PixelPoint[] = Array.from(
  { length: CIRCLE_POSITION_COUNT },
  (_: unknown, positionIndex: number): PixelPoint => {
    const angle: number = (positionIndex / CIRCLE_POSITION_COUNT) * Math.PI * 2 - Math.PI / 2;
    return [
      Math.round(CIRCLE_CENTER + Math.cos(angle) * CIRCLE_RADIUS),
      Math.round(CIRCLE_CENTER + Math.sin(angle) * CIRCLE_RADIUS),
    ];
  },
);

/**
 * Spinner des écrans d'attente du téléphone : le serpent d'os tourne en rond
 * en essayant de se mordre la queue. Purement décoratif : le message d'attente reste dans la page.
 */
@Component({
  selector: 'app-snake-spinner',
  templateUrl: './snake-spinner.html',
  styleUrl: './snake-spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnakeSpinner {
  private readonly document: Document = inject(DOCUMENT);

  protected readonly canvasSize: number = CANVAS_SIZE;

  private readonly snakeCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('snakeCanvas');

  constructor() {
    const destroyRef: DestroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const snakePainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.snakeCanvas().nativeElement,
      );
      if (snakePainter === null) {
        return;
      }
      const trackColor: string = getComputedStyle(this.document.documentElement)
        .getPropertyValue('--color-night')
        .trim();
      if (prefersReducedMotion()) {
        this.paintFrame(snakePainter, trackColor, 0);
        return;
      }
      let stepNumber: number = 0;
      const stepIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
        stepNumber++;
        this.paintFrame(snakePainter, trackColor, stepNumber);
      }, STEP_INTERVAL_IN_MILLISECONDS);
      destroyRef.onDestroy(() => clearInterval(stepIntervalId));
    });
  }

  private paintFrame(snakePainter: PixelPainter, trackColor: string, stepNumber: number): void {
    snakePainter.clear();
    // Le cercle, à peine visible, pour qu'on lise la trajectoire
    CIRCLE_POSITIONS.forEach(([x, y]: PixelPoint) =>
      snakePainter.fillRect(x - 1, y - 1, 2, 2, trackColor),
    );

    const headIndex: number = stepNumber % CIRCLE_POSITION_COUNT;
    for (let ringIndex: number = SNAKE_LENGTH - 1; ringIndex >= 1; ringIndex--) {
      const [x, y]: PixelPoint =
        CIRCLE_POSITIONS[(headIndex - ringIndex + CIRCLE_POSITION_COUNT) % CIRCLE_POSITION_COUNT];
      snakePainter.fillRect(
        x - 1,
        y - 1,
        2,
        2,
        SPINNER_SNAKE_SKIN.ringColors[(ringIndex - 1) % SPINNER_SNAKE_SKIN.ringColors.length],
      );
    }

    // Tête un peu plus grosse, œil rouge, langue qui sort une fois sur deux vers la queue
    const [headX, headY]: PixelPoint = CIRCLE_POSITIONS[headIndex];
    snakePainter.fillRect(headX - 1, headY - 1, 3, 3, SPINNER_SNAKE_SKIN.headColor);
    snakePainter.fillPixel(headX, headY, SPINNER_SNAKE_SKIN.eyeColor);
    if (stepNumber % 2 === 0) {
      const [tongueX, tongueY]: PixelPoint =
        CIRCLE_POSITIONS[(headIndex + 1) % CIRCLE_POSITION_COUNT];
      snakePainter.fillPixel(tongueX, tongueY, SPINNER_SNAKE_SKIN.tongueColor);
    }
  }
}
