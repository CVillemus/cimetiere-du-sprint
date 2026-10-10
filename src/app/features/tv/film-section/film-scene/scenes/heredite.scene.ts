import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

/**
 * Maison miniature d'Annie, en coupe, centrée dans la zone visible de la TV (x ≈ 24 à 104).
 * Deux étages de deux pièces, et le grenier sous le toit.
 */
const HOUSE_LEFT: number = 30;
const HOUSE_RIGHT: number = 98;
const HOUSE_TOP: number = 34;
const HOUSE_BOTTOM: number = 82;
const FRAME_COLOR: string = '#4a372d';
const FRAME_HIGHLIGHT: string = '#5a4334';

type Room = readonly [left: number, top: number, width: number, height: number];
const CHARLIE_ROOM: Room = [32, 36, 31, 21];
const PARENTS_ROOM: Room = [66, 36, 30, 21];
const LIVING_ROOM: Room = [32, 60, 31, 21];
const SEANCE_ROOM: Room = [66, 60, 30, 21];

/** Le sceau de Paimon, gravé au mur du grenier. */
const PAIMON_SIGIL_CENTER: PixelPoint = [64, 25];
const PAIMON_SIGIL_RADIUS: number = 5;

function paintWallpaper(
  scenePainter: PixelPainter,
  [left, top, width, height]: Room,
  baseColor: string,
  patternColor: string,
  patternStep: number,
): void {
  scenePainter.fillRect(left, top, width, height, baseColor);
  for (let patternY: number = top + 2; patternY < top + height - 4; patternY += patternStep) {
    for (
      let patternX: number = left + 2 + (patternY % 2);
      patternX < left + width;
      patternX += patternStep
    ) {
      scenePainter.fillPixel(patternX, patternY, patternColor);
    }
  }
  // Plinthe et ombre du plafond
  scenePainter.fillRect(left, top + height - 1, width, 1, '#2a1f1c');
  scenePainter.fillRect(left, top, width, 1, '#1a1210');
}

/**
 * Escalier du salon, vu en coupe : six marches qui montent vers la droite jusqu'au plancher de l'étage,
 * la masse pleine sous les marches, et une rampe à barreaux.
 */
const STAIR_STEP_COUNT: number = 6;
const STAIR_LEFT: number = 33;
const STAIR_FLOOR_Y: number = 80;
const STAIR_RUN: number = 2;
const STAIR_RISE: number = 3;

function paintStaircase(scenePainter: PixelPainter): void {
  const stairRight: number = STAIR_LEFT + STAIR_STEP_COUNT * STAIR_RUN;
  for (let stepIndex: number = 0; stepIndex < STAIR_STEP_COUNT; stepIndex++) {
    const stepLeft: number = STAIR_LEFT + stepIndex * STAIR_RUN;
    const treadY: number = STAIR_FLOOR_Y - (stepIndex + 1) * STAIR_RISE;
    // Masse de la marche, jusqu'au sol, puis son nez éclairé et l'ombre de la contremarche
    scenePainter.fillRect(
      stepLeft,
      treadY,
      stairRight - stepLeft,
      STAIR_FLOOR_Y - treadY,
      '#3b2c26',
    );
    scenePainter.fillRect(stepLeft, treadY, STAIR_RUN + 1, 1, '#6e5240');
    scenePainter.fillRect(stepLeft, treadY + 1, 1, STAIR_RISE - 1, '#2a1f1c');
  }
  // Limon : la planche qui ferme l'escalier sur le côté
  scenePainter.drawLine(
    STAIR_LEFT,
    STAIR_FLOOR_Y - 1,
    stairRight,
    STAIR_FLOOR_Y - STAIR_STEP_COUNT * STAIR_RISE - 1,
    '#4a372d',
  );
  // Rampe et barreaux, au-dessus des marches
  scenePainter.drawLine(
    STAIR_LEFT + 1,
    STAIR_FLOOR_Y - 9,
    stairRight + 1,
    STAIR_FLOOR_Y - STAIR_STEP_COUNT * STAIR_RISE - 7,
    '#2a1f1c',
  );
  for (let stepIndex: number = 0; stepIndex < STAIR_STEP_COUNT; stepIndex += 2) {
    const balusterX: number = STAIR_LEFT + 1 + stepIndex * STAIR_RUN;
    const treadY: number = STAIR_FLOOR_Y - (stepIndex + 1) * STAIR_RISE;
    scenePainter.fillRect(balusterX, treadY - 6, 1, 6, '#2a1f1c');
  }
}

function paintPaimonSigil(painter: PixelPainter, color: string): void {
  const [centerX, centerY]: PixelPoint = PAIMON_SIGIL_CENTER;
  for (let angle: number = 0; angle < Math.PI * 2; angle += 0.2) {
    painter.fillPixel(
      Math.round(centerX + Math.cos(angle) * PAIMON_SIGIL_RADIUS),
      Math.round(centerY + Math.sin(angle) * PAIMON_SIGIL_RADIUS),
      color,
    );
  }
  painter.drawLine(centerX, centerY - 3, centerX - 3, centerY + 2, color);
  painter.drawLine(centerX, centerY - 3, centerX + 3, centerY + 2, color);
  painter.drawLine(centerX - 3, centerY + 2, centerX + 3, centerY + 2, color);
  painter.fillPixel(centerX, centerY, color);
}

