import { PixelPainter } from '../../shared/pixel-art/pixel-painter';

/**
 * Décor fixe de la page teaser, en 320×180 : assez fin pour un grand écran.
 * Le texte est dans une carte opaque au centre ; tout ce qui compte est placé autour.
 * Les éléments animés (étoiles, nuages, arbre, corbeau, serpent) sont dans teaser-night-animator.ts.
 * Fichier d'illustration pixel art : la palette vit avec le dessin.
 */
export const TEASER_SCENE_WIDTH: number = 320;
export const TEASER_SCENE_HEIGHT: number = 180;
export const TEASER_GROUND_Y: number = 150;

type TombstoneShape = 'rounded' | 'cross' | 'obelisk' | 'slab';

interface Tombstone {
  readonly x: number;
  readonly height: number;
  readonly shape: TombstoneShape;
  readonly hasCandle: boolean;
}

/** Dix tombes, une par film, alignées sous la carte (l'arbre occupe la gauche). */
const TOMBSTONES: readonly Tombstone[] = [
  { x: 76, height: 18, shape: 'rounded', hasCandle: false },
  { x: 99, height: 23, shape: 'cross', hasCandle: true },
  { x: 121, height: 14, shape: 'slab', hasCandle: false },
  { x: 143, height: 26, shape: 'obelisk', hasCandle: false },
  { x: 166, height: 17, shape: 'rounded', hasCandle: true },
  { x: 188, height: 21, shape: 'cross', hasCandle: false },
  { x: 210, height: 15, shape: 'slab', hasCandle: false },
  { x: 232, height: 27, shape: 'obelisk', hasCandle: true },
  { x: 255, height: 19, shape: 'rounded', hasCandle: false },
  { x: 278, height: 22, shape: 'cross', hasCandle: false },
];

const STONE_LIGHT: string = '#7d778a';
const STONE: string = '#6b6577';
const STONE_SHADE: string = '#4a4556';
const ENGRAVING: string = '#3f3a4a';

function paintTombstone(
  landscapePainter: PixelPainter,
  lightPainter: PixelPainter,
  tombstone: Tombstone,
): void {
  const { x, height, shape, hasCandle }: Tombstone = tombstone;
  const topY: number = TEASER_GROUND_Y - height;

  switch (shape) {
    case 'rounded':
      // Sommet arrondi en escalier, arête éclairée à gauche, flanc ombré à droite
      landscapePainter.fillRect(x, topY + 3, 11, height - 3, STONE);
      landscapePainter.fillRect(x + 1, topY + 1, 9, 2, STONE);
      landscapePainter.fillRect(x + 3, topY, 5, 1, STONE);
      landscapePainter.fillRect(x, topY + 3, 1, height - 3, STONE_LIGHT);
      landscapePainter.fillRect(x + 9, topY + 2, 2, height - 2, STONE_SHADE);
      // Croix gravée et lignes d'épitaphe
      landscapePainter.fillRect(x + 5, topY + 3, 1, 5, ENGRAVING);
      landscapePainter.fillRect(x + 3, topY + 4, 5, 1, ENGRAVING);
      landscapePainter.fillRect(x + 2, topY + 10, 7, 1, ENGRAVING);
      landscapePainter.fillRect(x + 3, topY + 12, 5, 1, ENGRAVING);
      break;
    case 'slab':
      // Stèle rectangulaire penchée par les années
      landscapePainter.fillPolygon(
        [
          [x + 1, topY],
          [x + 11, topY + 1],
          [x + 11, TEASER_GROUND_Y],
          [x, TEASER_GROUND_Y],
        ],
        STONE,
      );
      landscapePainter.fillRect(x + 9, topY + 2, 2, height - 2, STONE_SHADE);
      landscapePainter.fillRect(x + 2, topY + 4, 6, 1, ENGRAVING);
      landscapePainter.fillRect(x + 2, topY + 6, 5, 1, ENGRAVING);
      landscapePainter.sprinkle(x, topY, 11, height, '#575166', 0.12);
      break;
    case 'cross':
      landscapePainter.fillRect(x + 4, topY, 3, height, STONE);
      landscapePainter.fillRect(x, topY + 5, 11, 3, STONE);
      landscapePainter.fillRect(x + 6, topY, 1, height, STONE_SHADE);
      landscapePainter.fillRect(x, topY + 7, 11, 1, STONE_SHADE);
      landscapePainter.fillRect(x + 4, topY, 1, height, STONE_LIGHT);
      landscapePainter.fillRect(x + 2, TEASER_GROUND_Y - 3, 7, 3, '#575166');
      break;
    case 'obelisk':
      landscapePainter.fillRect(x + 3, topY + 4, 5, height - 7, STONE_LIGHT);
      landscapePainter.fillRect(x + 4, topY + 1, 3, 3, STONE_LIGHT);
      landscapePainter.fillPixel(x + 5, topY, STONE_LIGHT);
      landscapePainter.fillRect(x + 6, topY + 2, 2, height - 5, '#575166');
      landscapePainter.fillRect(x, TEASER_GROUND_Y - 3, 11, 3, '#575166');
      landscapePainter.fillRect(x + 1, TEASER_GROUND_Y - 4, 9, 1, STONE);
      break;
  }

  // Mousse et lichen au pied de la tombe
  landscapePainter.sprinkle(x - 1, TEASER_GROUND_Y - 3, 13, 3, '#4f6b3a', 0.3);
  landscapePainter.sprinkle(x, topY + 2, 11, 4, '#3d5230', 0.08);

  if (hasCandle) {
    landscapePainter.fillRect(x + 13, TEASER_GROUND_Y - 4, 2, 4, '#e9e2cf');
    landscapePainter.fillRect(x + 13, TEASER_GROUND_Y - 4, 1, 4, '#cfc6ae');
    lightPainter.fillPixel(x + 13, TEASER_GROUND_Y - 5, '#f5c26b');
    lightPainter.fillPixel(x + 13, TEASER_GROUND_Y - 6, '#e8a33d');
    lightPainter.paintGlow(x + 13, TEASER_GROUND_Y - 5, 10, '#e8a33d', 0.16);
  }
}

