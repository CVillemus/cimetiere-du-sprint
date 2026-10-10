import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

const FLOATING_DEBRIS_COUNT: number = 10;

/**
 * Le monstre tapi dans le trou du mur : un visage creusé, à peine plus clair que le noir,
 * et deux yeux pâles qui fixent la pièce.
 */
function paintWallMonster(apparitionPainter: PixelPainter): void {
  apparitionPainter.fillEllipse(81, 44, 6, 7, '#1c1915');
  apparitionPainter.fillRect(77, 49, 9, 1, '#14110e');
  apparitionPainter.fillRect(77, 42, 2, 1, '#e9e2cf');
  apparitionPainter.fillRect(84, 42, 2, 1, '#e9e2cf');
  apparitionPainter.fillPixel(78, 42, '#ffffff');
  apparitionPainter.fillPixel(85, 42, '#ffffff');
}

/** His House : le papier peint qui pourrit, l'eau noire qui monte… et quelque chose dans le trou du mur. */
export function paintHisHouseScene(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
  apparitionPainter: PixelPainter,
): void {
  // Mur humide et papier peint
  scenePainter.fillRect(0, 0, 128, 8, '#1a1a14');
  scenePainter.fillVerticalGradient(0, 8, 128, 66, ['#3a3a2c', '#3f3f30', '#444434', '#3a3a2c']);
  for (let patternX: number = 6; patternX < 128; patternX += 12) {
    for (let patternY: number = 12; patternY < 70; patternY += 10) {
      scenePainter.fillPixel(patternX, patternY, '#4c4c3a');
      scenePainter.fillPixel(patternX + 1, patternY + 1, '#4c4c3a');
      scenePainter.fillPixel(patternX - 1, patternY + 1, '#4c4c3a');
      scenePainter.fillPixel(patternX, patternY + 2, '#4c4c3a');
    }
  }
  scenePainter.sprinkle(0, 8, 128, 66, '#2e2e22', 0.05);
  scenePainter.fillEllipse(28, 30, 14, 10, '#33331f');
  scenePainter.fillEllipse(104, 58, 12, 8, '#33331f');

  // Lambeaux de papier peint
  scenePainter.fillPolygon(
    [
      [10, 8],
      [18, 8],
      [16, 22],
      [12, 18],
    ],
    '#5a5a46',
  );
  scenePainter.fillPolygon(
    [
      [110, 8],
      [120, 8],
      [118, 16],
    ],
    '#5a5a46',
  );

  // Plancher inondé
  scenePainter.fillRect(0, 74, 128, 22, '#2a1f1c');
  for (let boardY: number = 76; boardY < 96; boardY += 3) {
    scenePainter.fillRect(0, boardY, 128, 1, '#1f1714');
  }
  scenePainter.setOpacity(0.85);
  scenePainter.fillRect(0, 80, 128, 16, '#121a2c');
  scenePainter.setOpacity(1);
  for (let debrisIndex: number = 0; debrisIndex < FLOATING_DEBRIS_COUNT; debrisIndex++) {
    const debrisX: number = Math.floor(scenePainter.random() * 110);
    const debrisY: number = 82 + Math.floor(scenePainter.random() * 12);
    const debrisWidth: number = 6 + Math.floor(scenePainter.random() * 10);
    scenePainter.fillRect(debrisX, debrisY, debrisWidth, 1, '#2b3a5c');
  }

  // Trou dans le mur et lattes apparentes
  scenePainter.fillPolygon(
    [
      [70, 34],
      [80, 30],
      [92, 36],
      [94, 48],
      [86, 56],
      [74, 54],
      [68, 44],
    ],
    '#6b6650',
  );
  scenePainter.fillPolygon(
    [
      [72, 36],
      [80, 33],
      [90, 37],
      [91, 47],
      [85, 53],
      [75, 52],
      [70, 44],
    ],
    '#07060c',
  );
  scenePainter.drawLine(72, 40, 90, 40, '#3b2c26');
  scenePainter.drawLine(71, 46, 91, 46, '#3b2c26');

  // Le monstre du mur : sur le calque d'apparition, il sort du noir de temps en temps,
  // en fondu lent. Il ne vacille pas avec l'ampoule : il n'est pas éclairé par elle.
  paintWallMonster(apparitionPainter);

  // Ampoule nue
  scenePainter.drawLine(40, 0, 40, 20, '#2a2a22');
  scenePainter.fillRect(38, 20, 5, 2, '#3b3b30');
  lightPainter.fillCircle(40, 24, 2, '#f5c26b');
  lightPainter.paintGlow(40, 24, 24, '#e8a33d', 0.12);

  // Vieux canapé posé sous l'ampoule, les pieds dans l'eau (dans la zone visible de la TV)
  scenePainter.fillRect(28, 72, 26, 8, '#3d4a3a');
  scenePainter.fillRect(28, 66, 26, 6, '#4a5a48');
  scenePainter.fillRect(28, 66, 26, 1, '#5a6a56');
  scenePainter.fillRect(26, 68, 4, 13, '#3d4a3a');
  scenePainter.fillRect(52, 68, 4, 13, '#3d4a3a');
  scenePainter.fillRect(30, 73, 10, 1, '#4a5a48');
  scenePainter.fillRect(42, 73, 10, 1, '#4a5a48');
  scenePainter.setOpacity(0.85);
  scenePainter.fillRect(0, 80, 64, 4, '#121a2c');
  scenePainter.setOpacity(1);
}