/**
 * Hérédité : la maison de poupée d'Annie sur l'établi. Chaque pièce rappelle le film :
 * la chambre de Charlie, le salon et le portrait de la grand-mère, la table de la séance,
 * le sceau de Paimon au grenier, et par la fenêtre de l'atelier, la cabane qui rougeoie.
 */
export function paintHerediteScene(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
  apparitionPainter: PixelPainter,
): void {
  // Mur de l'atelier, papier peint à rayures discrètes
  scenePainter.fillRect(0, 0, 128, 96, '#16121f');
  for (let stripeX: number = 2; stripeX < 128; stripeX += 6) {
    scenePainter.fillRect(stripeX, 0, 1, 82, '#1a1626');
  }

  // Fenêtre de l'atelier : dans la nuit, la cabane dans l'arbre
  scenePainter.fillRect(24, 4, 16, 19, '#2a1f1c');
  scenePainter.fillRect(25, 5, 14, 17, '#0a0814');
  scenePainter.drawLine(27, 21, 31, 12, '#1a1210');
  scenePainter.fillRect(29, 11, 8, 5, '#2a1f1c');
  scenePainter.fillRect(31, 13, 3, 2, '#14101c');
  scenePainter.fillRect(31, 5, 1, 17, '#2a1f1c');
  lightPainter.fillRect(31, 13, 3, 2, '#c0392b');
  lightPainter.paintGlow(32, 14, 7, '#c0392b', 0.22);

  // Toit et grenier
  scenePainter.fillPolygon(
    [
      [HOUSE_LEFT - 4, HOUSE_TOP],
      [64, 8],
      [HOUSE_RIGHT + 4, HOUSE_TOP],
    ],
    '#2a1f1c',
  );
  for (let shingleY: number = 12; shingleY < HOUSE_TOP; shingleY += 3) {
    const halfWidth: number = (shingleY - 8) * 1.46;
    scenePainter.drawLine(64 - halfWidth, shingleY, 64 + halfWidth, shingleY, '#1e1614');
  }
  scenePainter.fillPolygon(
    [
      [HOUSE_LEFT + 4, HOUSE_TOP - 1],
      [64, 13],
      [HOUSE_RIGHT - 4, HOUSE_TOP - 1],
    ],
    '#211a2e',
  );
  paintPaimonSigil(scenePainter, '#4a3a22');

  // Ossature de la maison
  scenePainter.fillRect(
    HOUSE_LEFT,
    HOUSE_TOP,
    HOUSE_RIGHT - HOUSE_LEFT,
    HOUSE_BOTTOM - HOUSE_TOP,
    FRAME_COLOR,
  );
  scenePainter.fillRect(HOUSE_LEFT, HOUSE_TOP, HOUSE_RIGHT - HOUSE_LEFT, 1, FRAME_HIGHLIGHT);

  // Chambre de Charlie : papier vert, petit lit, dessins punaisés
  paintWallpaper(scenePainter, CHARLIE_ROOM, '#34402f', '#3f4c39', 4);
  scenePainter.fillRect(36, 50, 13, 4, '#cfc6ae');
  scenePainter.fillRect(36, 52, 13, 2, '#5a2f2f');
  scenePainter.fillRect(36, 48, 2, 6, '#5a4334');
  scenePainter.fillRect(38, 49, 3, 2, '#e9e2cf');
  scenePainter.fillRect(39, 48, 2, 2, '#3a2a20');
  scenePainter.fillRect(52, 40, 3, 3, '#e9e2cf');
  scenePainter.fillRect(56, 42, 3, 3, '#d8cfb8');
  scenePainter.fillPixel(53, 41, '#1a1210');
  scenePainter.fillPixel(57, 43, '#8e2a2a');

  // Chambre des parents : papier mauve, grand lit
  paintWallpaper(scenePainter, PARENTS_ROOM, '#3e3247', '#4a3c54', 5);
  scenePainter.fillRect(70, 45, 2, 9, '#5a4334');
  scenePainter.fillRect(70, 50, 20, 4, '#cfc6ae');
  scenePainter.fillRect(74, 50, 16, 3, '#3a3352');
  scenePainter.fillRect(72, 49, 3, 2, '#e9e2cf');
  scenePainter.fillRect(84, 40, 5, 4, '#3b2c26');
  scenePainter.fillRect(85, 41, 3, 2, '#5a5468');

  // Plancher entre les deux étages, mur de refend
  scenePainter.fillRect(HOUSE_LEFT, 57, HOUSE_RIGHT - HOUSE_LEFT, 3, FRAME_COLOR);
  scenePainter.fillRect(HOUSE_LEFT, 57, HOUSE_RIGHT - HOUSE_LEFT, 1, FRAME_HIGHLIGHT);
  scenePainter.fillRect(63, HOUSE_TOP, 3, HOUSE_BOTTOM - HOUSE_TOP, FRAME_COLOR);

  // Salon : escalier, canapé, portrait de la grand-mère
  paintWallpaper(scenePainter, LIVING_ROOM, '#5e4222', '#6a4a26', 4);
  paintStaircase(scenePainter);
  scenePainter.fillRect(48, 74, 12, 5, '#5a2f2f');
  scenePainter.fillRect(48, 72, 12, 2, '#6e3a3a');
  scenePainter.fillRect(48, 72, 1, 7, '#4a2626');
  scenePainter.fillRect(51, 63, 7, 8, '#2a1f1c');
  scenePainter.fillRect(52, 64, 5, 6, '#3a3352');
  scenePainter.fillRect(53, 65, 3, 3, '#cfc6ae');
  scenePainter.fillRect(53, 64, 3, 1, '#8d86a3');

  // Salle à manger : la table de la séance, sa bougie et le verre retourné
  paintWallpaper(scenePainter, SEANCE_ROOM, '#2b2540', '#332c4a', 5);
  scenePainter.fillRect(70, 72, 22, 2, '#5a4334');
  scenePainter.fillRect(72, 74, 1, 6, '#3b2c26');
  scenePainter.fillRect(89, 74, 1, 6, '#3b2c26');
  scenePainter.fillRect(68, 68, 2, 12, '#3b2c26');
  scenePainter.fillRect(92, 68, 2, 12, '#3b2c26');
  scenePainter.fillRect(80, 69, 1, 3, '#e9e2cf');
  scenePainter.fillRect(75, 70, 2, 2, '#8d86a3');
  lightPainter.fillPixel(80, 68, '#f5c26b');
  lightPainter.paintGlow(80, 69, 10, '#e8a33d', 0.18);

  // Établi : pinces, pots de peinture, une figurine couchée
  scenePainter.paintPlanks(0, HOUSE_BOTTOM, 128, 96 - HOUSE_BOTTOM, '#3b2c26', '#2f231e', 4);
  scenePainter.fillRect(0, HOUSE_BOTTOM, 128, 1, FRAME_HIGHLIGHT);
  scenePainter.drawLine(26, 86, 32, 90, '#9a94ac');
  scenePainter.drawLine(26, 87, 32, 91, '#6b6577');
  scenePainter.fillRect(36, 86, 3, 3, '#8e2a2a');
  scenePainter.fillRect(40, 86, 3, 3, '#3a4a6a');
  scenePainter.fillRect(36, 85, 3, 1, '#b8b0c9');
  scenePainter.fillRect(40, 85, 3, 1, '#b8b0c9');
  scenePainter.fillRect(46, 89, 6, 2, '#5a4a6a');
  scenePainter.fillRect(52, 89, 2, 2, '#e8dfcf');

  // Lampe d'atelier : la maison baigne dans une lumière chaude
  lightPainter.paintGlow(64, 50, 34, '#e8a33d', 0.06);

  // Apparition : Annie, accroupie dans l'angle du plafond de la chambre des parents
  apparitionPainter.fillRect(91, 37, 3, 2, '#1a1210');
  apparitionPainter.fillRect(92, 38, 2, 2, '#cfc6ae');
  apparitionPainter.fillRect(90, 40, 4, 3, '#2a2236');
  apparitionPainter.fillPixel(89, 39, '#cfc6ae');
  apparitionPainter.fillPixel(94, 42, '#cfc6ae');
}

