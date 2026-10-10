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
/** Posée sur l'hôte quand le décor est à l'écran : elle (re)lance le cycle de l'apparition. */
const VISIBLE_SCENE_CLASS: string = 'film-scene--visible';

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

  /**
   * Suit la visibilité du décor :
   * - la classe `film-scene--visible` démarre le cycle CSS de l'apparition à l'arrivée sur le décor
   *   (sans elle, le cycle tournerait depuis le chargement de la page et l'apparition pourrait
   *   être déjà là en arrivant) ;
   * - le calque animé ne tourne que pendant que le décor est à l'écran.
   */
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
    // Animations réduites : une seule image, la scène au repos, et pas d'apparition.
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      animateFilmScene?.(animationPainter, 0);
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
      if (frameIntervalId !== null || animateFilmScene === undefined) {
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
      ([visibilityEntry]: IntersectionObserverEntry[]) => {
        this.hostElement.classList.toggle(VISIBLE_SCENE_CLASS, visibilityEntry.isIntersecting);
        if (visibilityEntry.isIntersecting) {
          playAnimation();
        } else {
          pauseAnimation();
        }
      },
      { threshold: 0.3 },
    );
    visibilityObserver.observe(this.hostElement);
    this.stopAnimation = (): void => {
      visibilityObserver.disconnect();
      pauseAnimation();
    };
  }
}
