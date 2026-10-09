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
import { prefersReducedMotion } from '../../../shared/utils/prefers-reduced-motion';
import { createDripFront, Drip, DripFront } from './drip-front';
import {
  PixelDripTransitionPlayer,
  PixelDripTransitionService,
} from './pixel-drip-transition.service';

/** Gros pixels : 64×36 sur tout l'écran (16:9). */
const GRID_WIDTH: number = 64;
const GRID_HEIGHT: number = 36;
/** 1,2 s au total : 600 ms pour couvrir, 600 ms pour découvrir. */
const HALF_DURATION_IN_MILLISECONDS: number = 600;
/** ~30 images/s : un rendu volontairement saccadé, plus « jeu rétro ». */
const FRAME_INTERVAL_IN_MILLISECONDS: number = 33;
const MAXIMUM_LAG: number = GRID_HEIGHT * 0.65;
const DITHER_BAND_HEIGHT: number = 3;

/** Matrice de Bayer 4×4 : seuils de tramage ordonné, entre 0 et 1. */
const BAYER_THRESHOLDS: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((bayerRow: number[]): number[] =>
  bayerRow.map((bayerValue: number): number => (bayerValue + 0.5) / 16),
);

interface DripColors {
  readonly body: string;
  readonly texture: string;
  readonly edge: string;
  readonly gloss: string;
}

const easeInOutCubic = (progress: number): number =>
  progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
const easeInCubic = (progress: number): number => progress ** 3;

/**
 * Transition « sang séché » : une nappe de gros pixels dégouline du haut, couvre l'écran,
 * le contenu change dessous, puis la nappe s'écoule vers le bas.
 */
