import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';
import { paintChimney } from './chimney.painter';

const RAINDROP_COUNT: number = 70;

/** Pan droit du toit : du faîte (64, 6) jusqu'au bord (116, 27). */
function roofHeightAt(x: number): number {
  return Math.round(6 + ((x - 64) * 21) / 52);
}

interface Missionary {
  readonly x: number;
  readonly hairColor: string;
}

/** Les deux missionnaires, vues de dos, chemise blanche et longue jupe sombre. */
const MISSIONARIES: readonly Missionary[] = [
  { x: 50, hairColor: '#5a3a22' },
  { x: 72, hairColor: '#d9b45a' },
];

function paintMissionary(scenePainter: PixelPainter, missionary: Missionary): void {
  const { x, hairColor }: Missionary = missionary;
  scenePainter.fillRect(x + 1, 70, 5, 5, hairColor);
  scenePainter.fillRect(x + 1, 75, 5, 1, hairColor);
  scenePainter.fillRect(x, 76, 7, 7, '#e9e2cf');
  scenePainter.fillRect(x + 5, 77, 2, 6, '#cfc6ae');
  scenePainter.fillRect(x + 1, 76, 1, 7, '#2c2640');
  scenePainter.fillPolygon(
    [
      [x, 83],
      [x + 7, 83],
      [x + 8, 92],
      [x - 1, 92],
    ],
    '#2c2640',
  );
  scenePainter.fillRect(x + 1, 92, 2, 2, '#14111f');
  scenePainter.fillRect(x + 4, 92, 2, 2, '#14111f');
}

/** Un vélo couché contre la clôture : deux roues et un cadre. */
function paintBicycle(scenePainter: PixelPainter, x: number, y: number): void {
  [x, x + 14].forEach((wheelCenterX: number) => {
    scenePainter.fillCircle(wheelCenterX, y, 5, '#3a3448');
    scenePainter.fillCircle(wheelCenterX, y, 4, '#16141f');
    scenePainter.fillPixel(wheelCenterX, y, '#8d86a3');
  });
  scenePainter.drawLine(x, y, x + 7, y - 5, '#575166');
  scenePainter.drawLine(x + 7, y - 5, x + 14, y, '#575166');
  scenePainter.drawLine(x + 7, y - 5, x + 7, y, '#575166');
  scenePainter.fillRect(x + 5, y - 7, 4, 1, '#575166');
}

/**
 * Heretic : la maison de M. Reed, un soir d'orage. Les deux missionnaires attendent
 * devant la porte entrouverte, d'où il les observe en silhouette.
 */
export function paintHereticScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  // Ciel d'orage
  scenePainter.fillVerticalGradient(0, 0, 128, 60, ['#08070f', '#0d0b18', '#12101f', '#17142a']);

  // Façade à clins de bois et toit
  scenePainter.paintPlanks(18, 26, 92, 62, '#2b2533', '#221d2a', 3);
  scenePainter.fillPolygon(
    [
      [12, 27],
      [64, 6],
      [116, 27],
    ],
    '#16121e',
  );
  scenePainter.drawLine(12, 27, 64, 6, '#2c2640');
  scenePainter.drawLine(64, 6, 116, 27, '#2c2640');
  // Cheminée en briques sombres, posée sur le pan droit du toit
  paintChimney(
    scenePainter,
    { leftX: 86, width: 5, topY: 8, blockWidth: 3, blockHeight: 2, roofHeightAt },
    {
      blockColor: '#4a2f2a',
      litEdgeColor: '#5e3d35',
      shadedEdgeColor: '#3a2420',
      mortarColor: '#241818',
      capColor: '#1f1a29',
      capHighlightColor: '#3a3448',
      flueColor: '#07060c',
    },
  );

  // Fenêtres : une sombre, une où brûle la bougie à l'odeur de tarte aux myrtilles
  [
    [26, 38],
    [90, 38],
  ].forEach(([windowX, windowY]: number[]) => {
    scenePainter.fillRect(windowX - 1, windowY - 1, 14, 16, '#4a4556');
    scenePainter.fillRect(windowX, windowY, 12, 14, '#0e0c16');
    scenePainter.fillRect(windowX + 5, windowY, 2, 14, '#4a4556');
    scenePainter.fillRect(windowX, windowY + 6, 12, 2, '#4a4556');
  });
  lightPainter.fillRect(92, 46, 2, 3, '#5a3a6a');
  lightPainter.fillPixel(92, 45, '#f5c26b');
  lightPainter.paintGlow(93, 46, 9, '#e8a33d', 0.14);

  // Porche et porte entrouverte
  scenePainter.fillRect(48, 44, 32, 3, '#16121e');
  scenePainter.fillRect(49, 47, 2, 39, '#3b2c26');
  scenePainter.fillRect(77, 47, 2, 39, '#3b2c26');
  scenePainter.fillRect(56, 52, 16, 34, '#1a1210');
  lightPainter.fillRect(58, 54, 12, 32, '#e8a33d');
  lightPainter.fillRect(58, 54, 12, 2, '#f5c26b');
  lightPainter.paintGlow(64, 70, 26, '#e8a33d', 0.16);

  // M. Reed, en silhouette dans l'encadrement. Dessiné sur les deux calques :
  // par-dessus la lumière de la porte, et dessous quand la lumière vacille.
  [scenePainter, lightPainter].forEach((painter: PixelPainter) => {
    painter.fillCircle(64, 60, 3, '#0c0a17');
    painter.fillRect(60, 63, 9, 22, '#0c0a17');
    painter.fillRect(59, 65, 1, 12, '#0c0a17');
    painter.fillRect(69, 65, 1, 12, '#0c0a17');
  });
  // Ses lunettes accrochent la lumière.
  lightPainter.fillPixel(63, 60, '#e9e2cf');
  lightPainter.fillPixel(65, 60, '#e9e2cf');

  // Marches du perron et sol détrempé
  scenePainter.fillRect(46, 86, 36, 3, '#3b2c26');
  scenePainter.fillRect(0, 88, 128, 8, '#14121c');
  lightPainter.setOpacity(0.18);
  lightPainter.fillRect(54, 89, 20, 7, '#e8a33d');
  lightPainter.setOpacity(1);

  // Les missionnaires et leurs vélos
  MISSIONARIES.forEach((missionary: Missionary) => paintMissionary(scenePainter, missionary));
  paintBicycle(scenePainter, 8, 86);
  paintBicycle(scenePainter, 98, 86);

  // Pluie battante (sur le calque des lumières, pour qu'elle scintille)
  lightPainter.setOpacity(0.35);
  for (let raindropIndex: number = 0; raindropIndex < RAINDROP_COUNT; raindropIndex++) {
    const raindropX: number = Math.floor(lightPainter.random() * 132);
    const raindropY: number = Math.floor(lightPainter.random() * 92);
    lightPainter.drawLine(raindropX, raindropY, raindropX - 1, raindropY + 3, '#9fb0d9');
  }
  lightPainter.setOpacity(1);
}

