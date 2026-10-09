import {
  DEAD_TREE,
  RAVEN_LOOKING_LEFT,
} from '../../shared/components/pixel-backdrop/pixel-backdrop.definitions';
import { PixelPainter } from '../../shared/pixel-art/pixel-painter';
import { SNAKE_SKINS, SnakeSkin } from '../../shared/pixel-art/snake-skins';

/**
 * Décor de la page teaser. Le texte est dans une carte opaque au centre :
 * tout ce qui compte est donc placé autour, là où on le voit.
 * - à gauche, l'arbre mort des fonds animés, en grande silhouette, avec le corbeau ;
 * - en haut à droite, la lune ;
 * - en bas, sous la carte, les dix tombes et le serpent mascotte en robe corail.
 * Fichier d'illustration pixel art : la palette vit avec le dessin.
 */
export const TEASER_GRAVEYARD_WIDTH: number = 192;
export const TEASER_GRAVEYARD_HEIGHT: number = 108;

type TombstoneShape = 'rounded' | 'cross' | 'obelisk';

interface Tombstone {
  readonly x: number;
  readonly height: number;
  readonly shape: TombstoneShape;
  readonly hasCandle: boolean;
}

const GROUND_Y: number = 92;
const TREE_SCALE: number = 3;
const SILHOUETTE_COLOR: string = '#0c0a16';

/** Le serpent corail, la robe préférée de la mascotte. */
const MASCOT_SNAKE_SKIN: SnakeSkin = SNAKE_SKINS[0];
const SNAKE_TAIL_X: number = 80;
const SNAKE_HEAD_X: number = 118;
const SNAKE_BASE_Y: number = 100;

/** Dix tombes, une par film, alignées sous la carte. */
const TOMBSTONES: readonly Tombstone[] = [
  { x: 66, height: 13, shape: 'rounded', hasCandle: false },
  { x: 78, height: 17, shape: 'cross', hasCandle: true },
  { x: 90, height: 11, shape: 'rounded', hasCandle: false },
  { x: 102, height: 19, shape: 'obelisk', hasCandle: false },
  { x: 114, height: 13, shape: 'rounded', hasCandle: true },
  { x: 126, height: 16, shape: 'cross', hasCandle: false },
  { x: 138, height: 12, shape: 'rounded', hasCandle: false },
  { x: 150, height: 20, shape: 'obelisk', hasCandle: true },
  { x: 163, height: 14, shape: 'rounded', hasCandle: false },
  { x: 176, height: 18, shape: 'cross', hasCandle: false },
];

function paintTombstone(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
  tombstone: Tombstone,
): void {
  const { x, height, shape, hasCandle }: Tombstone = tombstone;
  const topY: number = GROUND_Y - height;

  switch (shape) {
    case 'rounded':
      scenePainter.fillRect(x, topY + 2, 9, height - 2, '#6b6577');
      scenePainter.fillRect(x + 1, topY + 1, 7, 1, '#6b6577');
      scenePainter.fillRect(x + 2, topY, 5, 1, '#6b6577');
      scenePainter.fillRect(x + 7, topY + 2, 2, height - 2, '#4a4556');
      scenePainter.writePixelText('RIP', x - 1, topY + 4, '#3f3a4a');
      break;
    case 'cross':
      scenePainter.fillRect(x + 3, topY, 3, height, '#6b6577');
      scenePainter.fillRect(x, topY + 4, 9, 3, '#6b6577');
      scenePainter.fillRect(x + 5, topY, 1, height, '#4a4556');
      break;
    case 'obelisk':
      scenePainter.fillRect(x + 2, topY + 3, 5, height - 5, '#7d778a');
      scenePainter.fillRect(x + 3, topY + 1, 3, 2, '#7d778a');
      scenePainter.fillPixel(x + 4, topY, '#7d778a');
      scenePainter.fillRect(x, GROUND_Y - 3, 9, 3, '#575166');
      scenePainter.fillRect(x + 5, topY + 3, 2, height - 5, '#575166');
      break;
  }
  scenePainter.sprinkle(x, GROUND_Y - 2, 9, 2, '#4f6b3a', 0.35);

  if (hasCandle) {
    scenePainter.fillRect(x + 10, GROUND_Y - 3, 1, 3, '#e9e2cf');
    lightPainter.fillPixel(x + 10, GROUND_Y - 4, '#f5c26b');
    lightPainter.paintGlow(x + 10, GROUND_Y - 4, 7, '#e8a33d', 0.16);
  }
}

