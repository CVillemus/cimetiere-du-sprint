import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';
import { paintChimney } from './chimney.painter';

type PineTree = readonly [x: number, baseY: number, height: number];
type SmokePuff = readonly [centerX: number, centerY: number, radius: number, opacity: number];

/** Pente droite du toit : de son faîte (66, 34) jusqu'à son bord (92, 54). */
const ROOF_RIDGE_X: number = 66;
const ROOF_RIDGE_Y: number = 34;
const ROOF_RIGHT_SLOPE: number = 20 / 26;

/** Un fin filet de volutes qui s'élargissent et s'effacent en montant vers la droite. */
const SMOKE_PUFFS: readonly SmokePuff[] = [
  [78, 29, 1, 0.4],
  [79, 25, 2, 0.3],
  [81, 20, 2, 0.22],
  [84, 15, 3, 0.14],
];

function roofHeightAt(x: number): number {
  return Math.round(ROOF_RIDGE_Y + (x - ROOF_RIDGE_X) * ROOF_RIGHT_SLOPE);
}

/** Petite cheminée en pierres grises, et son filet de fumée bleuté par la lune. */
function paintStoneChimneyWithSmoke(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  paintChimney(
    scenePainter,
    { leftX: 76, width: 5, topY: 35, blockWidth: 3, blockHeight: 3, roofHeightAt },
    {
      blockColor: '#615b70',
      litEdgeColor: '#7d778a',
      shadedEdgeColor: '#4a4556',
      mortarColor: '#3a3448',
      capColor: '#3a3448',
      capHighlightColor: '#7d778a',
      flueColor: '#14111f',
    },
  );

  // Sur le calque des lumières : la fumée ondule avec le vacillement
  SMOKE_PUFFS.forEach(([centerX, centerY, radius, opacity]: SmokePuff) => {
    lightPainter.setOpacity(opacity);
    lightPainter.fillCircle(centerX, centerY, radius, '#c9d1e6');
  });
  lightPainter.setOpacity(1);
}

/** Mama : la cabane au fond des bois, et les papillons de nuit autour de la lumière. */
export function paintMamaScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.paintNightSky();
  scenePainter.paintStars(30, 50);
  scenePainter.paintMoon(104, 16, 7);

  const distantPines: readonly PineTree[] = [
    [10, 70, 30],
    [30, 72, 24],
    [22, 74, 34],
    [96, 70, 26],
    [118, 72, 36],
    [86, 73, 22],
  ];
  distantPines.forEach(([x, baseY, height]: PineTree) =>
    scenePainter.paintPine(x, baseY, height, '#1c1733'),
  );

  // Sol herbeux
  scenePainter.fillRect(0, 72, 128, 24, '#16201a');
  scenePainter.sprinkle(0, 72, 128, 24, '#1f2a1a', 0.25);
  scenePainter.sprinkle(0, 74, 128, 22, '#2b3a22', 0.06);

  // Cabane en rondins
  scenePainter.paintPlanks(46, 52, 40, 24, '#3b2c26', '#2a1f1c', 3);
  for (let logY: number = 53; logY < 76; logY += 3) {
    scenePainter.fillPixel(44, logY, '#4a372d');
    scenePainter.fillPixel(45, logY, '#5a4334');
    scenePainter.fillPixel(86, logY, '#4a372d');
    scenePainter.fillPixel(87, logY, '#5a4334');
  }

  // Toit
  scenePainter.fillPolygon(
    [
      [40, 54],
      [66, 34],
      [92, 54],
    ],
    '#241a17',
  );
  for (let shingleY: number = 38; shingleY < 54; shingleY += 3) {
    const halfWidth: number = (shingleY - 34) * 1.3;
    scenePainter.drawLine(66 - halfWidth, shingleY, 66 + halfWidth, shingleY, '#1a1210');
  }
  scenePainter.drawLine(40, 54, 66, 34, '#4a372d');
  scenePainter.drawLine(66, 34, 92, 54, '#4a372d');

  paintStoneChimneyWithSmoke(scenePainter, lightPainter);

  // Porte et fenêtre condamnée
  scenePainter.fillRect(59, 60, 10, 16, '#4a372d');
  scenePainter.fillRect(60, 61, 8, 15, '#1a1210');
  scenePainter.fillPixel(66, 68, '#b8742a');
  scenePainter.fillRect(49, 58, 8, 8, '#1a1210');
  scenePainter.drawLine(49, 58, 56, 65, '#4a372d');
  scenePainter.drawLine(49, 65, 56, 58, '#4a372d');

  // Fenêtre éclairée
  scenePainter.fillRect(73, 57, 10, 9, '#2a1f1c');
  lightPainter.fillRect(74, 58, 8, 7, '#e8a33d');
  lightPainter.fillRect(77, 58, 1, 7, '#2a1f1c');
  lightPainter.fillRect(74, 61, 8, 1, '#2a1f1c');
  lightPainter.fillRect(75, 59, 2, 2, '#f5c26b');
  lightPainter.paintGlow(78, 61, 16, '#e8a33d', 0.14);

  // Papillons de nuit
  const moths: readonly PixelPoint[] = [
    [84, 52],
    [89, 57],
    [80, 49],
    [71, 52],
  ];
  moths.forEach(([x, y]: PixelPoint) => {
    lightPainter.fillPixel(x, y, '#e9e2cf');
    lightPainter.fillPixel(x - 1, y - 1, '#cfc6ae');
    lightPainter.fillPixel(x + 1, y - 1, '#cfc6ae');
  });

  const foregroundPines: readonly PineTree[] = [
    [0, 76, 40],
    [14, 80, 46],
    [118, 78, 44],
    [128, 82, 52],
  ];
  foregroundPines.forEach(([x, baseY, height]: PineTree) =>
    scenePainter.paintPine(x, baseY, height, '#0a0814'),
  );

  // Pierres du chemin
  scenePainter.fillRect(60, 77, 6, 2, '#3a3448');
  scenePainter.fillRect(62, 82, 6, 2, '#3a3448');
  scenePainter.fillRect(59, 88, 7, 2, '#3a3448');
  scenePainter.paintFog(76, 0.07);
}