@Component({
  selector: 'app-pixel-drip-transition',
  templateUrl: './pixel-drip-transition.html',
  styleUrl: './pixel-drip-transition.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelDripTransition implements PixelDripTransitionPlayer {
  private readonly document: Document = inject(DOCUMENT);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );

  protected readonly gridWidth: number = GRID_WIDTH;
  protected readonly gridHeight: number = GRID_HEIGHT;

  private readonly dripCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('dripCanvas');

  constructor() {
    afterNextRender(() => this.pixelDripTransitionService.registerTransitionPlayer(this));
    inject(DestroyRef).onDestroy(() =>
      this.pixelDripTransitionService.unregisterTransitionPlayer(this),
    );
  }

  playDripTransition(swapContent: () => void): Promise<void> {
    const context: CanvasRenderingContext2D | null =
      this.dripCanvas().nativeElement.getContext('2d');
    if (context === null || prefersReducedMotion()) {
      swapContent();
      return Promise.resolve();
    }

    const dripColors: DripColors = this.readDripColors();
    const fallingFront: DripFront = createDripFront(GRID_WIDTH, MAXIMUM_LAG, GRID_WIDTH / 6);
    const drainingFront: DripFront = createDripFront(GRID_WIDTH, MAXIMUM_LAG * 0.8, GRID_WIDTH / 8);

    return new Promise<void>((resolve: () => void) => {
      let isCovering: boolean = true;
      let phaseStartTime: number = performance.now();
      let lastFrameTime: number = 0;

      const animateFrame = (frameTime: number): void => {
        if (frameTime - lastFrameTime < FRAME_INTERVAL_IN_MILLISECONDS) {
          requestAnimationFrame(animateFrame);
          return;
        }
        lastFrameTime = frameTime;
        const phaseProgress: number = Math.min(
          (frameTime - phaseStartTime) / HALF_DURATION_IN_MILLISECONDS,
          1,
        );

        context.clearRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
        if (isCovering) {
          this.paintFallingGoo(context, dripColors, fallingFront, easeInOutCubic(phaseProgress));
        } else {
          this.paintDrainingGoo(context, dripColors, drainingFront, easeInCubic(phaseProgress));
        }

        if (phaseProgress < 1) {
          requestAnimationFrame(animateFrame);
        } else if (isCovering) {
          // L'écran est entièrement couvert : on change le contenu dessous.
          swapContent();
          isCovering = false;
          phaseStartTime = performance.now();
          requestAnimationFrame(animateFrame);
        } else {
          context.clearRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
          resolve();
        }
      };
      requestAnimationFrame(animateFrame);
    });
  }

  /** Phase 1 : la nappe descend du haut, ses coulures en avance. */
  private paintFallingGoo(
    context: CanvasRenderingContext2D,
    dripColors: DripColors,
    fallingFront: DripFront,
    easedProgress: number,
  ): void {
    const reachedDepth: number =
      easedProgress * (GRID_HEIGHT + MAXIMUM_LAG + DITHER_BAND_HEIGHT + 2);

    for (let columnX: number = 0; columnX < GRID_WIDTH; columnX++) {
      const frontY: number = Math.round(reachedDepth - fallingFront.columnLags[columnX]);
      for (let rowY: number = 0; rowY < Math.min(GRID_HEIGHT, frontY); rowY++) {
        this.paintGooPixel(context, dripColors, columnX, rowY, frontY - rowY);
      }
    }

    fallingFront.drips.forEach((drip: Drip) =>
      this.paintDripBulb(context, dripColors, drip, fallingFront, reachedDepth),
    );
  }

  /** Phase 2 : la nappe s'écoule vers le bas et découvre l'écran par le haut. */
  private paintDrainingGoo(
    context: CanvasRenderingContext2D,
    dripColors: DripColors,
    drainingFront: DripFront,
    easedProgress: number,
  ): void {
    const drainedDepth: number =
      easedProgress * (GRID_HEIGHT + MAXIMUM_LAG * 0.8 + DITHER_BAND_HEIGHT + 2);

    for (let columnX: number = 0; columnX < GRID_WIDTH; columnX++) {
      // Décalé d'une bande de tramage : au tout début, l'écran reste entièrement couvert.
      const tailY: number = Math.round(
        drainedDepth - drainingFront.columnLags[columnX] - DITHER_BAND_HEIGHT - 1,
      );
      for (let rowY: number = Math.max(0, tailY); rowY < GRID_HEIGHT; rowY++) {
        this.paintGooPixel(context, dripColors, columnX, rowY, rowY - tailY);
      }
    }
  }

  /**
   * Un pixel de matière. `depthInsideGoo` = distance au bord de la nappe :
   * près du bord, on trame (Bayer) pour un fondu en pixels ; au cœur, matière unie légèrement texturée.
   */
  private paintGooPixel(
    context: CanvasRenderingContext2D,
    dripColors: DripColors,
    columnX: number,
    rowY: number,
    depthInsideGoo: number,
  ): void {
    if (depthInsideGoo <= 0) {
      return;
    }
    if (depthInsideGoo < DITHER_BAND_HEIGHT) {
      if (BAYER_THRESHOLDS[rowY % 4][columnX % 4] > depthInsideGoo / DITHER_BAND_HEIGHT) {
        return;
      }
      context.fillStyle =
        depthInsideGoo < DITHER_BAND_HEIGHT / 2 ? dripColors.edge : dripColors.body;
    } else {
      const isTexturePixel: boolean = BAYER_THRESHOLDS[rowY % 4][(columnX + rowY) % 4] < 0.12;
      context.fillStyle = isTexturePixel ? dripColors.texture : dripColors.body;
    }
    context.fillRect(columnX, rowY, 1, 1);
  }

  /** La goutte arrondie au bout d'une coulure, avec un pixel de reflet. */
  private paintDripBulb(
    context: CanvasRenderingContext2D,
    dripColors: DripColors,
    drip: Drip,
    fallingFront: DripFront,
    reachedDepth: number,
  ): void {
    const centerX: number = Math.round(drip.centerX);
    if (centerX < 0 || centerX >= GRID_WIDTH) {
      return;
    }
    const tipY: number = Math.round(reachedDepth - fallingFront.columnLags[centerX]);
    if (tipY < 2 || tipY > GRID_HEIGHT + 2) {
      return;
    }
    const bulbRadius: number = Math.max(1, Math.round(drip.halfWidth * 0.8));
    for (let offsetY: number = -bulbRadius; offsetY <= bulbRadius; offsetY++) {
      const halfWidth: number = Math.round(Math.sqrt(bulbRadius ** 2 - offsetY ** 2));
      context.fillStyle = offsetY >= bulbRadius - 1 ? dripColors.edge : dripColors.body;
      context.fillRect(centerX - halfWidth, tipY - bulbRadius + offsetY, halfWidth * 2 + 1, 1);
    }
    context.fillStyle = dripColors.gloss;
    context.fillRect(
      centerX - Math.ceil(bulbRadius / 2),
      tipY - bulbRadius - Math.ceil(bulbRadius / 2),
      1,
      1,
    );
  }

  private readDripColors(): DripColors {
    const rootStyles: CSSStyleDeclaration = getComputedStyle(this.document.documentElement);
    const readColor = (variableName: string): string =>
      rootStyles.getPropertyValue(variableName).trim();
    return {
      body: readColor('--color-drip-body'),
      texture: readColor('--color-drip-texture'),
      edge: readColor('--color-drip-edge'),
      gloss: readColor('--color-drip-gloss'),
    };
  }
}
