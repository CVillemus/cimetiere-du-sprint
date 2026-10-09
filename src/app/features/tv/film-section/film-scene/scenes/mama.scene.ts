import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

type PineTree = readonly [x: number, baseY: number, height: number];

/** Vitre éclairée de la cabane : c'est derrière elle que passe la silhouette. */
const LIT_WINDOW_LEFT: number = 74;
const LIT_WINDOW_TOP: number = 58;
const LIT_WINDOW_WIDTH: number = 8;
const LIT_WINDOW_HEIGHT: number = 7;

/** Toit affaissé : le faîte a glissé de deux pixels et penche vers la droite. */
const SAGGING_ROOF: readonly PixelPoint[] = [
  [40, 55],
  [52, 44],
  [65, 36],
  [70, 37],
  [92, 54],
];
/** Trous du toit : on voit le noir du grenier et les chevrons à nu. */
const ROOF_HOLES: readonly (readonly PixelPoint[])[] = [
  [
    [51, 47],
    [56, 43],
    [60, 44],
    [59, 49],
    [53, 50],
  ],
  [
    [70, 40],
    [75, 41],
    [78, 46],
    [73, 47],
  ],
];
/** Planches arrachées des murs : des trous sombres dans les rondins. */
const MISSING_PLANKS: readonly (readonly [x: number, y: number, width: number])[] = [
  [47, 70, 5],
  [81, 55, 4],
  [70, 72, 4],
  [84, 67, 3],
];
/** Lierre qui grimpe sur la cabane abandonnée. */
const IVY_PIXELS: readonly PixelPoint[] = [
  [46, 75],
  [46, 74],
  [47, 73],
  [46, 72],
  [47, 71],
  [46, 69],
  [47, 68],
  [48, 67],
  [47, 66],
  [86, 75],
  [87, 74],
  [86, 73],
  [87, 71],
  [86, 70],
  [85, 69],
  [86, 66],
  [42, 54],
  [43, 53],
  [45, 52],
];

