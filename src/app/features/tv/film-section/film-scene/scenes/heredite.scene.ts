import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

/** Hérédité : la maison miniature d'Annie en coupe. Par la fenêtre, la cabane rougeoie. */
export function paintHerediteScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.fillRect(0, 0, 128, 96, '#16121f');
  scenePainter.sprinkle(0, 0, 128, 80, '#1a1626', 0.08);

  // Fenêtre de l'atelier et cabane dans l'arbre
  scenePainter.fillRect(98, 10, 26, 32, '#2a1f1c');
  scenePainter.fillRect(100, 12, 22, 28, '#0d0b18');
  scenePainter.fillRect(108, 24, 2, 16, '#0a0814');
  scenePainter.fillRect(102, 18, 14, 10, '#2a1f1c');
  scenePainter.fillRect(103, 20, 12, 7, '#3b2c26');
  lightPainter.fillRect(106, 22, 4, 3, '#c0392b');
  lightPainter.paintGlow(108, 23, 9, '#c0392b', 0.2);

  // Établi
  scenePainter.paintPlanks(0, 80, 128, 16, '#3b2c26', '#2f231e', 4);
  scenePainter.fillRect(0, 80, 128, 1, '#4a372d');

  // Toit de la maison miniature
  scenePainter.fillPolygon(
    [
      [10, 30],
      [48, 8],
      [86, 30],
    ],
    '#2a1f1c',
  );
  for (let shingleY: number = 12; shingleY < 30; shingleY += 3) {
    const halfWidth: number = (shingleY - 8) * 1.7;
    scenePainter.drawLine(48 - halfWidth, shingleY, 48 + halfWidth, shingleY, '#1e1614');
  }
  scenePainter.fillPolygon(
    [
      [20, 29],
      [48, 13],
      [76, 29],
    ],
    '#3b2c26',
  );
  scenePainter.fillPolygon(
    [
      [24, 29],
      [48, 16],
      [72, 29],
    ],
    '#2b2540',
  );

  // Structure et pièces
  scenePainter.fillRect(14, 30, 68, 50, '#4a372d');
  scenePainter.fillRect(16, 32, 31, 22, '#6a4a24');
  for (let wallpaperX: number = 18; wallpaperX < 47; wallpaperX += 4) {
    scenePainter.fillRect(wallpaperX, 32, 1, 22, '#5e4120');
  }
  scenePainter.fillRect(49, 32, 31, 22, '#2b2540');
  scenePainter.fillRect(16, 56, 31, 22, '#2b2540');
  scenePainter.fillRect(49, 56, 31, 22, '#3a2f2a');
  scenePainter.fillRect(14, 54, 68, 2, '#4a372d');
  scenePainter.fillRect(47, 32, 2, 48, '#4a372d');

  // Salon : canapé, tableau, figurine
  scenePainter.fillRect(22, 44, 10, 6, '#5a2f2f');
  scenePainter.fillRect(22, 42, 10, 2, '#6e3a3a');
  scenePainter.fillRect(36, 36, 6, 5, '#3b2c26');
  scenePainter.fillRect(37, 37, 4, 3, '#8d86a3');
  scenePainter.fillRect(30, 38, 2, 6, '#0c0a17');
  scenePainter.fillPixel(30, 37, '#0c0a17');

  // Chambre
  scenePainter.fillRect(54, 46, 18, 5, '#cfc6ae');
  scenePainter.fillRect(54, 44, 4, 2, '#e9e2cf');
  scenePainter.fillRect(60, 45, 9, 2, '#3a3352');

  // Escalier
  scenePainter.drawLine(18, 77, 40, 58, '#5a4334', 2);
  for (let stepIndex: number = 0; stepIndex < 7; stepIndex++) {
    scenePainter.fillRect(18 + stepIndex * 3, 75 - stepIndex * 3, 4, 1, '#6e5240');
  }

  // Bureau miniature et sa lampe
  scenePainter.fillRect(54, 70, 16, 6, '#3d4a3a');
  scenePainter.fillRect(54, 66, 16, 4, '#4a5a48');
  scenePainter.fillRect(70, 62, 1, 14, '#8d86a3');
  lightPainter.fillRect(68, 61, 4, 2, '#e8a33d');
  lightPainter.paintGlow(70, 62, 8, '#e8a33d', 0.15);
  lightPainter.paintGlow(31, 40, 12, '#e8a33d', 0.1);
}
