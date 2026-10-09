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

/** L'horloge murale, arrêtée à 3 h 07 comme toutes celles de la maison des Perron. */
const CLOCK_CENTER_X: number = 88;
const CLOCK_CENTER_Y: number = 22;

function paintStoppedClock(scenePainter: PixelPainter): void {
  // Caisse à balancier, vitrée
  scenePainter.fillRect(83, 28, 11, 26, '#3b2c26');
  scenePainter.fillRect(83, 28, 1, 26, '#4a372d');
  scenePainter.fillRect(85, 31, 7, 19, '#1a1626');
  scenePainter.fillRect(88, 31, 1, 12, '#8a6a3a');
  scenePainter.fillCircle(88, 45, 2, '#b8742a');
  scenePainter.fillPixel(87, 44, '#e6c27a');
  scenePainter.fillRect(84, 54, 9, 2, '#2a1f1c');

  // Cadran rond
  scenePainter.fillCircle(CLOCK_CENTER_X, CLOCK_CENTER_Y, 7, '#4a372d');
  scenePainter.fillCircle(CLOCK_CENTER_X, CLOCK_CENTER_Y, 5, '#d8cfb8');
  [
    [0, -4],
    [4, 0],
    [0, 4],
    [-4, 0],
  ].forEach(([offsetX, offsetY]: number[]) =>
    scenePainter.fillPixel(CLOCK_CENTER_X + offsetX, CLOCK_CENTER_Y + offsetY, '#5a4334'),
  );
  // Aiguilles figées : la petite sur le 3, la grande sur 7 minutes
  scenePainter.drawLine(
    CLOCK_CENTER_X,
    CLOCK_CENTER_Y,
    CLOCK_CENTER_X + 3,
    CLOCK_CENTER_Y,
    '#1a1210',
  );
  scenePainter.drawLine(
    CLOCK_CENTER_X,
    CLOCK_CENTER_Y,
    CLOCK_CENTER_X + 2,
    CLOCK_CENTER_Y - 4,
    '#1a1210',
  );
  scenePainter.fillPixel(CLOCK_CENTER_X, CLOCK_CENTER_Y, '#8e2a2a');
}

/**
 * Conjuring : la chambre des Perron. L'armoire du jeu de cache-cache, l'horloge arrêtée à 3 h 07,
 * un rayon de lune… et de temps en temps, un œil de Bathsheba dans l'entrebâillement.
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

  // Rayon de lune venu d'une fenêtre hors champ, qui glisse sur le mur et le parquet
  lightPainter.setOpacity(0.08);
  lightPainter.fillPolygon(
    [
      [108, 0],
      [128, 0],
      [104, 96],
      [74, 96],
    ],
    '#9fb0d9',
  );
  lightPainter.setOpacity(1);

  paintStoppedClock(scenePainter);

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
}
