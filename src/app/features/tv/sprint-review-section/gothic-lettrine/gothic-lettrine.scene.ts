import { PixelPainter } from '../../../../shared/pixel-art/pixel-painter';

/** La lettrine : un cadre de manuscrit de 44×54 pixels, avec un « 1 » gothique enluminé. */
export const GOTHIC_LETTRINE_WIDTH: number = 44;
export const GOTHIC_LETTRINE_HEIGHT: number = 54;

/** Position du chiffre dans le cadre ; le chiffre tient dans une grille de 26×40. */
const NUMERAL_OFFSET_X: number = 10;
const NUMERAL_OFFSET_Y: number = 8;
const NUMERAL_WIDTH: number = 26;
const NUMERAL_HEIGHT: number = 40;

/** Or enluminé sur fond sang séché. */
const LETTRINE_COLORS = {
  goldHighlight: '#ffe39a',
  gold: '#e8a33d',
  goldTexture: '#c27f2a',
  goldShadow: '#8a5418',
  outline: '#2a1408',
  dropShadow: '#0d0b14',
  background: '#3a1c1f',
  backgroundPattern: '#4d262a',
  frame: '#e8a33d',
  innerFrame: '#8a5418',
  glint: '#fff6dc',
} as const;

const GLINT_HALF_WIDTH: number = 1;

type NumeralPixel = readonly [x: number, y: number];

function distanceToSegment(
  pointX: number,
  pointY: number,
  [startX, startY]: NumeralPixel,
  [endX, endY]: NumeralPixel,
): number {
  const segmentX: number = endX - startX;
  const segmentY: number = endY - startY;
  const projection: number = Math.max(
    0,
    Math.min(
      1,
      ((pointX - startX) * segmentX + (pointY - startY) * segmentY) /
        (segmentX * segmentX + segmentY * segmentY),
    ),
  );
  return Math.hypot(
    pointX - (startX + projection * segmentX),
    pointY - (startY + projection * segmentY),
  );
}

const FLAG_START: NumeralPixel = [12, 5];
const FLAG_END: NumeralPixel = [4, 12];
const SPUR_END: NumeralPixel = [5, 16];
/** Demi-largeur du pied évasé, de la ligne 32 à la ligne 36. */
const FOOT_HALF_WIDTHS: readonly number[] = [4, 5, 7, 6, 4];

function isInStem(x: number, y: number): boolean {
  // Fût épais, coupé en biseau en haut ; la petite cassure sur la gauche est typique du gothique.
  const isUnderBevel: boolean = y >= 4 + Math.abs(x - 12) * 0.8;
  const isFracture: boolean = y >= 19 && y <= 20 && x === 11 + (y - 19);
  return x >= 11 && x <= 17 && y <= 33 && isUnderBevel && !isFracture;
}

function isInFlag(x: number, y: number): boolean {
  return (
    distanceToSegment(x, y, FLAG_START, FLAG_END) < 1.7 ||
    distanceToSegment(x, y, FLAG_END, SPUR_END) < 0.8
  );
}

function isInFoot(x: number, y: number): boolean {
  const footHalfWidth: number | undefined = FOOT_HALF_WIDTHS[y - 32];
  return footHalfWidth !== undefined && Math.abs(x - 14) <= footHalfWidth;
}

function isInOrnaments(x: number, y: number): boolean {
  const isLeftLozenge: boolean = Math.abs(x - 6) + Math.abs(y - 23) <= 2;
  const isLozengeHairline: boolean = y === 23 && x >= 8 && x <= 10;
  const isRightDot: boolean = Math.abs(x - 21) + Math.abs(y - 14) <= 1;
  return isLeftLozenge || isLozengeHairline || isRightDot;
}

function isInNumeral(x: number, y: number): boolean {
  return isInStem(x, y) || isInFlag(x, y) || isInFoot(x, y) || isInOrnaments(x, y);
}

/** Ordre de gravure (0 → 1) : le drapeau, puis le fût de haut en bas, puis le pied, puis les ornements. */
function engravingOrder(x: number, y: number): number {
  if (isInFlag(x, y)) {
    return ((12 - y) / 12) * 0.25 + (x < 6 ? 0.2 : 0);
  }
  if (isInStem(x, y)) {
    return 0.25 + ((y - 4) / 30) * 0.45;
  }
  if (isInFoot(x, y)) {
    return 0.7 + (Math.abs(x - 14) / 7) * 0.15;
  }
  return 0.9;
}

const NUMERAL_PIXELS: readonly NumeralPixel[] = Array.from(
  { length: NUMERAL_WIDTH * NUMERAL_HEIGHT },
  (_: unknown, pixelIndex: number): NumeralPixel => [
    pixelIndex % NUMERAL_WIDTH,
    Math.floor(pixelIndex / NUMERAL_WIDTH),
  ],
).filter(([x, y]: NumeralPixel): boolean => isInNumeral(x, y));

