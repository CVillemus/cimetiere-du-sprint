import { PixelGrid } from '../../../../shared/pixel-art/pixel-grid';

/**
 * Sprite de l'araignée : fichier d'illustration pixel art, la palette vit avec le dessin.
 * Deux images de pattes, alternées à chaque pas.
 */
export const SPIDER_LEGS_FRAMES: readonly PixelGrid[] = [
  ['#..#.#..#', '.#.###.#.', '..#####..', '.#.###.#.', '#...#...#'],
  ['.#.#.#.#.', '#..###..#', '..#####..', '#..###..#', '.#..#..#.'],
];

export const SPIDER_SPRITE_WIDTH: number = 9;
export const SPIDER_SPRITE_HEIGHT: number = 5;

/** Les deux yeux rouges, en coordonnées du sprite. */
export const SPIDER_EYE_PIXELS: readonly (readonly [x: number, y: number])[] = [
  [3, 2],
  [5, 2],
];

export const SPIDER_COLORS = {
  body: '#8d86a3',
  eyes: '#c0392b',
  thread: '#e9e2cf',
} as const;
