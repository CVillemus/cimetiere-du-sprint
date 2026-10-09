import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';
import { PixelGrid } from '../../../../../shared/pixel-art/pixel-grid';

interface PorcelainDoll {
  readonly x: number;
  readonly y: number;
  readonly dressColor: string;
  readonly hairColor: string;
  readonly hasLostItsEyes: boolean;
}

const PORCELAIN_DOLLS: readonly PorcelainDoll[] = [
  { x: 14, y: 51, dressColor: '#7a4b5a', hairColor: '#d9b45a', hasLostItsEyes: false },
  { x: 56, y: 51, dressColor: '#4f6b3a', hairColor: '#1a1210', hasLostItsEyes: true },
  { x: 78, y: 51, dressColor: '#6a3a3a', hairColor: '#8e3a22', hasLostItsEyes: false },
  { x: 100, y: 51, dressColor: '#3a3352', hairColor: '#d9b45a', hasLostItsEyes: false },
  { x: 22, y: 17, dressColor: '#5a4a6a', hairColor: '#1a1210', hasLostItsEyes: false },
  { x: 46, y: 17, dressColor: '#7a4b5a', hairColor: '#d9b45a', hasLostItsEyes: false },
  { x: 90, y: 17, dressColor: '#4a5a48', hairColor: '#5a3a22', hasLostItsEyes: false },
];

/** Une poupée de 9×21 pixels : cheveux, visage en porcelaine, robe, bras et chaussures. */
function paintPorcelainDoll(scenePainter: PixelPainter, porcelainDoll: PorcelainDoll): void {
  const { x, y, dressColor, hairColor, hasLostItsEyes }: PorcelainDoll = porcelainDoll;

  scenePainter.fillRect(x + 1, y, 7, 1, hairColor);
  scenePainter.fillRect(x, y + 1, 9, 3, hairColor);
  scenePainter.fillRect(x + 1, y + 2, 7, 6, '#e8dfcf');
  scenePainter.fillRect(x + 6, y + 3, 2, 5, '#cdbfa9');
  scenePainter.fillRect(x + 2, y + 8, 5, 1, '#cdbfa9');

  if (hasLostItsEyes) {
    scenePainter.fillRect(x + 2, y + 4, 2, 2, '#07060c');
    scenePainter.fillRect(x + 5, y + 4, 2, 2, '#07060c');
    scenePainter.drawLine(x + 6, y + 2, x + 4, y + 7, '#5e4a48');
  } else {
    scenePainter.fillPixel(x + 2, y + 4, '#110f1f');
    scenePainter.fillPixel(x + 6, y + 4, '#110f1f');
    scenePainter.fillPixel(x + 3, y + 4, '#2a2440');
    scenePainter.fillPixel(x + 5, y + 4, '#2a2440');
    scenePainter.fillPixel(x + 2, y + 6, '#d9a0a0');
    scenePainter.fillPixel(x + 6, y + 6, '#d9a0a0');
    scenePainter.fillPixel(x + 4, y + 7, '#a8564f');
  }

  scenePainter.fillRect(x + 2, y + 9, 5, 1, '#f2ecdf');
  scenePainter.fillPolygon(
    [
      [x + 2, y + 10],
      [x + 7, y + 10],
      [x + 9, y + 19],
      [x, y + 19],
    ],
    dressColor,
  );
  scenePainter.fillRect(x + 6, y + 11, 2, 8, 'rgba(0, 0, 0, 0.25)');
  scenePainter.fillRect(x - 1, y + 11, 2, 5, '#e8dfcf');
  scenePainter.fillRect(x + 8, y + 11, 2, 5, '#e8dfcf');
  scenePainter.fillRect(x + 2, y + 19, 2, 2, '#1a1210');
  scenePainter.fillRect(x + 5, y + 19, 2, 2, '#1a1210');
}

