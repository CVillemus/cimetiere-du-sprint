import { PixelPainter } from '../../shared/pixel-art/pixel-painter';

/**
 * Décor de la page teaser : un cimetière au clair de lune, une tombe par film.
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

const GROUND_Y: number = 84;

/** Dix tombes, une par film, de hauteurs et de formes variées. */
const TOMBSTONES: readonly Tombstone[] = [
  { x: 10, height: 14, shape: 'rounded', hasCandle: false },
  { x: 28, height: 18, shape: 'cross', hasCandle: true },
  { x: 45, height: 12, shape: 'rounded', hasCandle: false },
  { x: 62, height: 22, shape: 'obelisk', hasCandle: false },
  { x: 80, height: 15, shape: 'rounded', hasCandle: true },
  { x: 104, height: 17, shape: 'cross', hasCandle: false },
  { x: 122, height: 13, shape: 'rounded', hasCandle: false },
  { x: 139, height: 21, shape: 'obelisk', hasCandle: true },
  { x: 157, height: 16, shape: 'rounded', hasCandle: false },
  { x: 175, height: 19, shape: 'cross', hasCandle: false },
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

  // Un peu de mousse au pied de chaque tombe
  scenePainter.sprinkle(x, GROUND_Y - 2, 9, 2, '#4f6b3a', 0.35);

  if (hasCandle) {
    scenePainter.fillRect(x + 10, GROUND_Y - 3, 1, 3, '#e9e2cf');
    lightPainter.fillPixel(x + 10, GROUND_Y - 4, '#f5c26b');
    lightPainter.paintGlow(x + 10, GROUND_Y - 4, 7, '#e8a33d', 0.16);
  }
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
  scenePainter.paintMoon(160, 18, 9);

  // Collines et sapins au loin
  scenePainter.fillPolygon(
    [
      [0, 74],
      [40, 66],
      [96, 72],
      [150, 64],
      [192, 70],
      [192, 86],
      [0, 86],
    ],
    '#1c1733',
  );
  [6, 18, 30, 168, 180, 188].forEach((pineX: number, pineIndex: number) =>
    scenePainter.paintPine(pineX, 80, 22 + (pineIndex % 3) * 6, '#110f1f'),
  );

  // Sol du cimetière
  scenePainter.fillRect(0, GROUND_Y, TEASER_GRAVEYARD_WIDTH, 24, '#16201a');
  scenePainter.sprinkle(0, GROUND_Y, TEASER_GRAVEYARD_WIDTH, 24, '#1f2a1a', 0.25);
  scenePainter.sprinkle(0, GROUND_Y, TEASER_GRAVEYARD_WIDTH, 24, '#2b3a22', 0.06);

  TOMBSTONES.forEach((tombstone: Tombstone) =>
    paintTombstone(scenePainter, lightPainter, tombstone),
  );

  scenePainter.paintFog(GROUND_Y - 2, 0.08);
  scenePainter.paintFog(GROUND_Y + 6, 0.06);
}
