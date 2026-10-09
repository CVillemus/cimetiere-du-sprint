import { FilmId } from '../../../../../core/films/film.model';
import { paintConjuringScene } from './conjuring.scene';
import { FilmScenePainter } from './film-scene-painter.model';
import { paintGetOutScene } from './get-out.scene';
import { paintGhostlandScene } from './ghostland.scene';
import { paintHerediteScene } from './heredite.scene';
import { paintHisHouseScene } from './his-house.scene';
import { paintLateNightWithTheDevilScene } from './late-night-with-the-devil.scene';
import { paintLesAutresScene } from './les-autres.scene';
import { paintLOrphelinatScene } from './l-orphelinat.scene';
import { paintMamaScene } from './mama.scene';
import { paintSinisterScene } from './sinister.scene';

/** Un décor par film : le `Record<FilmId, …>` oblige à n'en oublier aucun. */
export const FILM_SCENE_PAINTERS: Readonly<Record<FilmId, FilmScenePainter>> = {
  'les-autres': paintLesAutresScene,
  'get-out': paintGetOutScene,
  conjuring: paintConjuringScene,
  mama: paintMamaScene,
  sinister: paintSinisterScene,
  heredite: paintHerediteScene,
  ghostland: paintGhostlandScene,
  'l-orphelinat': paintLOrphelinatScene,
  'late-night-with-the-devil': paintLateNightWithTheDevilScene,
  'his-house': paintHisHouseScene,
};
