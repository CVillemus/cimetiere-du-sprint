import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

const RAINDROP_COUNT: number = 70;

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
  scenePainter.fillRect(84, 10, 6, 10, '#1f1a29');

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
