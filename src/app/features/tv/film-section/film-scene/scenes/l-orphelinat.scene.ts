import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

/** L'Orphelinat : la façade au crépuscule. Sur le perron, l'enfant au masque de toile. */
export function paintLOrphelinatScene(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
): void {
  scenePainter.fillVerticalGradient(0, 0, 128, 40, ['#1e1730', '#2a1f3a', '#3a2840', '#4a3040']);
  scenePainter.paintStars(12, 18);

  // La mer à l'horizon
  scenePainter.fillRect(0, 30, 128, 10, '#1a2440');
  scenePainter.fillRect(0, 30, 128, 1, '#2b3a5c');

  // Toit et lucarnes
  scenePainter.fillPolygon(
    [
      [8, 26],
      [64, 8],
      [120, 26],
    ],
    '#2a2533',
  );
  for (let tileY: number = 12; tileY < 26; tileY += 3) {
    const halfWidth: number = (tileY - 8) * 3.1;
    scenePainter.drawLine(64 - halfWidth, tileY, 64 + halfWidth, tileY, '#221e2b');
  }
  [30, 64, 98].forEach((dormerX: number) => {
    scenePainter.fillPolygon(
      [
        [dormerX - 6, 22],
        [dormerX, 15],
        [dormerX + 6, 22],
      ],
      '#2a2533',
    );
    scenePainter.fillRect(dormerX - 4, 20, 8, 7, '#4a4556');
    scenePainter.fillRect(dormerX - 2, 21, 4, 5, '#14111f');
  });

  // Façade en pierre
  scenePainter.fillRect(10, 26, 108, 52, '#5a5468');
  scenePainter.sprinkle(10, 26, 108, 52, '#4a4556', 0.15);
  scenePainter.sprinkle(10, 26, 108, 52, '#6b6577', 0.06);
  scenePainter.fillRect(10, 26, 108, 2, '#3a3448');

  // Hautes fenêtres à croisillons
  [16, 30, 44, 78, 92, 106].forEach((windowX: number) => {
    [32, 52].forEach((windowY: number) => {
      scenePainter.fillRect(windowX, windowY, 8, 13, '#cfc6ae');
      scenePainter.fillRect(windowX + 1, windowY + 1, 6, 11, '#14111f');
      scenePainter.fillRect(windowX + 4, windowY + 1, 1, 11, '#cfc6ae');
      scenePainter.fillRect(windowX + 1, windowY + 6, 6, 1, '#cfc6ae');
    });
  });
  lightPainter.fillRect(93, 33, 6, 11, '#e8a33d');
  lightPainter.fillRect(96, 33, 1, 11, '#cfc6ae');
  lightPainter.fillRect(93, 38, 6, 1, '#cfc6ae');
  lightPainter.paintGlow(96, 38, 12, '#e8a33d', 0.12);

  // Porche, porte ouverte et marches
  scenePainter.fillRect(54, 48, 20, 30, '#3a3448');
  scenePainter.fillPolygon(
    [
      [52, 48],
      [64, 40],
      [76, 48],
    ],
    '#3a3448',
  );
  scenePainter.fillRect(57, 52, 14, 26, '#07060c');
  scenePainter.fillRect(48, 78, 32, 3, '#6b6577');
  scenePainter.fillRect(44, 81, 40, 3, '#575166');

  // L'enfant au masque de toile
  scenePainter.fillRect(61, 66, 7, 12, '#3a3352');
  scenePainter.fillRect(60, 68, 1, 6, '#e8dfcf');
  scenePainter.fillRect(68, 68, 1, 6, '#e8dfcf');
  scenePainter.fillRect(62, 78, 2, 3, '#1a1210');
  scenePainter.fillRect(65, 78, 2, 3, '#1a1210');
  scenePainter.fillRect(60, 56, 9, 10, '#b8a07a');
  scenePainter.fillRect(61, 55, 7, 1, '#a88f68');
  scenePainter.sprinkle(60, 56, 9, 10, '#9a8460', 0.15);
  scenePainter.fillRect(61, 58, 2, 2, '#2a1f1c');
  scenePainter.fillRect(66, 58, 2, 2, '#2a1f1c');
  scenePainter.fillRect(62, 63, 5, 1, '#5a3a22');
  scenePainter.fillPixel(61, 62, '#5a3a22');
  scenePainter.fillPixel(67, 62, '#5a3a22');
  scenePainter.fillRect(60, 65, 9, 1, '#7a6040');

  // Jardin et brume
  scenePainter.fillRect(0, 84, 128, 12, '#1f2a1a');
  scenePainter.sprinkle(0, 84, 128, 12, '#3d5230', 0.12);
  scenePainter.sprinkle(0, 84, 128, 12, '#4a4a3a', 0.08);
  scenePainter.paintFog(86, 0.08);
}
