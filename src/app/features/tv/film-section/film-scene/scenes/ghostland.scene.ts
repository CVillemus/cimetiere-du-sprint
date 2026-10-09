import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

interface PorcelainDoll {
  readonly x: number;
  readonly y: number;
  readonly dressColor: string;
  readonly hairColor: string;
  readonly hasLostItsEyes: boolean;
}

const PORCELAIN_DOLLS: readonly PorcelainDoll[] = [
  { x: 14, y: 51, dressColor: '#7a4b5a', hairColor: '#d9b45a', hasLostItsEyes: false },
  { x: 34, y: 51, dressColor: '#3a3352', hairColor: '#5a3a22', hasLostItsEyes: false },
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
