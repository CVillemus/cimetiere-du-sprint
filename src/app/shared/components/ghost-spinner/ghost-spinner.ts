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
import { prefersReducedMotion } from '../../utils/prefers-reduced-motion';

/** Canvas de 32×24 pixels « art », affiché en 10rem × 7,5rem. */
const CANVAS_WIDTH: number = 32;
const CANVAS_HEIGHT: number = 24;
const FRAME_INTERVAL_IN_MILLISECONDS: number = 83;

const GHOST_WIDTH: number = 12;
/** Le fantôme dérive de gauche à droite et revient, en 3,2 s. */
const DRIFT_PERIOD_IN_MILLISECONDS: number = 3_200;
const DRIFT_AMPLITUDE: number = 7;
const BOB_PERIOD_IN_MILLISECONDS: number = 1_100;
const BLINK_PERIOD_IN_MILLISECONDS: number = 2_600;
const BLINK_DURATION_IN_MILLISECONDS: number = 160;
const HEM_WAVE_STEP_IN_MILLISECONDS: number = 200;

/** Les trois petits points d'attente, sous le fantôme : un point s'allume à tour de rôle. */
const WAITING_DOT_CENTERS_X: readonly number[] = [12, 16, 20];
const WAITING_DOT_Y: number = 21;
const WAITING_DOT_STEP_IN_MILLISECONDS: number = 330;

interface GhostSpinnerColors {
  readonly body: string;
  readonly highlight: string;
  readonly face: string;
  readonly idleDot: string;
  readonly activeDot: string;
}

/**
 * Spinner des écrans d'attente du téléphone : un petit fantôme pixel art qui flotte
 * de gauche à droite en regardant où il va, au-dessus de trois points qui s'allument tour à tour.
 * Purement décoratif : le message d'attente reste dans le texte de la page.
 */
@Component({
  selector: 'app-ghost-spinner',
  templateUrl: './ghost-spinner.html',
  styleUrl: './ghost-spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GhostSpinner {
  private readonly document: Document = inject(DOCUMENT);

  protected readonly canvasWidth: number = CANVAS_WIDTH;
  protected readonly canvasHeight: number = CANVAS_HEIGHT;

  private readonly ghostCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('ghostCanvas');

  constructor() {
    const destroyRef: DestroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const ghostPainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.ghostCanvas().nativeElement,
      );
      if (ghostPainter === null) {
        return;
      }
      const ghostSpinnerColors: GhostSpinnerColors = this.readGhostSpinnerColors();
      if (prefersReducedMotion()) {
        this.paintFrame(ghostPainter, ghostSpinnerColors, 0);
        return;
      }
      const startTime: number = performance.now();
      const frameIntervalId: ReturnType<typeof setInterval> = setInterval(
        () => this.paintFrame(ghostPainter, ghostSpinnerColors, performance.now() - startTime),
        FRAME_INTERVAL_IN_MILLISECONDS,
      );
      destroyRef.onDestroy(() => clearInterval(frameIntervalId));
    });
  }

  private paintFrame(
    ghostPainter: PixelPainter,
    ghostSpinnerColors: GhostSpinnerColors,
    elapsedMilliseconds: number,
  ): void {
    ghostPainter.clear();
    const driftAngle: number = (elapsedMilliseconds / DRIFT_PERIOD_IN_MILLISECONDS) * Math.PI * 2;
    const ghostLeft: number = Math.round(
      CANVAS_WIDTH / 2 - GHOST_WIDTH / 2 + Math.sin(driftAngle) * DRIFT_AMPLITUDE,
    );
    const ghostTop: number = Math.round(
      2 + Math.sin((elapsedMilliseconds / BOB_PERIOD_IN_MILLISECONDS) * Math.PI * 2),
    );
    // Il regarde dans le sens où il flotte : la dérivée du sinus donne la direction.
    const driftDirection: number = Math.cos(driftAngle);
    const lookOffset: number = driftDirection > 0.3 ? 1 : driftDirection < -0.3 ? -1 : 0;

    this.paintGhost(
      ghostPainter,
      ghostSpinnerColors,
      ghostLeft,
      ghostTop,
      lookOffset,
      elapsedMilliseconds,
    );
    this.paintWaitingDots(ghostPainter, ghostSpinnerColors, elapsedMilliseconds);
  }

  private paintGhost(
    ghostPainter: PixelPainter,
    ghostSpinnerColors: GhostSpinnerColors,
    left: number,
    top: number,
    lookOffset: number,
    elapsedMilliseconds: number,
  ): void {
    const { body, highlight, face }: GhostSpinnerColors = ghostSpinnerColors;
    // Tête arrondie, corps, et traîne ondulée
    ghostPainter.fillRect(left + 3, top, 6, 1, body);
    ghostPainter.fillRect(left + 1, top + 1, 10, 2, body);
    ghostPainter.fillRect(left, top + 3, GHOST_WIDTH, 9, body);
    const hemPhase: number = Math.floor(elapsedMilliseconds / HEM_WAVE_STEP_IN_MILLISECONDS) % 2;
    for (let hemX: number = 0; hemX < GHOST_WIDTH; hemX += 2) {
      ghostPainter.fillRect(left + hemX + hemPhase, top + 12, 1, 1, body);
    }
    ghostPainter.fillPixel(left + 2, top + 2, highlight);
    ghostPainter.fillPixel(left + 1, top + 3, highlight);

    // Yeux qui clignent, bouche ronde
    const isBlinking: boolean =
      elapsedMilliseconds % BLINK_PERIOD_IN_MILLISECONDS < BLINK_DURATION_IN_MILLISECONDS;
    [3, 7].forEach((eyeOffsetX: number) => {
      if (isBlinking) {
        ghostPainter.fillRect(left + eyeOffsetX + lookOffset, top + 6, 2, 1, face);
      } else {
        ghostPainter.fillRect(left + eyeOffsetX + lookOffset, top + 4, 2, 3, face);
      }
    });
    ghostPainter.fillRect(left + 5 + lookOffset, top + 8, 2, 2, face);
  }

  private paintWaitingDots(
    ghostPainter: PixelPainter,
    ghostSpinnerColors: GhostSpinnerColors,
    elapsedMilliseconds: number,
  ): void {
    const activeDotIndex: number =
      Math.floor(elapsedMilliseconds / WAITING_DOT_STEP_IN_MILLISECONDS) %
      WAITING_DOT_CENTERS_X.length;
    WAITING_DOT_CENTERS_X.forEach((dotX: number, dotIndex: number) => {
      const isActive: boolean = dotIndex === activeDotIndex;
      ghostPainter.fillRect(
        dotX - 1,
        WAITING_DOT_Y - (isActive ? 1 : 0),
        2,
        2,
        isActive ? ghostSpinnerColors.activeDot : ghostSpinnerColors.idleDot,
      );
    });
  }

  private readGhostSpinnerColors(): GhostSpinnerColors {
    const rootStyles: CSSStyleDeclaration = getComputedStyle(this.document.documentElement);
    const readColor = (variableName: string): string =>
      rootStyles.getPropertyValue(variableName).trim();
    return {
      body: readColor('--color-bone-muted'),
      highlight: readColor('--color-bone'),
      face: readColor('--color-night-deep'),
      idleDot: readColor('--color-violet'),
      activeDot: readColor('--color-candle'),
    };
  }
}