/** Toutes les 13 s, M. Reed sourit, lentement : un rictus de travers, plus haut d'un côté. */
const REED_SMILE_CYCLE_IN_MILLISECONDS: number = 13_000;
const REED_SMILE_START_IN_MILLISECONDS: number = 7_000;
const REED_SMILE_FADE_IN_MILLISECONDS: number = 700;
const REED_SMILE_HOLD_IN_MILLISECONDS: number = 1_800;
/** Le coin gauche remonte vers la pommette, le droit reste bas : un sourire en coin, vicieux. */
const REED_SMILE_PIXELS: readonly PixelPoint[] = [
  [62, 61],
  [63, 62],
  [66, 63],
];
/** Au milieu du rictus, les dents accrochent la lumière de la porte. */
const REED_TEETH_PIXELS: readonly PixelPoint[] = [
  [64, 62],
  [65, 62],
];

/** Opacité du sourire selon le moment du cycle : fondu en paliers, maintien, fondu de sortie. */
function reedSmileOpacityAt(elapsedMilliseconds: number): number {
  const timeInCycle: number =
    (elapsedMilliseconds + REED_SMILE_CYCLE_IN_MILLISECONDS - REED_SMILE_START_IN_MILLISECONDS) %
    REED_SMILE_CYCLE_IN_MILLISECONDS;
  const fullyVisibleUntil: number =
    REED_SMILE_FADE_IN_MILLISECONDS + REED_SMILE_HOLD_IN_MILLISECONDS;
  let opacity: number = 0;
  if (timeInCycle < REED_SMILE_FADE_IN_MILLISECONDS) {
    opacity = timeInCycle / REED_SMILE_FADE_IN_MILLISECONDS;
  } else if (timeInCycle < fullyVisibleUntil) {
    opacity = 1;
  } else if (timeInCycle < fullyVisibleUntil + REED_SMILE_FADE_IN_MILLISECONDS) {
    opacity = 1 - (timeInCycle - fullyVisibleUntil) / REED_SMILE_FADE_IN_MILLISECONDS;
  }
  // Quatre paliers d'opacité : un fondu « pixel », pas un dégradé lisse.
  return Math.round(opacity * 4) / 4;
}

/** Heretic : de temps en temps, un sourire pâle se dessine sur la silhouette de M. Reed. */
export function animateHereticScene(
  animationPainter: PixelPainter,
  elapsedMilliseconds: number,
): void {
  const smileOpacity: number = reedSmileOpacityAt(elapsedMilliseconds);
  if (smileOpacity === 0) {
    return;
  }
  animationPainter.setOpacity(smileOpacity * 0.9);
  REED_SMILE_PIXELS.forEach(([x, y]: PixelPoint) => animationPainter.fillPixel(x, y, '#d8cfb8'));
  REED_TEETH_PIXELS.forEach(([x, y]: PixelPoint) => animationPainter.fillPixel(x, y, '#f2ecdf'));
  // Ses lunettes s'allument un peu plus pendant qu'il sourit.
  animationPainter.fillPixel(63, 60, '#ffffff');
  animationPainter.fillPixel(65, 60, '#ffffff');
  animationPainter.setOpacity(1);
}
