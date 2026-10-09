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
import { PixelPainter } from '../../pixel-art/pixel-painter';
import { MASCOT_SNAKE_SKIN } from '../../pixel-art/snake-skins';
import { prefersReducedMotion } from '../../utils/prefers-reduced-motion';

/** Le serpent fait le tour d'un rectangle de 12 × 7 cases de 2 pixels. */
const CELL_SIZE: number = 2;
const LOOP_COLUMN_COUNT: number = 12;
const LOOP_ROW_COUNT: number = 7;
const MARGIN: number = 2;
const CANVAS_WIDTH: number = LOOP_COLUMN_COUNT * CELL_SIZE + MARGIN * 2;
const CANVAS_HEIGHT: number = LOOP_ROW_COUNT * CELL_SIZE + MARGIN * 2;
const STEP_INTERVAL_IN_MILLISECONDS: number = 90;
/** Il manque trois cases pour boucler le tour : la tête court après sa queue sans jamais l'attraper. */
const GAP_BEHIND_TAIL: number = 3;

interface LoopCell {
  readonly column: number;
  readonly row: number;
}

/** Les cases du tour du rectangle, dans le sens des aiguilles d'une montre, depuis le coin haut gauche. */
function buildLoopPath(): readonly LoopCell[] {
  const loopPath: LoopCell[] = [];
  for (let column: number = 0; column < LOOP_COLUMN_COUNT; column++) {
    loopPath.push({ column, row: 0 });
  }
  for (let row: number = 1; row < LOOP_ROW_COUNT; row++) {
    loopPath.push({ column: LOOP_COLUMN_COUNT - 1, row });
  }
  for (let column: number = LOOP_COLUMN_COUNT - 2; column >= 0; column--) {
    loopPath.push({ column, row: LOOP_ROW_COUNT - 1 });
  }
  for (let row: number = LOOP_ROW_COUNT - 2; row >= 1; row--) {
    loopPath.push({ column: 0, row });
  }
  return loopPath;
}

const LOOP_PATH: readonly LoopCell[] = buildLoopPath();
const SNAKE_LENGTH: number = LOOP_PATH.length - GAP_BEHIND_TAIL;

/**
 * Spinner des écrans d'attente du téléphone : la mascotte fait le tour d'un rectangle
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

  protected readonly canvasWidth: number = CANVAS_WIDTH;
  protected readonly canvasHeight: number = CANVAS_HEIGHT;

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
    // Le chemin, à peine visible, pour qu'on lise le rectangle
    LOOP_PATH.forEach((loopCell: LoopCell) => this.fillCell(snakePainter, loopCell, trackColor));

    const headIndex: number = stepNumber % LOOP_PATH.length;
    for (let ringIndex: number = SNAKE_LENGTH - 1; ringIndex >= 1; ringIndex--) {
      const pathIndex: number = (headIndex - ringIndex + LOOP_PATH.length) % LOOP_PATH.length;
      this.fillCell(
        snakePainter,
        LOOP_PATH[pathIndex],
        MASCOT_SNAKE_SKIN.ringColors[(ringIndex - 1) % MASCOT_SNAKE_SKIN.ringColors.length],
      );
    }
    const headCell: LoopCell = LOOP_PATH[headIndex];
    this.fillCell(snakePainter, headCell, MASCOT_SNAKE_SKIN.headColor);
    snakePainter.fillPixel(
      MARGIN + headCell.column * CELL_SIZE + 1,
      MARGIN + headCell.row * CELL_SIZE,
      MASCOT_SNAKE_SKIN.eyeColor,
    );
    // La gueule s'ouvre une fois sur deux, face à la queue qui s'enfuit.
    if (stepNumber % 2 === 0) {
      const nextCell: LoopCell = LOOP_PATH[(headIndex + 1) % LOOP_PATH.length];
      snakePainter.fillPixel(
        MARGIN + nextCell.column * CELL_SIZE,
        MARGIN + nextCell.row * CELL_SIZE,
        MASCOT_SNAKE_SKIN.tongueColor,
      );
    }
  }

  private fillCell(snakePainter: PixelPainter, loopCell: LoopCell, color: string): void {
    snakePainter.fillRect(
      MARGIN + loopCell.column * CELL_SIZE,
      MARGIN + loopCell.row * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
      color,
    );
  }
}
