import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

/**
 * Sur la TV, le panneau ne montre que le centre du décor (x ≈ 24 à 104) :
 * le projecteur et l'écran sont resserrés pour rester entièrement visibles.
 */
const REEL_CENTERS: readonly PixelPoint[] = [
  [36, 44],
  [48, 44],
];
const REEL_RADIUS: number = 6;
const SCREEN_LEFT: number = 72;
const SCREEN_TOP: number = 22;
const SCREEN_WIDTH: number = 32;
const SCREEN_HEIGHT: number = 26;

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

  // Écran tendu au mur
  scenePainter.fillRect(
    SCREEN_LEFT - 2,
    SCREEN_TOP - 2,
    SCREEN_WIDTH + 4,
    SCREEN_HEIGHT + 4,
    '#2a2533',
  );
  scenePainter.fillRect(SCREEN_LEFT, SCREEN_TOP, SCREEN_WIDTH, SCREEN_HEIGHT, '#cfc6ae');
  lightPainter.fillRect(SCREEN_LEFT, SCREEN_TOP, SCREEN_WIDTH, SCREEN_HEIGHT, '#d8cfb8');
  lightPainter.sprinkle(SCREEN_LEFT, SCREEN_TOP, SCREEN_WIDTH, SCREEN_HEIGHT, '#a89f8a', 0.06);
  // Le visage de Bughuul, flou et blafard
  const faceX: number = SCREEN_LEFT + SCREEN_WIDTH / 2;
  const faceY: number = SCREEN_TOP + SCREEN_HEIGHT / 2;
  lightPainter.fillEllipse(faceX, faceY, 8, 10, '#1a1210');
  lightPainter.fillEllipse(faceX, faceY - 1, 5, 7, '#efe8da');
  lightPainter.fillRect(faceX - 4, faceY - 4, 3, 4, '#07060c');
  lightPainter.fillRect(faceX + 2, faceY - 4, 3, 4, '#07060c');
  lightPainter.fillRect(faceX - 2, faceY + 5, 5, 1, '#5a4a40');
  lightPainter.fillRect(SCREEN_LEFT, SCREEN_TOP, SCREEN_WIDTH, 1, '#a89f8a');

  // Table et projecteur
  scenePainter.fillRect(24, 66, 36, 3, '#4a372d');
  scenePainter.fillRect(26, 69, 3, 14, '#3b2c26');
  scenePainter.fillRect(55, 69, 3, 14, '#3b2c26');
  scenePainter.fillRect(30, 52, 22, 14, '#3a3448');
  scenePainter.fillRect(30, 52, 22, 1, '#575166');
  scenePainter.fillRect(32, 56, 6, 1, '#2c2640');
  scenePainter.fillRect(52, 57, 5, 6, '#575166');
  scenePainter.fillRect(56, 58, 2, 4, '#b8b0c9');

  // Bobines : le disque est fixe, les rayons tournent sur le calque animé.
  REEL_CENTERS.forEach(([x, y]: PixelPoint) => {
    scenePainter.fillCircle(x, y, REEL_RADIUS, '#2c2640');
    scenePainter.fillCircle(x, y, REEL_RADIUS - 1, '#3a3448');
    scenePainter.fillCircle(x, y, 3, '#2a1f1c');
  });
  scenePainter.fillRect(35, 49, 2, 4, '#2c2640');
  scenePainter.fillRect(47, 49, 2, 4, '#2c2640');
  // La pellicule qui court d'une bobine à l'autre
  scenePainter.drawLine(36, 38, 48, 38, '#1a1210');

  // Faisceau du projecteur
  lightPainter.setOpacity(0.1);
  lightPainter.fillPolygon(
    [
      [58, 58],
      [SCREEN_LEFT, SCREEN_TOP],
      [SCREEN_LEFT, SCREEN_TOP + SCREEN_HEIGHT],
      [58, 62],
    ],
    '#e9e2cf',
  );
  lightPainter.setOpacity(0.06);
  lightPainter.fillPolygon(
    [
      [58, 59],
      [SCREEN_LEFT, SCREEN_TOP + 4],
      [SCREEN_LEFT, SCREEN_TOP + SCREEN_HEIGHT - 4],
      [58, 61],
    ],
    '#e9e2cf',
  );
  lightPainter.setOpacity(1);

  // Carton de bobines et bobine au sol
  scenePainter.fillRect(64, 72, 20, 12, '#7a5a3a');
  scenePainter.fillRect(64, 72, 20, 2, '#8d6a46');
  scenePainter.fillRect(72, 72, 4, 12, '#b8a07a');
  scenePainter.fillRect(62, 84, 24, 1, '#14111f');
  scenePainter.fillCircle(94, 87, 4, '#2c2640');
  scenePainter.fillCircle(94, 87, 1, '#8d86a3');
}

