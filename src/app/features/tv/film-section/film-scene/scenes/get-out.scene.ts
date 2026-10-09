import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

/** Get Out : la tasse et la cuillère qui tinte, au-dessus du vide du « Sunken Place ». */
export function paintGetOutScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.fillVerticalGradient(0, 0, 128, 96, ['#040309', '#07060f', '#0a0814', '#0d0b18']);
  scenePainter.sprinkle(0, 0, 128, 60, '#2c2640', 0.01);

  // La petite fenêtre sur le salon, tout là-haut
  scenePainter.fillRect(46, 6, 36, 22, '#2c2640');
  scenePainter.fillRect(48, 8, 32, 18, '#3a3352');
  scenePainter.fillRect(48, 20, 32, 6, '#4a372d');
  scenePainter.fillRect(52, 13, 9, 9, '#5a3a22');
  scenePainter.fillRect(53, 11, 7, 3, '#6e4a2c');
  scenePainter.fillRect(72, 10, 1, 10, '#8d86a3');
  lightPainter.fillRect(69, 9, 7, 3, '#e8a33d');
  lightPainter.paintGlow(72, 11, 10, '#e8a33d', 0.12);

  // Chris qui tombe
  scenePainter.fillRect(63, 34, 2, 4, '#8d86a3');
  scenePainter.fillPixel(62, 33, '#8d86a3');
  scenePainter.fillPixel(65, 33, '#8d86a3');
  scenePainter.fillPixel(63, 38, '#8d86a3');
  scenePainter.fillPixel(64, 39, '#8d86a3');

  // Soucoupe
  scenePainter.fillEllipse(64, 88, 44, 5, '#bdb5a2');
  scenePainter.fillEllipse(64, 87, 42, 4, '#e6dfcf');
  scenePainter.fillEllipse(64, 86, 20, 2, '#cfc6ae');

  // Tasse en porcelaine
  for (let rowY: number = 58; rowY <= 84; rowY++) {
    const halfWidth: number = Math.round(27 - (rowY - 58) ** 2 / 48);
    scenePainter.fillRect(64 - halfWidth, rowY, halfWidth * 2, 1, '#efe9db');
    scenePainter.fillRect(64 + halfWidth - 6, rowY, 6, 1, '#d3cbb8');
    scenePainter.fillRect(64 - halfWidth + 2, rowY, 2, 1, '#fffaf0');
  }
  for (let flowerIndex: number = 0; flowerIndex < 9; flowerIndex++) {
    const flowerX: number = 42 + flowerIndex * 5;
    scenePainter.fillRect(flowerX, 68, 3, 3, '#4a5a8a');
    scenePainter.fillPixel(flowerX + 1, 67, '#4a5a8a');
    scenePainter.fillPixel(flowerX + 1, 71, '#6a7bb0');
  }
  scenePainter.fillRect(40, 74, 48, 1, '#4a5a8a');

  // Anse
  for (let angle: number = 0; angle < 6.3; angle += 0.15) {
    scenePainter.fillRect(91 + 7 * Math.cos(angle), 69 + 6 * Math.sin(angle), 2, 2, '#e2dbcb');
  }
  scenePainter.fillRect(88, 64, 3, 11, '#efe9db');

  // Thé et remous
  scenePainter.fillEllipse(64, 58, 27, 5, '#efe9db');
  scenePainter.fillEllipse(64, 58, 24, 4, '#5b3a1e');
  scenePainter.fillEllipse(62, 58, 12, 2, '#6e4a2a');
  scenePainter.fillEllipse(62, 58, 6, 1, '#7a5530');

  // Cuillère en argent
  scenePainter.drawLine(84, 26, 67, 56, '#9a94ac', 2);
  scenePainter.drawLine(85, 26, 68, 56, '#e9e2cf', 1);
  scenePainter.fillEllipse(66, 57, 3, 1, '#b8b0c9');
}
