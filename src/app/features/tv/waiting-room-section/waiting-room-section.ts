import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { PixelPainter } from '../../../shared/pixel-art/pixel-painter';
import { MASCOT_SNAKE_SKIN, SnakeSkin } from '../../../shared/pixel-art/snake-skins';
import { prefersReducedMotion } from '../../../shared/utils/prefers-reduced-motion';
import { GridCell, SnakeDirection, SnakeGame } from './snake-game';

/** Plateau de 30 × 15 cases de 4 pixels, dans un cadre de 2 pixels. */
const COLUMN_COUNT: number = 30;
const ROW_COUNT: number = 15;
const CELL_SIZE: number = 4;
const FRAME_SIZE: number = 2;
const CANVAS_WIDTH: number = COLUMN_COUNT * CELL_SIZE + FRAME_SIZE * 2;
const CANVAS_HEIGHT: number = ROW_COUNT * CELL_SIZE + FRAME_SIZE * 2;

/** Le serpent accélère un peu à chaque âme dévorée. */
const INITIAL_STEP_IN_MILLISECONDS: number = 130;
const STEP_SPEED_UP_PER_SOUL_IN_MILLISECONDS: number = 3;
const FASTEST_STEP_IN_MILLISECONDS: number = 70;
/** Sans touche pressée pendant 8 s, le serpent repasse en démo et joue tout seul. */
const IDLE_DELAY_BEFORE_DEMO_IN_MILLISECONDS: number = 8_000;
const GAME_OVER_PAUSE_IN_MILLISECONDS: number = 1_400;

const ARROW_DIRECTIONS: Readonly<Record<string, SnakeDirection>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** La mascotte du cimetière : le serpent corail à tête rouge sang. */
const WAITING_ROOM_SNAKE_SKIN: SnakeSkin = MASCOT_SNAKE_SKIN;

interface BoardColors {
  readonly darkCell: string;
  readonly lightCell: string;
  readonly frame: string;
  readonly frameHighlight: string;
  readonly soulFlame: string;
  readonly soulCore: string;
}

/**
 * Section 0 de la TV : la salle d'attente, avant l'arrivée des invités.
 * Une partie de Snake dans le style du cimetière : flèches pour jouer, Entrée pour ouvrir la soirée.
 * Quand personne ne joue, le serpent joue tout seul (mode démo).
 */
@Component({
  selector: 'app-waiting-room-section',
  templateUrl: './waiting-room-section.html',
  styleUrl: './waiting-room-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'steerSnakeWithArrows($event)' },
})
export class WaitingRoomSection {
  private readonly document: Document = inject(DOCUMENT);

  readonly isCurrentSection: InputSignal<boolean> = input.required<boolean>();

  protected readonly canvasWidth: number = CANVAS_WIDTH;
  protected readonly canvasHeight: number = CANVAS_HEIGHT;

  private readonly scoreState: WritableSignal<number> = signal(0);
  private readonly bestScoreState: WritableSignal<number> = signal(0);
  private readonly isDemoState: WritableSignal<boolean> = signal(true);
  private readonly isGameOverState: WritableSignal<boolean> = signal(false);

  protected readonly score: Signal<number> = this.scoreState.asReadonly();
  protected readonly bestScore: Signal<number> = this.bestScoreState.asReadonly();
  protected readonly isDemo: Signal<boolean> = this.isDemoState.asReadonly();
  protected readonly isGameOver: Signal<boolean> = this.isGameOverState.asReadonly();

  private readonly boardCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('boardCanvas');

  private readonly snakeGame: SnakeGame = new SnakeGame(COLUMN_COUNT, ROW_COUNT);
  private lastHumanInputTime: number = Number.NEGATIVE_INFINITY;

