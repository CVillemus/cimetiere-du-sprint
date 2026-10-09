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
import {
  BatSwarmDirection,
  BatSwarmTransitionPlayer,
  PixelDripTransitionService,
} from '../../../shared/components/pixel-drip-transition/pixel-drip-transition.service';
import { PixelGrid } from '../../../shared/pixel-art/pixel-grid';
import { prefersReducedMotion } from '../../../shared/utils/prefers-reduced-motion';
import {
  createBatSwarm,
  SwarmBat,
  SwarmBatPosition,
  swarmBatPositionAt,
  SwarmVeil,
  swarmVeilAt,
  swarmVeilDensityAt,
} from './bat-swarm';

/** Pixels plus fins que la coulure (64 colonnes) : les chauves-souris doivent rester lisibles. */
const GRID_WIDTH: number = 128;
const DEFAULT_GRID_HEIGHT: number = 72;
const BAT_COUNT: number = 70;
/** Un changement d'onglet est plus fréquent qu'un changement de film : plus court que la coulure. */
const DURATION_IN_MILLISECONDS: number = 650;
const FRAME_INTERVAL_IN_MILLISECONDS: number = 33;

/** `#` corps, `w` liseré de l'aile, `e` œil. Deux images : ailes levées, ailes baissées. */
const BAT_WINGS_UP: PixelGrid = ['w.....w', '##...##', '.##e##.', '..###..'];
const BAT_WINGS_DOWN: PixelGrid = ['.......', '..#e#..', '.#####.', 'w#...#w'];
const BAT_WIDTH: number = 7;
const BAT_HEIGHT: number = 4;

/** Matrice de Bayer 4×4 : seuils de tramage ordonné, entre 0 et 1. */
const BAYER_THRESHOLDS: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((bayerRow: number[]): number[] =>
  bayerRow.map((bayerValue: number): number => (bayerValue + 0.5) / 16),
);

interface BatSwarmColors {
  readonly veil: string;
  readonly veilTexture: string;
  readonly batBody: string;
  readonly batWingEdge: string;
  readonly batEye: string;
}

/**
 * Transition des onglets de la TV : une nuée de chauves-souris traverse l'écran
 * dans le sens de la navigation, tire un voile sombre derrière elle, on change de slide dessous,
 * puis une seconde vague emporte le voile.
 */