/** Ghostland : les poupées en porcelaine sur leurs étagères. L'une d'elles a perdu ses yeux. */
export function paintGhostlandScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.fillVerticalGradient(0, 0, 128, 84, ['#17132a', '#1a152e', '#1d1832', '#211b36']);

  // Papier peint à motifs
  for (let patternY: number = 4; patternY < 84; patternY += 10) {
    const firstPatternX: number = patternY % 20 === 0 ? 1 : 6;
    for (let patternX: number = firstPatternX; patternX < 128; patternX += 10) {
      scenePainter.fillPixel(patternX, patternY, '#2a2345');
      scenePainter.fillPixel(patternX - 1, patternY + 1, '#2a2345');
      scenePainter.fillPixel(patternX + 1, patternY + 1, '#2a2345');
      scenePainter.fillPixel(patternX, patternY + 2, '#2a2345');
    }
  }

  // Sol
  scenePainter.fillRect(0, 84, 128, 12, '#120e1c');
  scenePainter.sprinkle(0, 84, 128, 12, '#1a1526', 0.15);

  // Étagères
  [38, 72].forEach((shelfY: number) => {
    scenePainter.fillRect(6, shelfY, 116, 3, '#4a372d');
    scenePainter.fillRect(6, shelfY, 116, 1, '#5a4334');
    scenePainter.fillRect(6, shelfY + 3, 116, 2, '#0e0b16');
    scenePainter.fillRect(14, shelfY + 3, 2, 6, '#3b2c26');
    scenePainter.fillRect(112, shelfY + 3, 2, 6, '#3b2c26');
  });

  PORCELAIN_DOLLS.forEach((porcelainDoll: PorcelainDoll) =>
    paintPorcelainDoll(scenePainter, porcelainDoll),
  );

  // Boîte à bijoux et ourson
  scenePainter.fillRect(68, 30, 10, 8, '#7a5a3a');
  scenePainter.fillRect(68, 27, 10, 3, '#8d6a46');
  scenePainter.fillRect(70, 28, 6, 1, '#b8742a');
  scenePainter.fillCircle(110, 32, 4, '#5a3a22');
  scenePainter.fillCircle(110, 26, 3, '#5a3a22');
  scenePainter.fillPixel(108, 24, '#5a3a22');
  scenePainter.fillPixel(112, 24, '#5a3a22');
  scenePainter.fillPixel(109, 26, '#110f1f');
  scenePainter.fillPixel(111, 26, '#110f1f');

  lightPainter.paintGlow(0, 0, 60, '#e8a33d', 0.07);
}

/**
 * La poupée brune de l'étagère du bas, en grille de pixels (11×21) pour pouvoir la coucher.
 * H cheveux, F porcelaine, f porcelaine ombrée, E œil, e reflet de l'œil, c joue, m bouche,
 * W col, D robe, d robe ombrée, S chaussure.
 */
const FALLING_DOLL_SPRITE: PixelGrid = [
  '..HHHHHHH..',
  '.HHHHHHHHH.',
  '.HFFFFFFFH.',
  '.HFFFFFffH.',
  '..FEeFeEf..',
  '..FFFFFff..',
  '..FcFFFcf..',
  '..FFFmFff..',
  '...fffff...',
  '...WWWWW...',
  '...DDDDDD..',
  'FF.DDDDddFF',
  'FF.DDDDddFF',
  'FFDDDDDddFF',
  'FFDDDDDddFF',
  'FFDDDDDddFF',
  '..DDDDDddd.',
  '..DDDDDddd.',
  '.DDDDDDddd.',
  '...SS.SS...',
  '...SS.SS...',
];
const FALLING_DOLL_COLORS: Readonly<Record<string, string>> = {
  H: '#5a3a22',
  F: '#e8dfcf',
  f: '#cdbfa9',
  E: '#110f1f',
  e: '#2a2440',
  c: '#d9a0a0',
  m: '#a8564f',
  W: '#f2ecdf',
  D: '#3a3352',
  d: '#2a2540',
  S: '#1a1210',
};

/**
 * Sur l'étagère du bas, debout ; puis couchée sur le parquet, devant l'étagère.
 * À gauche du décor : l'encart des votes occupe le coin bas droit de la TV.
 */
const DOLL_SHELF_LEFT: number = 33;
const DOLL_SHELF_TOP: number = 51;
const DOLL_FLOOR_LEFT: number = 28;
const DOLL_FLOOR_TOP: number = 85;

/** Le cycle de la poupée : 17 s, dont une longue attente pour que la chute surprenne. */
const DOLL_CYCLE_IN_MILLISECONDS: number = 17_000;
const DOLL_WOBBLE_START: number = 8_000;
const DOLL_FALL_START: number = 9_000;
const DOLL_LANDING: number = 9_450;
const DOLL_FADE_OUT_START: number = 12_500;
const DOLL_FADE_OUT_END: number = 13_500;
const DOLL_FADE_IN_START: number = 14_500;
const DOLL_FADE_IN_END: number = 15_700;
const DOLL_WOBBLE_STEP_IN_MILLISECONDS: number = 120;

/** Matrice de Bayer 4×4 : la poupée disparaît et réapparaît pixel par pixel. */
const BAYER_THRESHOLDS: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((bayerRow: number[]): number[] =>
  bayerRow.map((bayerValue: number): number => (bayerValue + 0.5) / 16),
);

