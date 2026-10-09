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
import {
  GOTHIC_LETTRINE_HEIGHT,
  GOTHIC_LETTRINE_WIDTH,
  paintGothicLettrine,
} from './gothic-lettrine.scene';

/** La gravure commence peu après l'arrivée et se termine sur le glas de l'orgue (2,5 s). */
const ENGRAVING_DELAY_IN_MILLISECONDS: number = 600;
const ENGRAVING_DURATION_IN_MILLISECONDS: number = 1_900;
const GLINT_CYCLE_IN_MILLISECONDS: number = 5_000;
const GLINT_DURATION_IN_MILLISECONDS: number = 700;
/** Le reflet balaie la diagonale x + y, de juste avant le chiffre à juste après. */
const GLINT_FIRST_DIAGONAL: number = -8;
const GLINT_DIAGONAL_SPAN: number = 70;
/** Environ 12 images par seconde : assez pour le reflet, sans faire chauffer la TV. */
const FRAME_INTERVAL_IN_MILLISECONDS: number = 80;

/**
 * Le « 1 » du film de la soirée : une lettrine gothique enluminée, en pixel art.
 * Le chiffre se grave trait par trait à l'arrivée, puis un reflet doré passe toutes les 5 s.
 */
@Component({
  selector: 'app-gothic-lettrine',
  templateUrl: './gothic-lettrine.html',
  styleUrl: './gothic-lettrine.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GothicLettrine {
  /** La gravure se rejoue à chaque arrivée sur la Sprint Review. */
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  protected readonly canvasWidth: number = GOTHIC_LETTRINE_WIDTH;
  protected readonly canvasHeight: number = GOTHIC_LETTRINE_HEIGHT;

  private readonly lettrineCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('lettrineCanvas');

  constructor() {
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      const lettrinePainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.lettrineCanvas().nativeElement,
      );
      if (lettrinePainter === null) {
        return;
      }
      if (!this.isActive()) {
        paintGothicLettrine(lettrinePainter, 0, null);
        return;
      }
      if (prefersReducedMotion()) {
        paintGothicLettrine(lettrinePainter, 1, null);
        return;
      }

      const engravingStartTime: number = performance.now() + ENGRAVING_DELAY_IN_MILLISECONDS;
      const frameIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
        const elapsedSinceEngravingStart: number = performance.now() - engravingStartTime;
        paintGothicLettrine(
          lettrinePainter,
          // Un peu au-delà de 1 pour que les derniers ornements (ordre 0,9) soient bien gravés.
          Math.min(
            1.01,
            Math.max(0, elapsedSinceEngravingStart / ENGRAVING_DURATION_IN_MILLISECONDS),
          ),
          this.glintDiagonalAt(elapsedSinceEngravingStart - ENGRAVING_DURATION_IN_MILLISECONDS),
        );
      }, FRAME_INTERVAL_IN_MILLISECONDS);
      onCleanup(() => clearInterval(frameIntervalId));
    });
  }

  private glintDiagonalAt(elapsedSinceEngravingEnd: number): number | null {
    if (elapsedSinceEngravingEnd < 0) {
      return null;
    }
    const timeInGlintCycle: number = elapsedSinceEngravingEnd % GLINT_CYCLE_IN_MILLISECONDS;
    if (timeInGlintCycle >= GLINT_DURATION_IN_MILLISECONDS) {
      return null;
    }
    return (
      GLINT_FIRST_DIAGONAL +
      (timeInGlintCycle / GLINT_DURATION_IN_MILLISECONDS) * GLINT_DIAGONAL_SPAN
    );
  }
}
