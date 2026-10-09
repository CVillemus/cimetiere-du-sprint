import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

type PineTree = readonly [x: number, baseY: number, height: number];

/** Mama : la cabane au fond des bois, et les papillons de nuit autour de la lumière. */
export function paintMamaScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.paintNightSky();
  scenePainter.paintStars(30, 50);
  scenePainter.paintMoon(104, 16, 7);

  const distantPines: readonly PineTree[] = [
    [10, 70, 30],
    [30, 72, 24],
    [22, 74, 34],
    [96, 70, 26],
    [118, 72, 36],
    [86, 73, 22],
  ];
  distantPines.forEach(([x, baseY, height]: PineTree) =>
    scenePainter.paintPine(x, baseY, height, '#1c1733'),
  );

  // Sol herbeux
  scenePainter.fillRect(0, 72, 128, 24, '#16201a');
  scenePainter.sprinkle(0, 72, 128, 24, '#1f2a1a', 0.25);
  scenePainter.sprinkle(0, 74, 128, 22, '#2b3a22', 0.06);

  // Cabane en rondins
  scenePainter.paintPlanks(46, 52, 40, 24, '#3b2c26', '#2a1f1c', 3);
  for (let logY: number = 53; logY < 76; logY += 3) {
    scenePainter.fillPixel(44, logY, '#4a372d');
    scenePainter.fillPixel(45, logY, '#5a4334');
    scenePainter.fillPixel(86, logY, '#4a372d');
    scenePainter.fillPixel(87, logY, '#5a4334');
  }

  // Toit
  scenePainter.fillPolygon(
    [
      [40, 54],
      [66, 34],
      [92, 54],
    ],
    '#241a17',
  );
  for (let shingleY: number = 38; shingleY < 54; shingleY += 3) {
    const halfWidth: number = (shingleY - 34) * 1.3;
    scenePainter.drawLine(66 - halfWidth, shingleY, 66 + halfWidth, shingleY, '#1a1210');
  }
  scenePainter.drawLine(40, 54, 66, 34, '#4a372d');
  scenePainter.drawLine(66, 34, 92, 54, '#4a372d');

  // Cheminée en pierre
  scenePainter.fillRect(76, 36, 6, 12, '#575166');
  scenePainter.fillRect(76, 36, 6, 1, '#7d778a');
  scenePainter.sprinkle(76, 37, 6, 11, '#4a4556', 0.3);

  // Porte et fenêtre condamnée
  scenePainter.fillRect(59, 60, 10, 16, '#4a372d');
  scenePainter.fillRect(60, 61, 8, 15, '#1a1210');
  scenePainter.fillPixel(66, 68, '#b8742a');
  scenePainter.fillRect(49, 58, 8, 8, '#1a1210');
  scenePainter.drawLine(49, 58, 56, 65, '#4a372d');
  scenePainter.drawLine(49, 65, 56, 58, '#4a372d');

  // Fenêtre éclairée
  scenePainter.fillRect(73, 57, 10, 9, '#2a1f1c');
  lightPainter.fillRect(74, 58, 8, 7, '#e8a33d');
  lightPainter.fillRect(77, 58, 1, 7, '#2a1f1c');
  lightPainter.fillRect(74, 61, 8, 1, '#2a1f1c');
  lightPainter.fillRect(75, 59, 2, 2, '#f5c26b');
  lightPainter.paintGlow(78, 61, 16, '#e8a33d', 0.14);

  // Papillons de nuit
  const moths: readonly PixelPoint[] = [
    [84, 52],
    [89, 57],
    [80, 49],
    [71, 52],
  ];
  moths.forEach(([x, y]: PixelPoint) => {
    lightPainter.fillPixel(x, y, '#e9e2cf');
    lightPainter.fillPixel(x - 1, y - 1, '#cfc6ae');
    lightPainter.fillPixel(x + 1, y - 1, '#cfc6ae');
  });

  const foregroundPines: readonly PineTree[] = [
    [0, 76, 40],
    [14, 80, 46],
    [118, 78, 44],
    [128, 82, 52],
  ];
  foregroundPines.forEach(([x, baseY, height]: PineTree) =>
    scenePainter.paintPine(x, baseY, height, '#0a0814'),
  );

  // Pierres du chemin
  scenePainter.fillRect(60, 77, 6, 2, '#3a3448');
  scenePainter.fillRect(62, 82, 6, 2, '#3a3448');
  scenePainter.fillRect(59, 88, 7, 2, '#3a3448');
  scenePainter.paintFog(76, 0.07);
}