/** Fond du ciel : dégradé et lune. Les étoiles et les nuages, eux, sont animés. */
export function paintTeaserSky(skyPainter: PixelPainter): void {
  skyPainter.fillVerticalGradient(0, 0, TEASER_SCENE_WIDTH, 130, [
    '#08070f',
    '#0b0916',
    '#100d22',
    '#15122b',
    '#1b1733',
    '#221c3c',
    '#2a2245',
  ]);
  skyPainter.fillRect(0, 130, TEASER_SCENE_WIDTH, 50, '#2a2245');
  skyPainter.paintGlow(270, 30, 26, '#e9e2cf', 0.08);
  skyPainter.fillCircle(270, 30, 12, '#e9e2cf');
  skyPainter.fillCircle(273, 32, 10, '#d9d0bb');
  [
    [265, 27, 2],
    [272, 37, 1],
    [276, 26, 1],
  ].forEach(([craterX, craterY, craterRadius]: number[]) =>
    skyPainter.fillCircle(craterX, craterY, craterRadius, '#c8bfa9'),
  );
}

/** Paysage fixe : collines, sapins, sol, tombes et brume. Les bougies vont sur le calque des lumières. */
export function paintTeaserLandscape(
  landscapePainter: PixelPainter,
  lightPainter: PixelPainter,
): void {
  landscapePainter.fillPolygon(
    [
      [0, 138],
      [60, 128],
      [140, 136],
      [230, 124],
      [320, 132],
      [320, 152],
      [0, 152],
    ],
    '#1c1733',
  );
  [292, 304, 316, 300].forEach((pineX: number, pineIndex: number) =>
    landscapePainter.paintPine(pineX, 146, 26 + (pineIndex % 2) * 10, '#110f1f'),
  );

  // Sol herbeux, avec quelques touffes
  landscapePainter.fillRect(0, TEASER_GROUND_Y, TEASER_SCENE_WIDTH, 30, '#16201a');
  landscapePainter.sprinkle(0, TEASER_GROUND_Y, TEASER_SCENE_WIDTH, 30, '#1f2a1a', 0.25);
  landscapePainter.sprinkle(0, TEASER_GROUND_Y, TEASER_SCENE_WIDTH, 30, '#2b3a22', 0.05);
  for (let tuftIndex: number = 0; tuftIndex < 60; tuftIndex++) {
    const tuftX: number = Math.floor(landscapePainter.random() * TEASER_SCENE_WIDTH);
    const tuftY: number = TEASER_GROUND_Y + Math.floor(landscapePainter.random() * 28);
    landscapePainter.fillRect(tuftX, tuftY, 1, 2, '#3d5230');
  }

  TOMBSTONES.forEach((tombstone: Tombstone) =>
    paintTombstone(landscapePainter, lightPainter, tombstone),
  );
  landscapePainter.paintFog(TEASER_GROUND_Y - 1, 0.07);
  landscapePainter.paintFog(TEASER_GROUND_Y + 10, 0.05);
}