/** Mama : la cabane en ruine au fond des bois. Une seule fenêtre est encore éclairée… */
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

  // Sol herbeux, envahi par les herbes hautes
  scenePainter.fillRect(0, 72, 128, 24, '#16201a');
  scenePainter.sprinkle(0, 72, 128, 24, '#1f2a1a', 0.25);
  scenePainter.sprinkle(0, 74, 128, 22, '#2b3a22', 0.06);

  // Murs en rondins, pourris par endroits
  scenePainter.paintPlanks(46, 52, 40, 24, '#3b2c26', '#2a1f1c', 3);
  scenePainter.sprinkle(46, 52, 40, 24, '#2f2420', 0.12);
  scenePainter.sprinkle(46, 64, 40, 12, '#26302a', 0.08);
  for (let logY: number = 53; logY < 76; logY += 3) {
    scenePainter.fillPixel(44, logY, '#4a372d');
    scenePainter.fillPixel(45, logY, '#5a4334');
    scenePainter.fillPixel(86, logY, '#4a372d');
    scenePainter.fillPixel(87, logY, '#5a4334');
  }
  MISSING_PLANKS.forEach(([x, y, width]: readonly [number, number, number]) => {
    scenePainter.fillRect(x, y, width, 2, '#0a0707');
    scenePainter.fillPixel(x + width, y + 1, '#2a1f1c');
  });

  // Toit affaissé et troué
  scenePainter.fillPolygon(SAGGING_ROOF, '#241a17');
  for (let shingleY: number = 39; shingleY < 54; shingleY += 3) {
    const halfWidth: number = (shingleY - 36) * 1.3;
    scenePainter.drawLine(67 - halfWidth, shingleY, 67 + halfWidth, shingleY, '#1a1210');
  }
  ROOF_HOLES.forEach((roofHole: readonly PixelPoint[]) => {
    scenePainter.fillPolygon(roofHole, '#07050a');
  });
  // Chevrons à nu dans les trous
  scenePainter.drawLine(53, 49, 58, 44, '#4a372d');
  scenePainter.drawLine(72, 46, 76, 41, '#4a372d');
  // Rives du toit, cassées : un bardeau pend sous le bord gauche
  scenePainter.drawLine(40, 55, 52, 44, '#4a372d');
  scenePainter.drawLine(52, 44, 65, 36, '#4a372d');
  scenePainter.drawLine(70, 37, 92, 54, '#4a372d');
  scenePainter.drawLine(44, 53, 43, 57, '#3b2c26');
  scenePainter.drawLine(89, 53, 91, 57, '#3b2c26');

  // Cheminée effondrée : il n'en reste qu'un moignon de pierres, et une pierre tombée sur le toit
  scenePainter.fillRect(76, 41, 5, 4, '#4a4556');
  scenePainter.fillRect(76, 41, 1, 4, '#615b70');
  scenePainter.fillRect(79, 40, 2, 1, '#4a4556');
  scenePainter.fillRect(76, 43, 5, 1, '#3a3448');
  scenePainter.fillRect(84, 47, 2, 2, '#4a4556');

  // Fenêtre condamnée : une planche s'est décrochée et pend en biais
  scenePainter.fillRect(49, 58, 8, 8, '#0e0a0a');
  scenePainter.drawLine(49, 58, 56, 65, '#4a372d');
  scenePainter.drawLine(50, 61, 54, 69, '#5a4334');
  scenePainter.fillPixel(49, 58, '#8d86a3');

  // Porte arrachée de ses gonds, appuyée de travers contre le chambranle
  scenePainter.fillRect(59, 60, 10, 16, '#4a372d');
  scenePainter.fillRect(60, 61, 8, 15, '#050304');
  scenePainter.fillPolygon(
    [
      [55, 63],
      [60, 61],
      [61, 76],
      [56, 77],
    ],
    '#3b2c26',
  );
  scenePainter.drawLine(57, 64, 58, 76, '#2a1f1c');
  scenePainter.fillPixel(60, 62, '#8d86a3');

  // Fenêtre encore éclairée, vitre fendue
  scenePainter.fillRect(73, 57, 10, 9, '#2a1f1c');
  lightPainter.fillRect(
    LIT_WINDOW_LEFT,
    LIT_WINDOW_TOP,
    LIT_WINDOW_WIDTH,
    LIT_WINDOW_HEIGHT,
    '#e8a33d',
  );
  lightPainter.fillRect(77, 58, 1, 7, '#2a1f1c');
  lightPainter.fillRect(74, 61, 8, 1, '#2a1f1c');
  lightPainter.fillRect(75, 59, 2, 2, '#f5c26b');
  lightPainter.drawLine(79, 58, 81, 64, '#b8742a');
  lightPainter.fillPixel(81, 58, '#1a1210');
  lightPainter.paintGlow(78, 61, 16, '#e8a33d', 0.12);

  // Lierre sur les murs et le bord du toit
  IVY_PIXELS.forEach(([x, y]: PixelPoint, ivyIndex: number) =>
    scenePainter.fillPixel(x, y, ivyIndex % 3 === 0 ? '#3d5230' : '#2b3a22'),
  );

  // Planches tombées dans l'herbe, marches effondrées
  scenePainter.drawLine(36, 80, 46, 78, '#3b2c26');
  scenePainter.drawLine(88, 79, 97, 82, '#2a1f1c');
  scenePainter.fillRect(60, 77, 6, 2, '#3a3448');
  scenePainter.fillRect(63, 78, 2, 1, '#16201a');
  scenePainter.fillRect(62, 82, 6, 2, '#2c2838');

  // Papillons de nuit attirés par la seule lumière
  const moths: readonly PixelPoint[] = [
    [84, 52],
    [89, 57],
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

  scenePainter.paintFog(76, 0.08);
}

/** Toutes les 11 s, quelque chose passe derrière la vitre, de gauche à droite. */
const SILHOUETTE_CYCLE_IN_MILLISECONDS: number = 11_000;
const SILHOUETTE_START_IN_MILLISECONDS: number = 4_000;
/** Elle traverse en 2,6 s, avec un arrêt au milieu : comme si elle regardait dehors. */
const SILHOUETTE_CROSSING_DURATION_IN_MILLISECONDS: number = 2_600;
const SILHOUETTE_PAUSE_START_RATIO: number = 0.4;
const SILHOUETTE_PAUSE_END_RATIO: number = 0.62;
const SILHOUETTE_START_X: number = LIT_WINDOW_LEFT - 5;
const SILHOUETTE_END_X: number = LIT_WINDOW_LEFT + LIT_WINDOW_WIDTH + 5;
const SILHOUETTE_COLOR: string = '#1a0e0b';

