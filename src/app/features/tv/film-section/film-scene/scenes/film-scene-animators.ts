import { FilmId } from '../../../../../core/films/film.model';
import { FilmSceneAnimator } from './film-scene-painter.model';
import { animateGetOutScene } from './get-out.scene';
import { animateGhostlandScene } from './ghostland.scene';
import { animateHerediteScene } from './heredite.scene';
import { animateHereticScene } from './heretic.scene';
import { animateMamaScene } from './mama.scene';
import { animateSinisterScene } from './sinister.scene';

/** Les décors qui bougent image par image. Les autres restent fixes (avec lumière et apparition). */
export const FILM_SCENE_ANIMATORS: Readonly<Partial<Record<FilmId, FilmSceneAnimator>>> = {
  heretic: animateHereticScene,
  'get-out': animateGetOutScene,
  ghostland: animateGhostlandScene,
  sinister: animateSinisterScene,
  mama: animateMamaScene,
  heredite: animateHerediteScene,
};