const NEIGHBOR_OFFSETS: readonly NumeralPixel[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Peint la lettrine.
 * @param engravingProgress 0 : cadre vide ; 1 : le chiffre est entièrement gravé.
 * @param glintDiagonal position du reflet (x + y), ou `null` hors reflet.
 */
export function paintGothicLettrine(
  painter: PixelPainter,
  engravingProgress: number,
  glintDiagonal: number | null,
): void {
  paintManuscriptFrame(painter);

  const engravedPixels: readonly NumeralPixel[] = NUMERAL_PIXELS.filter(
    ([x, y]: NumeralPixel): boolean => engravingOrder(x, y) < engravingProgress,
  );
  engravedPixels.forEach(([x, y]: NumeralPixel) =>
    painter.fillPixel(
      NUMERAL_OFFSET_X + x + 2,
      NUMERAL_OFFSET_Y + y + 2,
      LETTRINE_COLORS.dropShadow,
    ),
  );
  engravedPixels.forEach(([x, y]: NumeralPixel) =>
    NEIGHBOR_OFFSETS.forEach(([offsetX, offsetY]: NumeralPixel) => {
      if (!isInNumeral(x + offsetX, y + offsetY)) {
        painter.fillPixel(
          NUMERAL_OFFSET_X + x + offsetX,
          NUMERAL_OFFSET_Y + y + offsetY,
          LETTRINE_COLORS.outline,
        );
      }
    }),
  );
  engravedPixels.forEach(([x, y]: NumeralPixel) =>
    painter.fillPixel(NUMERAL_OFFSET_X + x, NUMERAL_OFFSET_Y + y, goldColorAt(x, y, glintDiagonal)),
  );
}

/** Or éclairé en haut à gauche, ombré en bas à droite, avec un grain irrégulier. */
function goldColorAt(x: number, y: number, glintDiagonal: number | null): string {
  if (glintDiagonal !== null && Math.abs(x + y - glintDiagonal) <= GLINT_HALF_WIDTH) {
    return LETTRINE_COLORS.glint;
  }
  const isLitEdge: boolean = !isInNumeral(x - 1, y) || !isInNumeral(x, y - 1);
  const isShadowEdge: boolean = !isInNumeral(x + 1, y) || !isInNumeral(x, y + 1);
  if (isLitEdge && !isShadowEdge) {
    return LETTRINE_COLORS.goldHighlight;
  }
  if (isShadowEdge && !isLitEdge) {
    return LETTRINE_COLORS.goldShadow;
  }
  return y > 18 && (x * 3 + y * 5) % 7 === 0 ? LETTRINE_COLORS.goldTexture : LETTRINE_COLORS.gold;
}

/** Fond losangé de manuscrit, double filet doré, losanges et ronces dans les coins. */
function paintManuscriptFrame(painter: PixelPainter): void {
  const width: number = GOTHIC_LETTRINE_WIDTH;
  const height: number = GOTHIC_LETTRINE_HEIGHT;
  painter.fillRect(0, 0, width, height, LETTRINE_COLORS.outline);
  painter.fillRect(2, 2, width - 4, height - 4, LETTRINE_COLORS.background);

  for (let y: number = 3; y < height - 3; y++) {
    for (let x: number = 3; x < width - 3; x++) {
      const isOnDiagonalGrid: boolean = (x + y) % 6 === 0 || (x - y + 60) % 6 === 0;
      const isGridCrossing: boolean = (x + y) % 6 === 0 && (x - y + 60) % 6 === 0;
      if (isGridCrossing || (isOnDiagonalGrid && (x * 7 + y * 3) % 4 === 0)) {
        painter.fillPixel(x, y, LETTRINE_COLORS.backgroundPattern);
      }
    }
  }

  painter.fillRect(1, 1, width - 2, 1, LETTRINE_COLORS.frame);
  painter.fillRect(1, height - 2, width - 2, 1, LETTRINE_COLORS.frame);
  painter.fillRect(1, 1, 1, height - 2, LETTRINE_COLORS.frame);
  painter.fillRect(width - 2, 1, 1, height - 2, LETTRINE_COLORS.frame);
  painter.fillRect(3, 3, width - 6, 1, LETTRINE_COLORS.innerFrame);
  painter.fillRect(3, height - 4, width - 6, 1, LETTRINE_COLORS.innerFrame);
  painter.fillRect(3, 3, 1, height - 6, LETTRINE_COLORS.innerFrame);
  painter.fillRect(width - 4, 3, 1, height - 6, LETTRINE_COLORS.innerFrame);

  const cornerLozenges: readonly NumeralPixel[] = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  cornerLozenges.forEach(([x, y]: NumeralPixel) => {
    painter.fillRect(x - 1, y, 3, 1, LETTRINE_COLORS.frame);
    painter.fillRect(x, y - 1, 1, 3, LETTRINE_COLORS.frame);
  });

  // Ronces : une petite tige courbe qui part de chaque coin vers l'intérieur.
  const brambleCorners: readonly (readonly [number, number, number, number])[] = [
    [4, 4, 1, 1],
    [width - 5, 4, -1, 1],
    [4, height - 5, 1, -1],
    [width - 5, height - 5, -1, -1],
  ];
  brambleCorners.forEach(
    ([cornerX, cornerY, directionX, directionY]: readonly [number, number, number, number]) => {
      for (let step: number = 0; step < 5; step++) {
        painter.fillPixel(
          cornerX + directionX * step,
          cornerY + directionY * Math.floor((step * step) / 5),
          LETTRINE_COLORS.innerFrame,
        );
      }
      painter.fillPixel(cornerX + directionX * 2, cornerY + directionY * 2, LETTRINE_COLORS.frame);
    },
  );
}