/** Position horizontale de la tête, ou `null` quand rien ne passe. */
function silhouetteCenterXAt(elapsedMilliseconds: number): number | null {
  const timeInCycle: number =
    (elapsedMilliseconds + SILHOUETTE_CYCLE_IN_MILLISECONDS - SILHOUETTE_START_IN_MILLISECONDS) %
    SILHOUETTE_CYCLE_IN_MILLISECONDS;
  if (timeInCycle >= SILHOUETTE_CROSSING_DURATION_IN_MILLISECONDS) {
    return null;
  }
  const crossingRatio: number = timeInCycle / SILHOUETTE_CROSSING_DURATION_IN_MILLISECONDS;
  // Temps « utile » de déplacement : on retire la pause du milieu.
  const pauseLength: number = SILHOUETTE_PAUSE_END_RATIO - SILHOUETTE_PAUSE_START_RATIO;
  let travelRatio: number;
  if (crossingRatio < SILHOUETTE_PAUSE_START_RATIO) {
    travelRatio = crossingRatio / (1 - pauseLength);
  } else if (crossingRatio < SILHOUETTE_PAUSE_END_RATIO) {
    travelRatio = SILHOUETTE_PAUSE_START_RATIO / (1 - pauseLength);
  } else {
    travelRatio = (crossingRatio - pauseLength) / (1 - pauseLength);
  }
  return Math.round(SILHOUETTE_START_X + travelRatio * (SILHOUETTE_END_X - SILHOUETTE_START_X));
}

/** Tête penchée, longs cheveux qui pendent et s'écartent, épaules osseuses. */
const SILHOUETTE_PIXELS: readonly PixelPoint[] = [
  // Tête, inclinée vers la droite
  [-1, -3],
  [0, -3],
  [-2, -2],
  [-1, -2],
  [0, -2],
  [1, -2],
  [-2, -1],
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  // Cheveux qui tombent en mèches
  [-3, -1],
  [-3, 0],
  [-3, 1],
  [-4, 2],
  [2, -1],
  [2, 0],
  [2, 1],
  [3, 2],
  [-2, 1],
  [-2, 2],
  [-2, 3],
  [1, 1],
  [1, 2],
  [1, 3],
  // Cou et épaules
  [-1, 1],
  [0, 1],
  [-1, 2],
  [0, 2],
  [-3, 3],
  [-1, 3],
  [0, 3],
  [2, 3],
  [-4, 4],
  [-3, 4],
  [-2, 4],
  [-1, 4],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
];

/** Mama : une silhouette décharnée passe lentement derrière la fenêtre éclairée. */
export function animateMamaScene(
  animationPainter: PixelPainter,
  elapsedMilliseconds: number,
): void {
  const silhouetteCenterX: number | null = silhouetteCenterXAt(elapsedMilliseconds);
  if (silhouetteCenterX === null) {
    return;
  }
  // La tête oscille d'un pixel, comme une démarche saccadée.
  const headBob: number = Math.floor(elapsedMilliseconds / 250) % 2;
  const centerY: number = LIT_WINDOW_TOP + 3 + headBob;
  SILHOUETTE_PIXELS.forEach(([offsetX, offsetY]: PixelPoint) => {
    const x: number = silhouetteCenterX + offsetX;
    const y: number = centerY + offsetY;
    const isBehindGlass: boolean =
      x >= LIT_WINDOW_LEFT &&
      x < LIT_WINDOW_LEFT + LIT_WINDOW_WIDTH &&
      y >= LIT_WINDOW_TOP &&
      y < LIT_WINDOW_TOP + LIT_WINDOW_HEIGHT;
    if (isBehindGlass) {
      animationPainter.fillPixel(x, y, SILHOUETTE_COLOR);
    }
  });
}
