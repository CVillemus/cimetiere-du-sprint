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
import { PixelGrid } from '../../../../shared/pixel-art/pixel-grid';
import { PixelPainter } from '../../../../shared/pixel-art/pixel-painter';
import { prefersReducedMotion } from '../../../../shared/utils/prefers-reduced-motion';
import {
  SPIDER_COLORS,
  SPIDER_EYE_PIXELS,
  SPIDER_LEGS_FRAMES,
  SPIDER_SPRITE_HEIGHT,
  SPIDER_SPRITE_WIDTH,
} from './spider-sprite';
import { SpiderPosition, SpiderWalker } from './spider-walker';

/** Canvas de 128×72 : un pixel du canvas = un pixel « art ». */
const AREA_WIDTH: number = 128;
const AREA_HEIGHT: number = 72;

const FIRST_APPEARANCE_DELAY_IN_MILLISECONDS: number = 6_000;
const STEP_INTERVAL_IN_MILLISECONDS: number = 90;
const MINIMUM_HIDDEN_DURATION_IN_MILLISECONDS: number = 5_000;
const MAXIMUM_HIDDEN_DURATION_IN_MILLISECONDS: number = 20_000;
const THREAD_OPACITY: number = 0.5;

/**
 * Le clin d'œil de la Sprint Review : une araignée descend du plafond, trottine entre les tombes,
 * guette, puis file par un côté. Elle revient à un moment imprévisible.
 */
@Component({
  selector: 'app-review-spider',
  templateUrl: './review-spider.html',
  styleUrl: './review-spider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewSpider {
  /** L'araignée ne vit que quand la Sprint Review est affichée. */
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  protected readonly canvasWidth: number = AREA_WIDTH;
  protected readonly canvasHeight: number = AREA_HEIGHT;

  private readonly spiderCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('spiderCanvas');

  constructor() {
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      if (!this.isActive() || prefersReducedMotion()) {
        return;
      }
      const spiderPainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.spiderCanvas().nativeElement,
      );
      if (spiderPainter === null) {
        return;
      }
      const stopSpiderLife: () => void = this.startSpiderLife(spiderPainter);
      onCleanup(() => {
        stopSpiderLife();
        spiderPainter.clear();
      });
    });
  }

  /** Lance la boucle de vie de l'araignée ; renvoie la fonction qui arrête tout. */
  private startSpiderLife(spiderPainter: PixelPainter): () => void {
    const spiderWalker: SpiderWalker = new SpiderWalker({
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
      spiderWidth: SPIDER_SPRITE_WIDTH,
      spiderHeight: SPIDER_SPRITE_HEIGHT,
    });
    let appearanceTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleAppearance = (delayInMilliseconds: number): void => {
      appearanceTimeoutId = setTimeout(
        () => spiderWalker.descendFromCeiling(),
        delayInMilliseconds,
      );
    };

    const stepIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
      if (spiderWalker.isHidden()) {
        return;
      }
      spiderWalker.advance();
      this.paintSpider(spiderPainter, spiderWalker);
      if (spiderWalker.isHidden()) {
        const hiddenDuration: number =
          MINIMUM_HIDDEN_DURATION_IN_MILLISECONDS +
          Math.random() *
            (MAXIMUM_HIDDEN_DURATION_IN_MILLISECONDS - MINIMUM_HIDDEN_DURATION_IN_MILLISECONDS);
        scheduleAppearance(hiddenDuration);
      }
    }, STEP_INTERVAL_IN_MILLISECONDS);

    scheduleAppearance(FIRST_APPEARANCE_DELAY_IN_MILLISECONDS);

    return (): void => {
      clearInterval(stepIntervalId);
      if (appearanceTimeoutId !== null) {
        clearTimeout(appearanceTimeoutId);
      }
    };
  }

  private paintSpider(spiderPainter: PixelPainter, spiderWalker: SpiderWalker): void {
    spiderPainter.clear();
    if (spiderWalker.isHidden()) {
      return;
    }
    const spiderPosition: SpiderPosition = spiderWalker.spiderPosition;

    if (spiderWalker.isHangingFromThread && spiderPosition.y > 0) {
      spiderPainter.setOpacity(THREAD_OPACITY);
      spiderPainter.fillRect(
        spiderWalker.threadAnchorX,
        0,
        1,
        spiderPosition.y,
        SPIDER_COLORS.thread,
      );
      spiderPainter.setOpacity(1);
    }

    const legsFrame: PixelGrid = SPIDER_LEGS_FRAMES[spiderWalker.currentLegsFrameIndex];
    legsFrame.forEach((pixelRow: string, rowIndex: number) => {
      [...pixelRow].forEach((pixel: string, columnIndex: number) => {
        if (pixel === '#') {
          spiderPainter.fillPixel(
            spiderPosition.x + columnIndex,
            spiderPosition.y + rowIndex,
            SPIDER_COLORS.body,
          );
        }
      });
    });
    SPIDER_EYE_PIXELS.forEach(([eyeX, eyeY]: readonly [number, number]) =>
      spiderPainter.fillPixel(spiderPosition.x + eyeX, spiderPosition.y + eyeY, SPIDER_COLORS.eyes),
    );
  }
}