/** L'arbre mort des fonds animés, trois fois plus grand, et le corbeau sur sa branche. */
function paintDeadTreeWithRaven(scenePainter: PixelPainter): void {
  const treeHeight: number = DEAD_TREE.length * TREE_SCALE;
  scenePainter.paintPixelGrid(
    DEAD_TREE,
    0,
    GROUND_Y - treeHeight + 2,
    TREE_SCALE,
    SILHOUETTE_COLOR,
  );
  scenePainter.paintPixelGrid(RAVEN_LOOKING_LEFT, 44, 20, 1, SILHOUETTE_COLOR);
}

/** Le serpent mascotte qui ondule au pied des tombes, tête dressée, langue sortie. */
function paintMascotSnake(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  const ringColors: readonly string[] = MASCOT_SNAKE_SKIN.ringColors;
  let ringIndex: number = 0;
  for (let bodyX: number = SNAKE_HEAD_X - 2; bodyX >= SNAKE_TAIL_X; bodyX -= 2) {
    const bodyY: number = SNAKE_BASE_Y + Math.round(2 * Math.sin((bodyX - SNAKE_TAIL_X) / 4));
    const isTailTip: boolean = bodyX < SNAKE_TAIL_X + 4;
    scenePainter.fillRect(
      bodyX,
      bodyY,
      2,
      isTailTip ? 1 : 2,
      ringColors[ringIndex % ringColors.length],
    );
    ringIndex++;
  }

  // Cou dressé et tête noire, œil clair
  scenePainter.fillRect(SNAKE_HEAD_X, 97, 2, 4, ringColors[0]);
  scenePainter.fillRect(SNAKE_HEAD_X, 94, 4, 3, MASCOT_SNAKE_SKIN.headColor);
  scenePainter.fillPixel(SNAKE_HEAD_X + 2, 95, MASCOT_SNAKE_SKIN.eyeColor);

  // Langue fourchue sur le calque des lumières : elle vacille comme si elle goûtait l'air
  lightPainter.fillPixel(SNAKE_HEAD_X + 4, 95, MASCOT_SNAKE_SKIN.tongueColor);
  lightPainter.fillPixel(SNAKE_HEAD_X + 5, 94, MASCOT_SNAKE_SKIN.tongueColor);
  lightPainter.fillPixel(SNAKE_HEAD_X + 5, 96, MASCOT_SNAKE_SKIN.tongueColor);
}

export function paintTeaserGraveyard(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.fillVerticalGradient(0, 0, TEASER_GRAVEYARD_WIDTH, 72, [
    '#0b0916',
    '#100d22',
    '#15122b',
    '#1b1733',
    '#221c3c',
    '#2a2245',
  ]);
  scenePainter.fillRect(0, 72, TEASER_GRAVEYARD_WIDTH, 36, '#2a2245');
  scenePainter.paintStars(50, 60);
  scenePainter.paintMoon(168, 16, 9);

  // Collines et sapins au loin, à droite (l'arbre mort occupe la gauche)
  scenePainter.fillPolygon(
    [
      [0, 80],
      [40, 72],
      [96, 78],
      [150, 70],
      [192, 76],
      [192, 94],
      [0, 94],
    ],
    '#1c1733',
  );
  [172, 182, 190].forEach((pineX: number, pineIndex: number) =>
    scenePainter.paintPine(pineX, 88, 22 + pineIndex * 6, '#110f1f'),
  );

  // Sol du cimetière
  scenePainter.fillRect(0, GROUND_Y, TEASER_GRAVEYARD_WIDTH, 16, '#16201a');
  scenePainter.sprinkle(0, GROUND_Y, TEASER_GRAVEYARD_WIDTH, 16, '#1f2a1a', 0.25);
  scenePainter.sprinkle(0, GROUND_Y, TEASER_GRAVEYARD_WIDTH, 16, '#2b3a22', 0.06);

  paintDeadTreeWithRaven(scenePainter);
  TOMBSTONES.forEach((tombstone: Tombstone) =>
    paintTombstone(scenePainter, lightPainter, tombstone),
  );
  scenePainter.paintFog(GROUND_Y - 1, 0.08);
  paintMascotSnake(scenePainter, lightPainter);
}
