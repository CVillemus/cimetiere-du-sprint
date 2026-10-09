import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  InputSignal,
  Signal,
  viewChild,
} from '@angular/core';
import { PixelPainter } from '../../../../shared/pixel-art/pixel-painter';
import { prefersReducedMotion } from '../../../../shared/utils/prefers-reduced-motion';
import { pickSnakeSkin, SnakeSkin } from './snake-skins';
import { GridCell, SnakeDirection, SnakeWanderer } from './snake-wanderer';

/** Grille de 64×36 cases de 2×2 pixels : un canvas de 128×72. */
const GRID_COLUMNS: number = 64;
const GRID_ROWS: number = 36;
const CELL_SIZE: number = 2;
const SNAKE_LENGTH: number = 10;

const FIRST_APPEARANCE_DELAY_IN_MILLISECONDS: number = 15_000;
const STEP_INTERVAL_IN_MILLISECONDS: number = 120;
const MINIMUM_WANDERING_DURATION_IN_MILLISECONDS: number = 8_000;
const MAXIMUM_WANDERING_DURATION_IN_MILLISECONDS: number = 25_000;
const MINIMUM_HIDDEN_DURATION_IN_MILLISECONDS: number = 6_000;
const MAXIMUM_HIDDEN_DURATION_IN_MILLISECONDS: number = 30_000;
/** Parfois, le serpent s'arrête net, comme s'il guettait. */
const PAUSE_PROBABILITY_PER_STEP: number = 0.02;
const MAXIMUM_PAUSE_STEP_COUNT: number = 15;
const TONGUE_PROBABILITY_PER_STEP: number = 0.1;

function randomDurationBetween(minimumDuration: number, maximumDuration: number): number {
  return minimumDuration + Math.random() * (maximumDuration - minimumDuration);
}

/**
 * Un serpent pixel qui rôde en fond de l'écran du QR code, avec une robe tirée au sort à chaque apparition.
 * Il apparaît 15 s après l'arrivée sur l'écran, se promène, file par un bord,
 * puis revient à un moment imprévisible.
 */
@Component({
  selector: 'app-intro-snake',
  templateUrl: './intro-snake.html',
  styleUrl: './intro-snake.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroSnake {
  /** Le serpent ne vit que quand l'écran du QR code est affiché. */
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  protected readonly canvasWidth: number = GRID_COLUMNS * CELL_SIZE;
  protected readonly canvasHeight: number = GRID_ROWS * CELL_SIZE;

  private readonly snakeCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('snakeCanvas');

  constructor() {
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      if (!this.isActive() || prefersReducedMotion()) {
        return;
      }
      const snakePainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.snakeCanvas().nativeElement,
      );
      if (snakePainter === null) {
        return;
      }
      const stopSnakeLife: () => void = this.startSnakeLife(snakePainter);
      onCleanup(() => {
        stopSnakeLife();
        snakePainter.clear();
      });
    });
  }

  /** Lance la boucle de vie du serpent ; renvoie la fonction qui arrête tout. */
  private startSnakeLife(snakePainter: PixelPainter): () => void {
    const snakeWanderer: SnakeWanderer = new SnakeWanderer(GRID_COLUMNS, GRID_ROWS, SNAKE_LENGTH);
    let snakeSkin: SnakeSkin = pickSnakeSkin(Math.random());
    let remainingPauseSteps: number = 0;
    let phaseTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleAppearance = (delayInMilliseconds: number): void => {
      phaseTimeoutId = setTimeout(() => {
        // Nouvelle apparition, nouvelle robe.
        snakeSkin = pickSnakeSkin(Math.random());
        snakeWanderer.enterFromRandomEdge();
        phaseTimeoutId = setTimeout(
          () => snakeWanderer.startLeaving(),
          randomDurationBetween(
            MINIMUM_WANDERING_DURATION_IN_MILLISECONDS,
            MAXIMUM_WANDERING_DURATION_IN_MILLISECONDS,
          ),
        );
      }, delayInMilliseconds);
    };

    const stepIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
      if (snakeWanderer.isHidden()) {
        return;
      }
      if (remainingPauseSteps > 0) {
        remainingPauseSteps--;
        return;
      }
      if (snakeWanderer.phase === 'wandering' && Math.random() < PAUSE_PROBABILITY_PER_STEP) {
        remainingPauseSteps = Math.ceil(Math.random() * MAXIMUM_PAUSE_STEP_COUNT);
      }

      snakeWanderer.advance();
      this.paintSnake(snakePainter, snakeWanderer, snakeSkin);

      if (snakeWanderer.isHidden()) {
        scheduleAppearance(
          randomDurationBetween(
            MINIMUM_HIDDEN_DURATION_IN_MILLISECONDS,
            MAXIMUM_HIDDEN_DURATION_IN_MILLISECONDS,
          ),
        );
      }
    }, STEP_INTERVAL_IN_MILLISECONDS);

    scheduleAppearance(FIRST_APPEARANCE_DELAY_IN_MILLISECONDS);

    return (): void => {
      clearInterval(stepIntervalId);
      if (phaseTimeoutId !== null) {
        clearTimeout(phaseTimeoutId);
      }
    };
  }

  private paintSnake(
    snakePainter: PixelPainter,
    snakeWanderer: SnakeWanderer,
    snakeSkin: SnakeSkin,
  ): void {
    snakePainter.clear();
    const bodySegments: readonly GridCell[] = snakeWanderer.bodySegments;

    // De la queue vers la tête, pour que la tête soit dessinée par-dessus.
    for (let segmentIndex: number = bodySegments.length - 1; segmentIndex > 0; segmentIndex--) {
      const segment: GridCell = bodySegments[segmentIndex];
      const isTailTip: boolean = segmentIndex === bodySegments.length - 1;
      const segmentColor: string =
        snakeSkin.ringColors[(segmentIndex - 1) % snakeSkin.ringColors.length];
      if (isTailTip) {
        snakePainter.fillPixel(segment.column * CELL_SIZE, segment.row * CELL_SIZE, segmentColor);
      } else {
        snakePainter.fillRect(
          segment.column * CELL_SIZE,
          segment.row * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE,
          segmentColor,
        );
      }
    }

    const headCell: GridCell | undefined = bodySegments[0];
    if (headCell === undefined) {
      return;
    }
    const headX: number = headCell.column * CELL_SIZE;
    const headY: number = headCell.row * CELL_SIZE;
    snakePainter.fillRect(headX, headY, CELL_SIZE, CELL_SIZE, snakeSkin.headColor);
    snakePainter.fillPixel(headX, headY, snakeSkin.eyeColor);

    if (Math.random() < TONGUE_PROBABILITY_PER_STEP) {
      const tongueOffset: GridCell = this.tongueOffset(snakeWanderer.headDirection);
      snakePainter.fillPixel(
        headX + tongueOffset.column,
        headY + tongueOffset.row,
        snakeSkin.tongueColor,
      );
    }
  }

  /** La langue sort juste devant la tête, dans le sens de la marche. */
  private tongueOffset(headDirection: SnakeDirection): GridCell {
    switch (headDirection) {
      case 'up':
        return { column: 1, row: -1 };
      case 'down':
        return { column: 0, row: CELL_SIZE };
      case 'left':
        return { column: -1, row: 1 };
      case 'right':
        return { column: CELL_SIZE, row: 0 };
    }
  }
}