/** Toutes les 6 s, le sceau de Paimon s'embrase lentement, puis s'éteint. */
const SIGIL_GLOW_PERIOD_IN_MILLISECONDS: number = 6_000;

/** Hérédité : le sceau du grenier qui rougeoie par paliers, comme une braise qu'on attise. */
export function animateHerediteScene(
  animationPainter: PixelPainter,
  elapsedMilliseconds: number,
): void {
  const glowWave: number =
    (1 -
      Math.cos(
        ((elapsedMilliseconds % SIGIL_GLOW_PERIOD_IN_MILLISECONDS) /
          SIGIL_GLOW_PERIOD_IN_MILLISECONDS) *
          Math.PI *
          2,
      )) /
    2;
  // Quatre paliers : un embrasement « pixel », pas un fondu lisse.
  const glowOpacity: number = Math.round(glowWave * 4) / 4;
  if (glowOpacity === 0) {
    return;
  }
  animationPainter.setOpacity(glowOpacity);
  paintPaimonSigil(animationPainter, '#e8a33d');
  animationPainter.setOpacity(1);
  animationPainter.paintGlow(
    PAIMON_SIGIL_CENTER[0],
    PAIMON_SIGIL_CENTER[1],
    9,
    '#e8a33d',
    0.15 * glowOpacity,
  );
}