/** Un tour de bobine toutes les 3,2 s : le rythme lent d'un vieux projecteur. */
const REEL_TURN_DURATION_IN_MILLISECONDS: number = 3_200;
const REEL_SPOKE_COUNT: number = 3;
/** Une image sur deux environ, une rayure claire traverse l'écran. */
const FILM_SCRATCH_CHANCE: number = 0.55;
const FILM_JUMP_INTERVAL_IN_MILLISECONDS: number = 4_000;
const FILM_JUMP_DURATION_IN_MILLISECONDS: number = 160;

/**
 * Sinister : les bobines tournent, et l'image projetée tressaute comme une vieille pellicule
 * (rayures verticales, poussières, saut d'image de temps en temps).
 */
export function animateSinisterScene(
  animationPainter: PixelPainter,
  elapsedMilliseconds: number,
): void {
  const reelAngle: number =
    ((elapsedMilliseconds % REEL_TURN_DURATION_IN_MILLISECONDS) /
      REEL_TURN_DURATION_IN_MILLISECONDS) *
    Math.PI *
    2;
  REEL_CENTERS.forEach(([centerX, centerY]: PixelPoint) => {
    for (let spokeIndex: number = 0; spokeIndex < REEL_SPOKE_COUNT; spokeIndex++) {
      const spokeAngle: number = reelAngle + (spokeIndex * Math.PI * 2) / REEL_SPOKE_COUNT;
      animationPainter.drawLine(
        centerX,
        centerY,
        Math.round(centerX + Math.cos(spokeAngle) * (REEL_RADIUS - 1)),
        Math.round(centerY + Math.sin(spokeAngle) * (REEL_RADIUS - 1)),
        '#8d86a3',
      );
    }
    animationPainter.fillPixel(centerX, centerY, '#e9e2cf');
  });

  // Rayures et poussières, différentes à chaque image de pellicule.
  const filmFrame: number = Math.floor(elapsedMilliseconds / 83);
  const pseudoRandom = (salt: number): number => {
    const sine: number = Math.sin(filmFrame * 12.9898 + salt * 78.233) * 43_758.5453;
    return sine - Math.floor(sine);
  };
  if (pseudoRandom(1) < FILM_SCRATCH_CHANCE) {
    const scratchX: number = SCREEN_LEFT + 1 + Math.floor(pseudoRandom(2) * (SCREEN_WIDTH - 2));
    animationPainter.setOpacity(0.45);
    animationPainter.fillRect(scratchX, SCREEN_TOP, 1, SCREEN_HEIGHT, '#f2ecdf');
    animationPainter.setOpacity(1);
  }
  for (let dustIndex: number = 0; dustIndex < 3; dustIndex++) {
    animationPainter.fillPixel(
      SCREEN_LEFT + Math.floor(pseudoRandom(3 + dustIndex) * SCREEN_WIDTH),
      SCREEN_TOP + Math.floor(pseudoRandom(6 + dustIndex) * SCREEN_HEIGHT),
      '#2a1f1c',
    );
  }
  // Toutes les 4 s, l'image saute : une bande sombre traverse l'écran de haut en bas.
  const timeSinceJump: number = elapsedMilliseconds % FILM_JUMP_INTERVAL_IN_MILLISECONDS;
  if (timeSinceJump < FILM_JUMP_DURATION_IN_MILLISECONDS) {
    animationPainter.setOpacity(0.5);
    animationPainter.fillRect(
      SCREEN_LEFT,
      SCREEN_TOP + Math.floor((timeSinceJump / FILM_JUMP_DURATION_IN_MILLISECONDS) * SCREEN_HEIGHT),
      SCREEN_WIDTH,
      3,
      '#07060c',
    );
    animationPainter.setOpacity(1);
  }
}