@Component({
  selector: 'app-bat-swarm-transition',
  templateUrl: './bat-swarm-transition.html',
  styleUrl: './bat-swarm-transition.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatSwarmTransition implements BatSwarmTransitionPlayer {
  private readonly document: Document = inject(DOCUMENT);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );

  protected readonly gridWidth: number = GRID_WIDTH;
  protected readonly defaultGridHeight: number = DEFAULT_GRID_HEIGHT;

  private gridHeight: number = DEFAULT_GRID_HEIGHT;
  private readonly batSwarm: readonly SwarmBat[] = createBatSwarm(BAT_COUNT);

  private readonly batSwarmCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('batSwarmCanvas');

  constructor() {
    afterNextRender(() => this.pixelDripTransitionService.registerBatSwarmTransitionPlayer(this));
    inject(DestroyRef).onDestroy(() =>
      this.pixelDripTransitionService.unregisterBatSwarmTransitionPlayer(this),
    );
  }

  playBatSwarmTransition(swapContent: () => void, direction: BatSwarmDirection): Promise<void> {
    const batSwarmCanvasElement: HTMLCanvasElement = this.batSwarmCanvas().nativeElement;
    this.fitGridToViewport(batSwarmCanvasElement);
    const context: CanvasRenderingContext2D | null = batSwarmCanvasElement.getContext('2d');
    if (context === null || prefersReducedMotion()) {
      swapContent();
      return Promise.resolve();
    }
    const batSwarmColors: BatSwarmColors = this.readBatSwarmColors();

    return new Promise<void>((resolve: () => void) => {
      const startTime: number = performance.now();
      let lastFrameTime: number = 0;
      let hasSwappedContent: boolean = false;

      const animateFrame = (frameTime: number): void => {
        if (frameTime - lastFrameTime < FRAME_INTERVAL_IN_MILLISECONDS) {
          requestAnimationFrame(animateFrame);
          return;
        }
        lastFrameTime = frameTime;
        const elapsedMilliseconds: number = frameTime - startTime;
        const progress: number = Math.min(elapsedMilliseconds / DURATION_IN_MILLISECONDS, 1);

        // L'écran est entièrement voilé à mi-parcours : on change la slide dessous.
        if (!hasSwappedContent && progress >= 0.5) {
          swapContent();
          hasSwappedContent = true;
        }

        context.clearRect(0, 0, GRID_WIDTH, this.gridHeight);
        if (progress < 1) {
          this.paintVeil(
            context,
            batSwarmColors,
            swarmVeilAt(progress, GRID_WIDTH),
            progress,
            direction,
          );
          this.paintBats(context, batSwarmColors, progress, elapsedMilliseconds, direction);
          requestAnimationFrame(animateFrame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animateFrame);
    });
  }

  private fitGridToViewport(batSwarmCanvasElement: HTMLCanvasElement): void {
    const viewportRatio: number = window.innerHeight / window.innerWidth;
    this.gridHeight = Math.max(1, Math.round(GRID_WIDTH * viewportRatio));
    batSwarmCanvasElement.width = GRID_WIDTH;
    batSwarmCanvasElement.height = this.gridHeight;
  }

  /** Voile sombre au bord long et effiloché, avec un grain en petites touffes. */
  private paintVeil(
    context: CanvasRenderingContext2D,
    batSwarmColors: BatSwarmColors,
    swarmVeil: SwarmVeil,
    progress: number,
    direction: BatSwarmDirection,
  ): void {
    for (let rowY: number = 0; rowY < this.gridHeight; rowY++) {
      for (let columnX: number = 0; columnX < GRID_WIDTH; columnX++) {
        const columnInFlightDirection: number =
          direction === 'to-right' ? columnX : GRID_WIDTH - 1 - columnX;
        const veilDensity: number = swarmVeilDensityAt(
          columnInFlightDirection,
          rowY,
          swarmVeil,
          progress,
        );
        if (veilDensity <= 0 || BAYER_THRESHOLDS[rowY % 4][columnX % 4] > veilDensity) {
          continue;
        }
        // Touffes de 2×2 pixels plus sombres : de la matière, pas un aplat.
        const isTexturePixel: boolean =
          BAYER_THRESHOLDS[(rowY >> 1) % 4][((columnX >> 1) + (rowY >> 2)) % 4] < 0.15;
        context.fillStyle = isTexturePixel ? batSwarmColors.veilTexture : batSwarmColors.veil;
        context.fillRect(columnX, rowY, 1, 1);
      }
    }
  }

  private paintBats(
    context: CanvasRenderingContext2D,
    batSwarmColors: BatSwarmColors,
    progress: number,
    elapsedMilliseconds: number,
    direction: BatSwarmDirection,
  ): void {
    this.batSwarm.forEach((swarmBat: SwarmBat) => {
      const swarmBatPosition: SwarmBatPosition = swarmBatPositionAt(
        swarmBat,
        progress,
        elapsedMilliseconds,
        direction,
        GRID_WIDTH,
        this.gridHeight,
      );
      const left: number = Math.round(swarmBatPosition.x - BAT_WIDTH / 2);
      const top: number = Math.round(swarmBatPosition.y - BAT_HEIGHT / 2);
      const batSprite: PixelGrid = swarmBatPosition.areWingsUp ? BAT_WINGS_UP : BAT_WINGS_DOWN;
      batSprite.forEach((pixelRow: string, rowIndex: number) =>
        [...pixelRow].forEach((pixel: string, columnIndex: number) => {
          const pixelColor: string | null = this.batPixelColor(pixel, batSwarmColors);
          if (pixelColor !== null) {
            context.fillStyle = pixelColor;
            context.fillRect(left + columnIndex, top + rowIndex, 1, 1);
          }
        }),
      );
    });
  }

  private batPixelColor(pixel: string, batSwarmColors: BatSwarmColors): string | null {
    switch (pixel) {
      case '#':
        return batSwarmColors.batBody;
      case 'w':
        return batSwarmColors.batWingEdge;
      case 'e':
        return batSwarmColors.batEye;
      default:
        return null;
    }
  }

  private readBatSwarmColors(): BatSwarmColors {
    const rootStyles: CSSStyleDeclaration = getComputedStyle(this.document.documentElement);
    const readColor = (variableName: string): string =>
      rootStyles.getPropertyValue(variableName).trim();
    return {
      veil: readColor('--color-dusk'),
      veilTexture: readColor('--color-night'),
      batBody: readColor('--color-void'),
      batWingEdge: readColor('--color-violet'),
      batEye: readColor('--color-blood'),
    };
  }
}
