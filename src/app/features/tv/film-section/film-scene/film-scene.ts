import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  InputSignal,
  Signal,
  viewChild,
} from '@angular/core';
import { FilmId } from '../../../../core/films/film.model';
import { PixelPainter } from '../../../../shared/pixel-art/pixel-painter';
import {
  FILM_SCENE_HEIGHT,
  FILM_SCENE_WIDTH,
  FilmScenePainter,
} from './scenes/film-scene-painter.model';
import { FILM_SCENE_PAINTERS } from './scenes/film-scene-painters';

/**
 * Décor pixel art d'un film, dessiné sur trois canvas superposés :
 * le décor fixe, un calque de lumières qui vacille, et un calque d'apparition qui se dessine en fondu de temps en temps.
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
    });
  }
}
