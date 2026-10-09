import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

const TEA_CENTER_X: number = 64;
const TEA_CENTER_Y: number = 58;

/**
 * Get Out : la tasse de l'hypnose, dans le noir du « Sunken Place ».
 * La cuillère, le thé qui tourne et Chris qui flotte sont sur le calque animé.
 */
export function paintGetOutScene(scenePainter: PixelPainter): void {
  scenePainter.fillVerticalGradient(0, 0, 128, 96, ['#040309', '#07060f', '#0a0814', '#0d0b18']);
  scenePainter.sprinkle(0, 0, 128, 60, '#2c2640', 0.01);

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
  // Liseré bleu : il suit le galbe de la tasse au lieu de dépasser sur les côtés.
  const bandRowY: number = 74;
  const bandHalfWidth: number = Math.round(27 - (bandRowY - 58) ** 2 / 48);
  scenePainter.fillRect(64 - bandHalfWidth, bandRowY, bandHalfWidth * 2, 1, '#4a5a8a');

  // Anse
  for (let angle: number = 0; angle < 6.3; angle += 0.15) {
    scenePainter.fillRect(91 + 7 * Math.cos(angle), 69 + 6 * Math.sin(angle), 2, 2, '#e2dbcb');
  }
  scenePainter.fillRect(88, 64, 3, 11, '#efe9db');

  // Thé
  scenePainter.fillEllipse(TEA_CENTER_X, TEA_CENTER_Y, 27, 5, '#efe9db');
  scenePainter.fillEllipse(TEA_CENTER_X, TEA_CENTER_Y, 24, 4, '#5b3a1e');
}

/** Un tour de cuillère toutes les 2,4 s : le geste lent et régulier de l'hypnose. */
const SPOON_TURN_DURATION_IN_MILLISECONDS: number = 2_400;
const SPOON_ORBIT_RADIUS_X: number = 12;
const SPOON_ORBIT_RADIUS_Y: number = 2;
const SPOON_HANDLE_TOP_Y: number = 30;
/** Les remous du thé : trois anneaux qui s'élargissent depuis le centre, puis renaissent. */
const RIPPLE_COUNT: number = 3;
const RIPPLE_GROWTH_DURATION_IN_MILLISECONDS: number = 2_400;
const RIPPLE_MAXIMUM_RADIUS_X: number = 22;
/** Chris flotte, bras levés, et s'enfonce très lentement dans le noir avant de remonter. */
const CHRIS_CENTER_X: number = 64;
const CHRIS_TOP_Y: number = 14;
const CHRIS_DRIFT_PERIOD_IN_MILLISECONDS: number = 9_000;
const CHRIS_DRIFT_AMPLITUDE: number = 4;
const CHRIS_SWAY_PERIOD_IN_MILLISECONDS: number = 5_000;
/** Silhouette de Chris (10 pixels de haut) : bras levés de chaque côté de la tête, jambes qui pendent. */
const CHRIS_PIXELS: readonly PixelPoint[] = [
  [-4, 0],
  [-3, 1],
  [-3, 2],
  [-3, 3],
  [-2, 4],
  [4, 0],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 4],
  [0, 1],
  [-1, 2],
  [0, 2],
  [1, 2],
  [0, 3],
  [-1, 4],
  [0, 4],
  [1, 4],
  [-1, 5],
  [0, 5],
  [1, 5],
  [-1, 6],
  [0, 6],
  [1, 6],
  [-1, 7],
  [1, 7],
  [-1, 8],
  [1, 8],
  [-2, 9],
  [2, 9],
];

/**
 * Get Out : la cuillère tourne dans le thé, les remous s'élargissent en spirale,
 * et Chris flotte, minuscule, dans le vide au-dessus de la tasse.
 */
export function animateGetOutScene(
  animationPainter: PixelPainter,
  elapsedMilliseconds: number,
): void {
  // Remous concentriques dans le thé
  for (let rippleIndex: number = 0; rippleIndex < RIPPLE_COUNT; rippleIndex++) {
    const rippleProgress: number =
      ((elapsedMilliseconds +
        (rippleIndex * RIPPLE_GROWTH_DURATION_IN_MILLISECONDS) / RIPPLE_COUNT) %
        RIPPLE_GROWTH_DURATION_IN_MILLISECONDS) /
      RIPPLE_GROWTH_DURATION_IN_MILLISECONDS;
    const radiusX: number = 2 + rippleProgress * RIPPLE_MAXIMUM_RADIUS_X;
    const radiusY: number = radiusX / 6;
    const rippleColor: string = rippleProgress < 0.5 ? '#8a6438' : '#6e4a2a';
    for (let angle: number = 0; angle < Math.PI * 2; angle += 0.12) {
      animationPainter.fillPixel(
        Math.round(TEA_CENTER_X + Math.cos(angle) * radiusX),
        Math.round(TEA_CENTER_Y + Math.sin(angle) * radiusY),
        rippleColor,
      );
    }
  }

  // La cuillère en argent, qui tourne en touillant
  const spoonAngle: number =
    ((elapsedMilliseconds % SPOON_TURN_DURATION_IN_MILLISECONDS) /
      SPOON_TURN_DURATION_IN_MILLISECONDS) *
    Math.PI *
    2;
  const bowlX: number = Math.round(TEA_CENTER_X + Math.cos(spoonAngle) * SPOON_ORBIT_RADIUS_X);
  const bowlY: number = Math.round(TEA_CENTER_Y + Math.sin(spoonAngle) * SPOON_ORBIT_RADIUS_Y);
  const handleTopX: number = Math.round(TEA_CENTER_X + 14 + Math.cos(spoonAngle) * 6);
  animationPainter.drawLine(handleTopX, SPOON_HANDLE_TOP_Y, bowlX, bowlY - 1, '#9a94ac', 2);
  animationPainter.drawLine(handleTopX + 1, SPOON_HANDLE_TOP_Y, bowlX + 1, bowlY - 1, '#e9e2cf', 1);
  animationPainter.fillEllipse(bowlX, bowlY, 3, 1, '#b8b0c9');

  // Chris, minuscule, qui flotte dans le noir
  const driftY: number = Math.round(
    Math.sin((elapsedMilliseconds / CHRIS_DRIFT_PERIOD_IN_MILLISECONDS) * Math.PI * 2) *
      CHRIS_DRIFT_AMPLITUDE,
  );
  const swayX: number = Math.round(
    Math.sin((elapsedMilliseconds / CHRIS_SWAY_PERIOD_IN_MILLISECONDS) * Math.PI * 2) * 2,
  );
  CHRIS_PIXELS.forEach(([offsetX, offsetY]: PixelPoint) =>
    animationPainter.fillPixel(
      CHRIS_CENTER_X + swayX + offsetX,
      CHRIS_TOP_Y + driftY + offsetY,
      '#8d86a3',
    ),
  );
}