/**
 * Dessine la poupée. `isLyingDown` la couche sur le flanc (rotation d'un quart de tour).
 * `visibility` (0 → 1) la fait apparaître ou disparaître en tramage.
 */
function paintFallingDoll(
  animationPainter: PixelPainter,
  left: number,
  top: number,
  isLyingDown: boolean,
  visibility: number,
): void {
  const spriteHeight: number = FALLING_DOLL_SPRITE.length;
  FALLING_DOLL_SPRITE.forEach((pixelRow: string, rowIndex: number) =>
    [...pixelRow].forEach((pixel: string, columnIndex: number) => {
      const pixelColor: string | undefined = FALLING_DOLL_COLORS[pixel];
      if (pixelColor === undefined) {
        return;
      }
      // Couchée : la tête part vers la droite, comme si elle avait basculé en avant.
      const x: number = left + (isLyingDown ? spriteHeight - 1 - rowIndex : columnIndex);
      const y: number = top + (isLyingDown ? columnIndex : rowIndex);
      if (BAYER_THRESHOLDS[y % 4][x % 4] > visibility) {
        return;
      }
      animationPainter.fillPixel(x, y, pixelColor);
    }),
  );
}

/**
 * Ghostland : la poupée brune vacille sur son étagère, tombe sur le parquet,
 * reste là un moment… puis s'efface, et se retrouve à sa place comme si de rien n'était.
 */
export function animateGhostlandScene(
  animationPainter: PixelPainter,
  elapsedMilliseconds: number,
): void {
  const timeInCycle: number = elapsedMilliseconds % DOLL_CYCLE_IN_MILLISECONDS;

  if (timeInCycle < DOLL_WOBBLE_START) {
    paintFallingDoll(animationPainter, DOLL_SHELF_LEFT, DOLL_SHELF_TOP, false, 1);
  } else if (timeInCycle < DOLL_FALL_START) {
    // Elle vacille : un pixel à droite, un pixel à gauche, de plus en plus vite.
    const wobbleStep: number = Math.floor(
      (timeInCycle - DOLL_WOBBLE_START) /
        (DOLL_WOBBLE_STEP_IN_MILLISECONDS * (timeInCycle > DOLL_WOBBLE_START + 600 ? 0.6 : 1)),
    );
    const wobbleOffset: number = wobbleStep % 2 === 0 ? 1 : -1;
    paintFallingDoll(animationPainter, DOLL_SHELF_LEFT + wobbleOffset, DOLL_SHELF_TOP, false, 1);
  } else if (timeInCycle < DOLL_LANDING) {
    // Chute avec la gravité, en glissant un peu vers l'avant.
    const fallProgress: number = (timeInCycle - DOLL_FALL_START) / (DOLL_LANDING - DOLL_FALL_START);
    const easedFall: number = fallProgress * fallProgress;
    paintFallingDoll(
      animationPainter,
      Math.round(DOLL_SHELF_LEFT + easedFall * 4),
      Math.round(DOLL_SHELF_TOP + easedFall * (DOLL_FLOOR_TOP - DOLL_SHELF_TOP - 6)),
      false,
      1,
    );
  } else if (timeInCycle < DOLL_FADE_IN_START) {
    const isBouncing: boolean = timeInCycle < DOLL_LANDING + 90;
    const fadeOutProgress: number = Math.max(
      0,
      (timeInCycle - DOLL_FADE_OUT_START) / (DOLL_FADE_OUT_END - DOLL_FADE_OUT_START),
    );
    paintFallingDoll(
      animationPainter,
      DOLL_FLOOR_LEFT,
      DOLL_FLOOR_TOP - (isBouncing ? 1 : 0),
      true,
      1 - Math.min(1, fadeOutProgress),
    );
    // Un petit nuage de poussière à l'impact.
    if (timeInCycle < DOLL_LANDING + 350) {
      animationPainter.setOpacity(0.6);
      [
        [26, 94],
        [24, 93],
        [50, 94],
        [52, 93],
      ].forEach(([x, y]: number[]) => animationPainter.fillPixel(x, y, '#8d86a3'));
      animationPainter.setOpacity(1);
    }
  } else {
    const fadeInProgress: number = Math.min(
      1,
      (timeInCycle - DOLL_FADE_IN_START) / (DOLL_FADE_IN_END - DOLL_FADE_IN_START),
    );
    paintFallingDoll(animationPainter, DOLL_SHELF_LEFT, DOLL_SHELF_TOP, false, fadeInProgress);
  }
}
