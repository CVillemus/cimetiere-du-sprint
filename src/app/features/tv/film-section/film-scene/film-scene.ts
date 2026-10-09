import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  Signal,
  viewChild,
} from '@angular/core';
import { FilmId } from '../../../../core/films/film.model';
import { PixelPainter } from '../../../../shared/pixel-art/pixel-painter';
import { prefersReducedMotion } from '../../../../shared/utils/prefers-reduced-motion';
import { FILM_SCENE_ANIMATORS } from './scenes/film-scene-animators';
import {
  FILM_SCENE_HEIGHT,
  FILM_SCENE_WIDTH,
  FilmSceneAnimator,
  FilmScenePainter,
} from './scenes/film-scene-painter.model';
import { FILM_SCENE_PAINTERS } from './scenes/film-scene-painters';

/** Environ 12 images par seconde : assez pour une animation pixel art, sans faire chauffer la TV. */
const ANIMATION_FRAME_INTERVAL_IN_MILLISECONDS: number = 83;

/**
 * Décor pixel art d'un film, dessiné sur quatre canvas superposés :
 * le décor fixe, un calque de lumières qui vacille, un calque animé image par image (pour certains films),
 * et un calque d'apparition qui se dessine en fondu de temps en temps.
 *
 * L'animation ne tourne que lorsque le décor est réellement à l'écran (IntersectionObserver) :
 * les dix films de la TV ne s'animent pas tous en même temps.
 */
@Component({
  selector: 'app-film-scene',
  templateUrl: './film-scene.html',
  styleUrl: './film-scene.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmScene {
  readonly filmId: InputSignal<FilmId> = input.required<FilmId>();

  protected readonly sceneWidth: number = FILM_SCENE_WIDTH;
  protected readonly sceneHeight: number = FILM_SCENE_HEIGHT;

  private readonly sceneCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('sceneCanvas');
  private readonly lightCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('lightCanvas');
  private readonly apparitionCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('apparitionCanvas');
  private readonly animationCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('animationCanvas');
  private readonly hostElement: HTMLElement = inject(ElementRef).nativeElement;

  private stopAnimation: (() => void) | null = null;

  constructor() {
    // Redessine uniquement quand le film change (seul signal lu ici).
    afterRenderEffect(() => {
      const paintFilmScene: FilmScenePainter = FILM_SCENE_PAINTERS[this.filmId()];
      const scenePainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.sceneCanvas().nativeElement,
      );
      const lightPainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.lightCanvas().nativeElement,
      );
      const apparitionPainter: PixelPainter | null = PixelPainter.fromCanvas(
        this.apparitionCanvas().nativeElement,
      );
      if (scenePainter === null || lightPainter === null || apparitionPainter === null) {
        return;
      }
      scenePainter.clear();
      lightPainter.clear();
      apparitionPainter.clear();
      paintFilmScene(scenePainter, lightPainter, apparitionPainter);
      this.startAnimation(FILM_SCENE_ANIMATORS[this.filmId()]);
    });
    inject(DestroyRef).onDestroy(() => this.stopAnimation?.());
  }

  /** Joue l'animation du décor tant qu'il est visible ; la met en pause dès qu'il sort de l'écran. */
  private startAnimation(animateFilmScene: FilmSceneAnimator | undefined): void {
    this.stopAnimation?.();
    this.stopAnimation = null;
    const animationPainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.animationCanvas().nativeElement,
    );
    if (animationPainter === null) {
      return;
    }
    animationPainter.clear();
    if (animateFilmScene === undefined) {
      return;
    }
    // Animations réduites : une seule image, la scène au repos.
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      animateFilmScene(animationPainter, 0);
      return;
    }

    let frameIntervalId: ReturnType<typeof setInterval> | null = null;
    const pauseAnimation = (): void => {
      if (frameIntervalId !== null) {
        clearInterval(frameIntervalId);
        frameIntervalId = null;
      }
    };
    const playAnimation = (): void => {
      if (frameIntervalId !== null) {
        return;
      }
      const startTime: number = performance.now();
      const paintFrame = (): void => {
        animationPainter.clear();
        animateFilmScene(animationPainter, performance.now() - startTime);
      };
      paintFrame();
      frameIntervalId = setInterval(paintFrame, ANIMATION_FRAME_INTERVAL_IN_MILLISECONDS);
    };

    const visibilityObserver: IntersectionObserver = new IntersectionObserver(
      ([visibilityEntry]: IntersectionObserverEntry[]) =>
        visibilityEntry.isIntersecting ? playAnimation() : pauseAnimation(),
      { threshold: 0.3 },
    );
    visibilityObserver.observe(this.hostElement);
    this.stopAnimation = (): void => {
      visibilityObserver.disconnect();
      pauseAnimation();
    };
  }
}
