import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

const CURTAIN_FOLD_COLORS: readonly string[] = [
  '#5a2429',
  '#4a1d22',
  '#3a1619',
  '#2b1013',
  '#3a1619',
  '#4a1d22',
];
const CURTAIN_FOLD_WIDTH: number = 3;

/** Late Night with the Devil : le plateau TV de 1977, rideau, bureau orange et « ON AIR ». */
export function paintLateNightWithTheDevilScene(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
): void {
  // Rideau à plis
  for (let curtainX: number = 0; curtainX < 128; curtainX++) {
    const foldColor: string =
      CURTAIN_FOLD_COLORS[Math.floor(curtainX / CURTAIN_FOLD_WIDTH) % CURTAIN_FOLD_COLORS.length];
    scenePainter.fillRect(curtainX, 0, 1, 74, foldColor);
  }
  scenePainter.fillRect(0, 70, 128, 4, '#2b1013');

  // Sol du plateau
  scenePainter.fillRect(0, 74, 128, 22, '#161220');
  for (let floorLineY: number = 76; floorLineY < 96; floorLineY += 4) {
    scenePainter.fillRect(0, floorLineY, 128, 1, '#1d1829');
  }

  // Faisceaux des projecteurs
  lightPainter.setOpacity(0.06);
  lightPainter.fillPolygon(
    [
      [30, 0],
      [50, 0],
      [60, 74],
      [16, 74],
    ],
    '#e9e2cf',
  );
  lightPainter.fillPolygon(
    [
      [84, 0],
      [104, 0],
      [118, 74],
      [76, 74],
    ],
    '#e9e2cf',
  );
  lightPainter.setOpacity(1);

  // Panneau « ON AIR »
  scenePainter.fillRect(46, 4, 36, 13, '#2a1f1c');
  scenePainter.fillRect(47, 5, 34, 11, '#3a1619');
  lightPainter.fillRect(47, 5, 34, 11, '#c0392b');
  lightPainter.writePixelText('ON AIR', 53, 8, '#ffe1da');
  lightPainter.paintGlow(64, 10, 22, '#e24b4a', 0.1);

  // Jack Delroy derrière son bureau
  scenePainter.fillCircle(92, 42, 6, '#0c0a17');
  scenePainter.fillRect(90, 36, 6, 2, '#1a1414');
  scenePainter.fillPolygon(
    [
      [80, 50],
      [104, 50],
      [106, 60],
      [78, 60],
    ],
    '#0c0a17',
  );

  // Bureau rayé années 70 et logo lune
  scenePainter.fillRect(66, 58, 52, 4, '#7a5030');
  scenePainter.fillRect(66, 62, 52, 18, '#5a3a22');
  scenePainter.fillRect(66, 65, 52, 2, '#e8a33d');
  scenePainter.fillRect(66, 68, 52, 2, '#b8742a');
  scenePainter.fillRect(66, 71, 52, 1, '#8e4a1e');
  scenePainter.fillCircle(92, 75, 3, '#e9e2cf');
  scenePainter.fillCircle(93, 74, 2, '#5a3a22');

  // Micro
  scenePainter.drawLine(80, 58, 80, 51, '#8d86a3');
  scenePainter.fillRect(79, 49, 3, 3, '#b8b0c9');

  // Fauteuil orange et invitée
  scenePainter.fillRect(14, 58, 22, 8, '#b8742a');
  scenePainter.fillRect(12, 48, 6, 18, '#9a5f22');
  scenePainter.fillRect(14, 66, 2, 8, '#5a3a22');
  scenePainter.fillRect(32, 66, 2, 8, '#5a3a22');
  scenePainter.fillRect(14, 58, 22, 1, '#d08a3a');
  scenePainter.fillCircle(25, 46, 4, '#0c0a17');
  scenePainter.fillRect(19, 45, 2, 8, '#0c0a17');
  scenePainter.fillRect(30, 45, 2, 8, '#0c0a17');
  scenePainter.fillRect(21, 50, 10, 9, '#0c0a17');

  // Caméra au premier plan
  scenePainter.fillRect(2, 62, 14, 10, '#2c2640');
  scenePainter.fillRect(16, 64, 4, 6, '#3a3448');
  scenePainter.fillRect(19, 65, 2, 4, '#8d86a3');
  scenePainter.drawLine(9, 72, 3, 95, '#2c2640', 2);
  scenePainter.drawLine(9, 72, 15, 95, '#2c2640', 2);
}