  constructor() {
    // La partie ne tourne que quand la salle d'attente est à l'écran.
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      const boardPainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.boardCanvas().nativeElement,
      );
      if (boardPainter === null) {
        return;
      }
      const boardColors: BoardColors = this.readBoardColors();
      this.paintBoard(boardPainter, boardColors, 0);
      if (!this.isCurrentSection() || prefersReducedMotion()) {
        return;
      }
      let stepTimeoutId: ReturnType<typeof setTimeout> | null = null;
      let frameNumber: number = 0;
      const playStep = (): void => {
        frameNumber++;
        this.playOneStep();
        this.paintBoard(boardPainter, boardColors, frameNumber);
        stepTimeoutId = setTimeout(playStep, this.currentStepDuration());
      };
      stepTimeoutId = setTimeout(playStep, INITIAL_STEP_IN_MILLISECONDS);
      onCleanup(() => {
        if (stepTimeoutId !== null) {
          clearTimeout(stepTimeoutId);
        }
      });
    });
  }

  /** Flèches : le joueur reprend la main sur le serpent (même en pleine démo). */
  protected steerSnakeWithArrows(keyboardEvent: KeyboardEvent): void {
    const requestedDirection: SnakeDirection | undefined = ARROW_DIRECTIONS[keyboardEvent.key];
    if (!this.isCurrentSection() || requestedDirection === undefined) {
      return;
    }
    keyboardEvent.preventDefault();
    if (this.isDemoState()) {
      // On reprend une partie neuve : la démo ne compte pas dans le record.
      this.snakeGame.restart();
      this.scoreState.set(0);
      this.isDemoState.set(false);
    }
    this.lastHumanInputTime = performance.now();
    this.snakeGame.steer(requestedDirection);
  }

  private playOneStep(): void {
    if (this.snakeGame.isGameOver) {
      return;
    }
    const isIdle: boolean =
      performance.now() - this.lastHumanInputTime > IDLE_DELAY_BEFORE_DEMO_IN_MILLISECONDS;
    if (isIdle && !this.isDemoState()) {
      this.isDemoState.set(true);
    }
    if (this.isDemoState()) {
      this.snakeGame.steerAutomatically();
    }
    this.snakeGame.advance();
    this.scoreState.set(this.snakeGame.score);
    if (!this.isDemoState() && this.snakeGame.score > this.bestScoreState()) {
      this.bestScoreState.set(this.snakeGame.score);
    }
    if (this.snakeGame.isGameOver) {
      this.isGameOverState.set(true);
      setTimeout(() => {
        this.snakeGame.restart();
        this.scoreState.set(0);
        this.isGameOverState.set(false);
      }, GAME_OVER_PAUSE_IN_MILLISECONDS);
    }
  }

  private currentStepDuration(): number {
    return Math.max(
      FASTEST_STEP_IN_MILLISECONDS,
      INITIAL_STEP_IN_MILLISECONDS - this.snakeGame.score * STEP_SPEED_UP_PER_SOUL_IN_MILLISECONDS,
    );
  }

  private paintBoard(
    boardPainter: PixelPainter,
    boardColors: BoardColors,
    frameNumber: number,
  ): void {
    boardPainter.clear();
    // Cadre de pierre, coins coupés
    boardPainter.fillRect(1, 0, CANVAS_WIDTH - 2, CANVAS_HEIGHT, boardColors.frame);
    boardPainter.fillRect(0, 1, CANVAS_WIDTH, CANVAS_HEIGHT - 2, boardColors.frame);
    boardPainter.fillRect(1, 0, CANVAS_WIDTH - 2, 1, boardColors.frameHighlight);
    // Damier très discret, pour lire la grille
    for (let row: number = 0; row < ROW_COUNT; row++) {
      for (let column: number = 0; column < COLUMN_COUNT; column++) {
        boardPainter.fillRect(
          FRAME_SIZE + column * CELL_SIZE,
          FRAME_SIZE + row * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE,
          (row + column) % 2 === 0 ? boardColors.darkCell : boardColors.lightCell,
        );
      }
    }
    this.paintSoul(boardPainter, boardColors, this.snakeGame.foodCell, frameNumber);
    // Après la collision, le serpent clignote avant de renaître.
    if (!this.snakeGame.isGameOver || frameNumber % 2 === 0) {
      this.paintSnake(boardPainter, frameNumber);
    }
  }

  /** L'âme à dévorer : une petite flamme bleutée qui ondule. */
  private paintSoul(
    boardPainter: PixelPainter,
    boardColors: BoardColors,
    soulCell: GridCell,
    frameNumber: number,
  ): void {
    const left: number = FRAME_SIZE + soulCell.x * CELL_SIZE;
    const top: number = FRAME_SIZE + soulCell.y * CELL_SIZE;
    const sway: number = frameNumber % 4 < 2 ? 0 : 1;
    boardPainter.fillPixel(left + 1 + sway, top, boardColors.soulFlame);
    boardPainter.fillRect(left + 1, top + 1, 2, 2, boardColors.soulFlame);
    boardPainter.fillPixel(left + 1, top + 2, boardColors.soulCore);
    boardPainter.fillRect(left + 1, top + 3, 2, 1, boardColors.soulFlame);
  }

  private paintSnake(boardPainter: PixelPainter, frameNumber: number): void {
    const snakeCells: readonly GridCell[] = this.snakeGame.snakeCells;
    // Du bout de la queue vers la tête : la tête passe par-dessus.
    for (let cellIndex: number = snakeCells.length - 1; cellIndex >= 1; cellIndex--) {
      const ringColor: string =
        WAITING_ROOM_SNAKE_SKIN.ringColors[
          (cellIndex - 1) % WAITING_ROOM_SNAKE_SKIN.ringColors.length
        ];
      const left: number = FRAME_SIZE + snakeCells[cellIndex].x * CELL_SIZE;
      const top: number = FRAME_SIZE + snakeCells[cellIndex].y * CELL_SIZE;
      // Anneaux arrondis : on rogne les coins d'un pixel.
      boardPainter.fillRect(left, top + 1, CELL_SIZE, CELL_SIZE - 2, ringColor);
      boardPainter.fillRect(left + 1, top, CELL_SIZE - 2, CELL_SIZE, ringColor);
    }
    this.paintSnakeHead(boardPainter, snakeCells[0], frameNumber);
  }

  private paintSnakeHead(
    boardPainter: PixelPainter,
    headCell: GridCell,
    frameNumber: number,
  ): void {
    const left: number = FRAME_SIZE + headCell.x * CELL_SIZE;
    const top: number = FRAME_SIZE + headCell.y * CELL_SIZE;
    boardPainter.fillRect(left, top, CELL_SIZE, CELL_SIZE, WAITING_ROOM_SNAKE_SKIN.headColor);
    const direction: SnakeDirection = this.snakeGame.currentDirection;
    const isHorizontal: boolean = direction === 'left' || direction === 'right';
    // Deux yeux tournés vers l'avant
    const eyeOffset: number = direction === 'right' || direction === 'down' ? 2 : 1;
    if (isHorizontal) {
      boardPainter.fillPixel(left + eyeOffset, top, WAITING_ROOM_SNAKE_SKIN.eyeColor);
      boardPainter.fillPixel(left + eyeOffset, top + 3, WAITING_ROOM_SNAKE_SKIN.eyeColor);
    } else {
      boardPainter.fillPixel(left, top + eyeOffset, WAITING_ROOM_SNAKE_SKIN.eyeColor);
      boardPainter.fillPixel(left + 3, top + eyeOffset, WAITING_ROOM_SNAKE_SKIN.eyeColor);
    }
    // La langue sort une image sur trois
    if (frameNumber % 3 !== 0) {
      return;
    }
    const tongueX: number =
      direction === 'right' ? left + CELL_SIZE : direction === 'left' ? left - 2 : left + 1;
    const tongueY: number =
      direction === 'down' ? top + CELL_SIZE : direction === 'up' ? top - 2 : top + 1;
    boardPainter.fillRect(tongueX, tongueY, 2, 2, WAITING_ROOM_SNAKE_SKIN.tongueColor);
  }

  private readBoardColors(): BoardColors {
    const rootStyles: CSSStyleDeclaration = getComputedStyle(this.document.documentElement);
    const readColor = (variableName: string): string =>
      rootStyles.getPropertyValue(variableName).trim();
    return {
      darkCell: readColor('--color-night-deep'),
      lightCell: readColor('--color-night'),
      frame: readColor('--color-violet'),
      frameHighlight: readColor('--color-violet-muted'),
      soulFlame: readColor('--color-fear-text'),
      soulCore: readColor('--color-bone'),
    };
  }
}
