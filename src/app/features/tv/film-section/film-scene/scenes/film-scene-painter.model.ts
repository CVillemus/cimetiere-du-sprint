import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

/** Dimensions communes à tous les décors, en pixels « art ». */
export const FILM_SCENE_WIDTH: number = 128;
export const FILM_SCENE_HEIGHT: number = 96;

/**
 * Dessine un décor sur trois calques :
 * - `scenePainter` : le décor fixe ;
 * - `lightPainter` : les lumières, posées sur un canvas qui vacille en CSS ;
 * - `apparitionPainter` : une apparition, invisible la plupart du temps, qui surgit par flashs.
 *
 * Un décor n'est pas obligé d'utiliser tous les calques.
 * Les fichiers de décor sont des illustrations : leur palette vit avec le dessin (hexadécimal autorisé ici).
 */
export type FilmScenePainter = (
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
  apparitionPainter: PixelPainter,
) => void;
