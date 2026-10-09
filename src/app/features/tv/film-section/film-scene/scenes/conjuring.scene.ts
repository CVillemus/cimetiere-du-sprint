import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

/**
 * L'apparition de Bathsheba : à peine un fragment de visage, coincé dans la fente noire
 * entre les deux portes de l'armoire (x 48 à 50). Un œil, une joue grise, une mèche.
 * Couleurs sourdes exprès : on doit se demander si on l'a vraiment vue.
 */
function paintBathshebaApparition(apparitionPainter: PixelPainter): void {
  // Joue et front, gris livide, plus sombres côté gauche (dans l'ombre de la porte)
  apparitionPainter.fillRect(49, 27, 2, 10, '#6e7487');
  apparitionPainter.fillRect(48, 28, 1, 8, '#4f5466');
  apparitionPainter.fillPixel(49, 37, '#4f5466');

  // Un seul œil, noir, qui fixe la pièce
  apparitionPainter.fillRect(49, 30, 1, 2, '#07060c');
  apparitionPainter.fillPixel(50, 30, '#8d93a6');

  // Une mèche de cheveux qui barre le visage
  apparitionPainter.fillRect(48, 26, 3, 1, '#0a0812');
  apparitionPainter.fillRect(48, 27, 1, 6, '#0a0812');
  apparitionPainter.fillPixel(50, 33, '#0a0812');
}

/**
 * Conjuring : « tape, tape ». Deux mains sortent de l'armoire, la boîte à musique veille…
 * et de temps en temps, un œil de Bathsheba se devine dans l'entrebâillement.
 */
export function paintConjuringScene(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
  apparitionPainter: PixelPainter,
): void {
  paintBathshebaApparition(apparitionPainter);

  scenePainter.fillVerticalGradient(0, 0, 128, 78, ['#14111f', '#181428', '#1c1830']);
  for (let stripeX: number = 4; stripeX < 128; stripeX += 10) {
    scenePainter.fillRect(stripeX, 0, 1, 78, '#201b36');
  }
  scenePainter.paintPlanks(0, 78, 128, 18, '#2a1f1c', '#1f1714', 3);

  // Fenêtre et rayon de lune
  scenePainter.fillRect(96, 12, 22, 28, '#2a1f1c');
  scenePainter.fillRect(98, 14, 18, 24, '#1b2340');
  scenePainter.fillRect(106, 14, 2, 24, '#2a1f1c');
  scenePainter.fillRect(98, 25, 18, 2, '#2a1f1c');
  lightPainter.setOpacity(0.08);
  lightPainter.fillPolygon(
    [
      [98, 38],
      [116, 38],
      [100, 96],
      [70, 96],
    ],
    '#9fb0d9',
  );
  lightPainter.setOpacity(1);

  // Armoire
  scenePainter.fillRect(26, 14, 46, 4, '#4a372d');
  scenePainter.fillRect(28, 18, 42, 62, '#3b2c26');
  scenePainter.fillRect(30, 80, 4, 4, '#2a1f1c');
  scenePainter.fillRect(64, 80, 4, 4, '#2a1f1c');
  scenePainter.fillRect(31, 22, 16, 26, '#2f231e');
  scenePainter.fillRect(31, 52, 16, 24, '#2f231e');
  scenePainter.fillRect(53, 22, 14, 26, '#2f231e');
  scenePainter.fillRect(53, 52, 14, 24, '#2f231e');
  scenePainter.fillRect(48, 18, 3, 62, '#07060c');
  scenePainter.fillRect(51, 18, 1, 62, '#4a372d');
  scenePainter.fillPixel(46, 49, '#b8742a');
  scenePainter.fillPixel(54, 49, '#b8742a');

  // Les deux mains qui tapent
  scenePainter.fillRect(45, 44, 5, 4, '#d9cfc0');
  scenePainter.fillRect(44, 45, 1, 2, '#d9cfc0');
  scenePainter.fillRect(46, 43, 3, 1, '#cfc4b2');
  scenePainter.fillRect(46, 48, 3, 1, '#b8ad9b');
  scenePainter.fillRect(52, 44, 5, 4, '#d9cfc0');
  scenePainter.fillRect(57, 45, 1, 2, '#d9cfc0');
  scenePainter.fillRect(53, 43, 3, 1, '#cfc4b2');
  scenePainter.fillRect(53, 48, 3, 1, '#b8ad9b');

  // Commode
  scenePainter.fillRect(84, 60, 34, 4, '#4a372d');
  scenePainter.fillRect(86, 64, 30, 18, '#3b2c26');
  scenePainter.fillRect(88, 67, 26, 6, '#2f231e');
  scenePainter.fillRect(88, 75, 26, 5, '#2f231e');
  scenePainter.fillPixel(101, 70, '#b8742a');
  scenePainter.fillPixel(101, 77, '#b8742a');

  // Boîte à musique et son miroir
  scenePainter.fillRect(92, 54, 14, 6, '#5a3a22');
  scenePainter.fillRect(92, 44, 14, 10, '#4a372d');
  scenePainter.fillRect(94, 46, 10, 7, '#8d86a3');
  scenePainter.fillRect(95, 47, 3, 3, '#b8b0c9');
  scenePainter.fillRect(100, 49, 2, 3, '#14111f');
  scenePainter.fillRect(98, 52, 1, 3, '#e9e2cf');
  scenePainter.fillRect(97, 51, 3, 1, '#e9e2cf');
}
