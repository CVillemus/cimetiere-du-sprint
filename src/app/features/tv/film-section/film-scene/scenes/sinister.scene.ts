import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

/** Sinister : le grenier, le projecteur Super 8 qui tourne, et quelqu'un sur l'écran. */
export function paintSinisterScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  // Grenier mansardé
  scenePainter.fillRect(0, 0, 128, 96, '#1a1628');
  scenePainter.fillPolygon(
    [
      [0, 0],
      [40, 0],
      [0, 40],
    ],
    '#100d1a',
  );
  scenePainter.fillPolygon(
    [
      [128, 0],
      [88, 0],
      [128, 40],
    ],
    '#100d1a',
  );
  for (let beamIndex: number = 0; beamIndex < 5; beamIndex++) {
    scenePainter.drawLine(40 + beamIndex * 12, 0, 40 + beamIndex * 12, 76, '#211c32');
  }
  scenePainter.drawLine(0, 40, 40, 0, '#2a1f1c', 2);
  scenePainter.drawLine(128, 40, 88, 0, '#2a1f1c', 2);
  scenePainter.paintPlanks(0, 76, 128, 20, '#2a1f1c', '#1f1714', 3);

  // Écran
  scenePainter.fillRect(84, 20, 40, 32, '#2a2533');
  scenePainter.fillRect(86, 22, 36, 28, '#cfc6ae');
  lightPainter.fillRect(86, 22, 36, 28, '#d8cfb8');
  lightPainter.sprinkle(86, 22, 36, 28, '#a89f8a', 0.06);
  lightPainter.fillEllipse(104, 36, 9, 11, '#1a1210');
  lightPainter.fillEllipse(104, 35, 6, 8, '#efe8da');
  lightPainter.fillRect(100, 32, 3, 4, '#07060c');
  lightPainter.fillRect(106, 32, 3, 4, '#07060c');
  lightPainter.fillRect(102, 41, 5, 1, '#5a4a40');
  lightPainter.fillRect(86, 22, 36, 1, '#a89f8a');

  // Table et projecteur
  scenePainter.fillRect(6, 66, 36, 3, '#4a372d');
  scenePainter.fillRect(8, 69, 3, 14, '#3b2c26');
  scenePainter.fillRect(37, 69, 3, 14, '#3b2c26');
  scenePainter.fillRect(12, 52, 22, 14, '#3a3448');
  scenePainter.fillRect(12, 52, 22, 1, '#575166');
  scenePainter.fillRect(14, 56, 6, 1, '#2c2640');
  scenePainter.fillRect(34, 57, 5, 6, '#575166');
  scenePainter.fillRect(38, 58, 2, 4, '#b8b0c9');

  const reelCenters: readonly PixelPoint[] = [
    [18, 44],
    [30, 44],
  ];
  reelCenters.forEach(([x, y]: PixelPoint) => {
    scenePainter.fillCircle(x, y, 6, '#2c2640');
    scenePainter.fillCircle(x, y, 5, '#3a3448');
    scenePainter.drawLine(x - 4, y, x + 4, y, '#8d86a3');
    scenePainter.drawLine(x, y - 4, x, y + 4, '#8d86a3');
    scenePainter.fillPixel(x, y, '#e9e2cf');
  });
  scenePainter.fillRect(17, 49, 2, 4, '#2c2640');
  scenePainter.fillRect(29, 49, 2, 4, '#2c2640');

  // Faisceau du projecteur
  lightPainter.setOpacity(0.1);
  lightPainter.fillPolygon(
    [
      [40, 58],
      [86, 22],
      [86, 50],
      [40, 62],
    ],
    '#e9e2cf',
  );
  lightPainter.setOpacity(0.06);
  lightPainter.fillPolygon(
    [
      [40, 59],
      [86, 26],
      [86, 46],
      [40, 61],
    ],
    '#e9e2cf',
  );
  lightPainter.setOpacity(1);

  // Carton de bobines et bobine au sol
  scenePainter.fillRect(50, 72, 20, 12, '#7a5a3a');
  scenePainter.fillRect(50, 72, 20, 2, '#8d6a46');
  scenePainter.fillRect(58, 72, 4, 12, '#b8a07a');
  scenePainter.fillRect(48, 84, 24, 1, '#14111f');
  scenePainter.fillCircle(80, 86, 4, '#2c2640');
  scenePainter.fillCircle(80, 86, 1, '#8d86a3');
}
