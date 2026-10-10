import { PixelPainter, PixelPoint } from '../../../../../shared/pixel-art/pixel-painter';

/** Façade en pierre de taille : de x = 18 à 110, sous le toit mansardé. */
const FACADE_LEFT: number = 18;
const FACADE_RIGHT: number = 110;
const FACADE_TOP: number = 33;
const FACADE_BOTTOM: number = 82;
const STONE_BLOCK_HEIGHT: number = 4;
const STONE_BLOCK_LENGTH: number = 8;
const STONE_SHADES: readonly string[] = ['#625b70', '#5d566a', '#68617a', '#5a5367'];
const MORTAR_COLOR: string = '#4a4458';
const DRESSED_STONE_COLOR: string = '#8a8496';
const DRESSED_STONE_SHADOW: string = '#6b6577';

/** Fenêtres cintrées : centre horizontal, puis haut de la fenêtre à l'étage et au rez-de-chaussée. */
const WINDOW_CENTERS_X: readonly number[] = [32, 46, 82, 96];
const UPPER_WINDOW_TOP: number = 37;
const LOWER_WINDOW_TOP: number = 59;
const WINDOW_HEIGHT: number = 14;
/** La fenêtre de l'étage, à droite du portique, où une lampe est restée allumée. */
const LIT_WINDOW_CENTER_X: number = 82;
const DORMER_CENTERS_X: readonly number[] = [34, 64, 94];

/** Petit bruit déterministe : une pierre garde toujours la même teinte. */
function stoneNoise(column: number, row: number): number {
  const sine: number = Math.sin(column * 127.1 + row * 311.7) * 43_758.5453;
  return sine - Math.floor(sine);
}

function paintStoneWall(scenePainter: PixelPainter): void {
  for (let rowTop: number = FACADE_TOP; rowTop < FACADE_BOTTOM; rowTop += STONE_BLOCK_HEIGHT) {
    const rowIndex: number = (rowTop - FACADE_TOP) / STONE_BLOCK_HEIGHT;
    const rowOffset: number = rowIndex % 2 === 0 ? 0 : STONE_BLOCK_LENGTH / 2;
    for (
      let blockLeft: number = FACADE_LEFT - rowOffset;
      blockLeft < FACADE_RIGHT;
      blockLeft += STONE_BLOCK_LENGTH
    ) {
      const left: number = Math.max(FACADE_LEFT, blockLeft);
      const width: number = Math.min(FACADE_RIGHT, blockLeft + STONE_BLOCK_LENGTH) - left;
      const shade: string =
        STONE_SHADES[Math.floor(stoneNoise(blockLeft, rowIndex) * STONE_SHADES.length)];
      scenePainter.fillRect(left, rowTop, width, STONE_BLOCK_HEIGHT, shade);
      // Joint de mortier en bas et à droite, arête éclairée en haut à gauche.
      scenePainter.fillRect(left, rowTop + STONE_BLOCK_HEIGHT - 1, width, 1, MORTAR_COLOR);
      scenePainter.fillRect(left + width - 1, rowTop, 1, STONE_BLOCK_HEIGHT, MORTAR_COLOR);
      scenePainter.fillRect(left, rowTop, Math.max(1, width - 2), 1, '#706a80');
    }
  }
  // Chaînes d'angle : pierres claires alternées, longues et courtes.
  [FACADE_LEFT, FACADE_RIGHT - 6].forEach((quoinLeft: number, sideIndex: number) => {
    for (let rowTop: number = FACADE_TOP; rowTop < FACADE_BOTTOM; rowTop += STONE_BLOCK_HEIGHT) {
      const isLongBlock: boolean = ((rowTop - FACADE_TOP) / STONE_BLOCK_HEIGHT) % 2 === 0;
      const width: number = isLongBlock ? 6 : 4;
      const left: number = sideIndex === 0 ? quoinLeft : quoinLeft + 6 - width;
      scenePainter.fillRect(left, rowTop, width, STONE_BLOCK_HEIGHT - 1, '#7d778a');
      scenePainter.fillRect(left, rowTop, width, 1, '#8f899c');
    }
  });
  // Coulures d'humidité sous les appuis de fenêtre
  WINDOW_CENTERS_X.forEach((centerX: number) => {
    [UPPER_WINDOW_TOP, LOWER_WINDOW_TOP].forEach((windowTop: number) => {
      scenePainter.setOpacity(0.35);
      scenePainter.fillRect(centerX - 3, windowTop + WINDOW_HEIGHT + 2, 1, 5, '#3a3448');
      scenePainter.fillRect(centerX + 2, windowTop + WINDOW_HEIGHT + 2, 1, 3, '#3a3448');
      scenePainter.setOpacity(1);
    });
  });
}

function paintMansardRoof(scenePainter: PixelPainter): void {
  // Souches de cheminée en briques, derrière le toit
  [28, 98].forEach((chimneyLeft: number) => {
    scenePainter.fillRect(chimneyLeft, 5, 6, 12, '#4a2f2a');
    scenePainter.fillRect(chimneyLeft, 5, 1, 12, '#5e3d35');
    for (let brickY: number = 7; brickY < 17; brickY += 2) {
      scenePainter.fillRect(chimneyLeft, brickY, 6, 1, '#3a2420');
    }
    scenePainter.fillRect(chimneyLeft - 1, 4, 8, 2, '#3a3448');
  });

  // Brisis en ardoise, rangées décalées
  scenePainter.fillPolygon(
    [
      [FACADE_LEFT - 2, 31],
      [24, 13],
      [104, 13],
      [FACADE_RIGHT + 2, 31],
    ],
    '#2a2738',
  );
  for (let slateY: number = 15; slateY < 31; slateY += 2) {
    const inset: number = Math.round(((31 - slateY) / 18) * 8);
    for (
      let slateX: number = FACADE_LEFT - 2 + inset;
      slateX < FACADE_RIGHT + 2 - inset;
      slateX++
    ) {
      if ((slateX + (slateY % 4 === 3 ? 2 : 0)) % 4 === 0) {
        scenePainter.fillPixel(slateX, slateY, '#1e1b2a');
      }
    }
    scenePainter.drawLine(
      FACADE_LEFT - 2 + inset,
      slateY + 1,
      FACADE_RIGHT + 2 - inset,
      slateY + 1,
      '#232032',
    );
  }
  scenePainter.fillRect(24, 12, 80, 1, '#3a3652');

  // Lucarnes à fronton
  DORMER_CENTERS_X.forEach((centerX: number) => {
    scenePainter.fillRect(centerX - 5, 18, 11, 12, '#4a4556');
    scenePainter.fillPolygon(
      [
        [centerX - 7, 19],
        [centerX, 12],
        [centerX + 7, 19],
      ],
      '#3a3448',
    );
    scenePainter.drawLine(centerX - 7, 19, centerX, 12, '#575166');
    scenePainter.fillRect(centerX - 3, 21, 7, 8, '#100d18');
    scenePainter.fillPixel(centerX - 3, 21, '#4a4556');
    scenePainter.fillPixel(centerX + 3, 21, '#4a4556');
    scenePainter.fillRect(centerX, 21, 1, 8, '#4a4556');
  });

  // Corniche moulurée et ses denticules
  scenePainter.fillRect(
    FACADE_LEFT - 3,
    30,
    FACADE_RIGHT - FACADE_LEFT + 6,
    2,
    DRESSED_STONE_COLOR,
  );
  scenePainter.fillRect(FACADE_LEFT - 3, 30, FACADE_RIGHT - FACADE_LEFT + 6, 1, '#9a94a6');
  for (let dentilX: number = FACADE_LEFT - 2; dentilX < FACADE_RIGHT + 2; dentilX += 3) {
    scenePainter.fillRect(dentilX, 32, 2, 1, DRESSED_STONE_SHADOW);
  }
}

/** Fenêtre cintrée : encadrement de pierre, carreaux sombres à croisillon, appui et volets. */
function paintArchedWindow(
  scenePainter: PixelPainter,
  centerX: number,
  windowTop: number,
  hasHangingShutter: boolean,
): void {
  scenePainter.fillRect(centerX - 5, windowTop + 1, 11, WINDOW_HEIGHT, DRESSED_STONE_COLOR);
  scenePainter.fillRect(centerX - 4, windowTop, 9, 1, DRESSED_STONE_COLOR);
  scenePainter.fillRect(centerX - 4, windowTop + 2, 9, WINDOW_HEIGHT - 2, '#100d18');
  scenePainter.fillRect(centerX - 3, windowTop + 1, 7, 1, '#100d18');
  scenePainter.fillRect(centerX, windowTop + 1, 1, WINDOW_HEIGHT - 1, DRESSED_STONE_SHADOW);
  scenePainter.fillRect(centerX - 4, windowTop + 7, 9, 1, DRESSED_STONE_SHADOW);
  // Reflets froids du ciel dans les vitres
  scenePainter.fillPixel(centerX - 3, windowTop + 3, '#3a3654');
  scenePainter.fillPixel(centerX + 2, windowTop + 9, '#2c2944');
  // Appui saillant et son ombre
  scenePainter.fillRect(centerX - 6, windowTop + WINDOW_HEIGHT, 13, 2, '#9a94a6');
  scenePainter.fillRect(centerX - 6, windowTop + WINDOW_HEIGHT + 2, 13, 1, '#3a3448');

  // Volets de bois, lames horizontales
  const paintShutter = (shutterLeft: number): void => {
    scenePainter.fillRect(shutterLeft, windowTop + 1, 3, WINDOW_HEIGHT - 1, '#2f3d3a');
    for (let slatY: number = windowTop + 2; slatY < windowTop + WINDOW_HEIGHT; slatY += 2) {
      scenePainter.fillRect(shutterLeft, slatY, 3, 1, '#25312e');
    }
  };
  paintShutter(centerX - 8);
  if (hasHangingShutter) {
    // Un volet arraché à son gond du haut, qui pend de travers
    scenePainter.fillPolygon(
      [
        [centerX + 6, windowTop + 5],
        [centerX + 9, windowTop + 4],
        [centerX + 11, windowTop + WINDOW_HEIGHT + 2],
        [centerX + 8, windowTop + WINDOW_HEIGHT + 3],
      ],
      '#2f3d3a',
    );
    scenePainter.drawLine(centerX + 7, windowTop + 9, centerX + 10, windowTop + 8, '#25312e');
    scenePainter.drawLine(centerX + 8, windowTop + 13, centerX + 10, windowTop + 12, '#25312e');
  } else {
    paintShutter(centerX + 6);
  }
}

type PorchStep = readonly [left: number, top: number, width: number, color: string];

const PORCH_STEPS: readonly PorchStep[] = [
  [50, 80, 29, '#7d778a'],
  [46, 82, 37, '#6b6577'],
  [42, 84, 45, '#5a5468'],
];

/** Portique central : colonnes, fronton triangulaire avec son œil-de-bœuf, porte cintrée ouverte. */
function paintPortico(scenePainter: PixelPainter): void {
  scenePainter.fillRect(50, 46, 29, 4, DRESSED_STONE_COLOR);
  scenePainter.fillRect(50, 49, 29, 1, DRESSED_STONE_SHADOW);
  scenePainter.fillPolygon(
    [
      [48, 46],
      [64, 37],
      [80, 46],
    ],
    '#7d778a',
  );
  scenePainter.drawLine(48, 46, 64, 37, '#9a94a6');
  scenePainter.fillPolygon(
    [
      [53, 45],
      [64, 39],
      [75, 45],
    ],
    '#625b70',
  );
  scenePainter.fillCircle(64, 43, 2, '#100d18');
  scenePainter.fillPixel(64, 41, DRESSED_STONE_COLOR);

  [52, 73].forEach((columnLeft: number) => {
    scenePainter.fillRect(columnLeft, 50, 4, 30, DRESSED_STONE_COLOR);
    scenePainter.fillRect(columnLeft + 3, 50, 1, 30, DRESSED_STONE_SHADOW);
    scenePainter.fillRect(columnLeft + 1, 52, 1, 26, '#9a94a6');
    scenePainter.fillRect(columnLeft - 1, 50, 6, 1, '#9a94a6');
    scenePainter.fillRect(columnLeft - 1, 79, 6, 1, DRESSED_STONE_SHADOW);
  });

  // Porte cintrée grande ouverte sur l'entrée sombre
  scenePainter.fillRect(57, 55, 15, 25, '#3a3448');
  scenePainter.fillRect(58, 56, 13, 24, '#0a0810');
  scenePainter.fillRect(59, 55, 11, 1, '#0a0810');
  scenePainter.fillRect(68, 57, 3, 23, '#3b2c26');
  scenePainter.fillRect(68, 57, 1, 23, '#4a372d');
  // Une lueur chaude au fond du couloir, fixe et DERRIÈRE l'enfant (dessinée avant lui) :
  // sur le calque des lumières, elle vacillait par-dessus son visage.
  scenePainter.setOpacity(0.35);
  scenePainter.fillRect(60, 60, 7, 20, '#5a3a1a');
  scenePainter.setOpacity(1);
  scenePainter.paintGlow(63, 70, 9, '#e8a33d', 0.1);

  // Perron de trois marches
  PORCH_STEPS.forEach(([stepLeft, stepTop, stepWidth, stepColor]: PorchStep) => {
    scenePainter.fillRect(stepLeft, stepTop, stepWidth, 2, stepColor);
    scenePainter.fillRect(stepLeft, stepTop, stepWidth, 1, '#8f899c');
  });
}

/** Tomás, l'enfant au masque de sac, peint à la main : yeux dépareillés, bouche cousue. */
function paintSackMaskChild(scenePainter: PixelPainter): void {
  // Masque en toile de jute, froncé et noué au cou
  scenePainter.fillRect(62, 62, 5, 1, '#c2aa80');
  scenePainter.fillRect(61, 63, 7, 6, '#c2aa80');
  scenePainter.fillRect(62, 69, 5, 1, '#b39a70');
  scenePainter.sprinkle(61, 63, 7, 6, '#a8916a', 0.2);
  scenePainter.fillRect(66, 63, 1, 6, '#a8916a');
  scenePainter.fillRect(64, 62, 1, 2, '#8a7450');
  scenePainter.fillRect(63, 70, 3, 1, '#5a4a30');
  scenePainter.fillPixel(62, 71, '#5a4a30');
  // Yeux peints, pas à la même hauteur
  scenePainter.fillRect(62, 65, 2, 2, '#14100c');
  scenePainter.fillRect(65, 64, 2, 2, '#14100c');
  // Bouche dessinée, cousue de gros points
  scenePainter.fillPixel(62, 68, '#5a2a20');
  scenePainter.fillPixel(64, 68, '#5a2a20');
  scenePainter.fillPixel(66, 67, '#5a2a20');
  scenePainter.fillPixel(63, 68, '#3a1a14');
  scenePainter.fillPixel(65, 68, '#3a1a14');

  // Petit manteau sombre, col blanc, boutons
  scenePainter.fillRect(61, 71, 7, 7, '#3a3550');
  scenePainter.fillRect(63, 71, 3, 1, '#d8d0c0');
  scenePainter.fillPixel(64, 73, '#8d86a3');
  scenePainter.fillPixel(64, 75, '#8d86a3');
  scenePainter.fillRect(67, 72, 1, 6, '#2c2840');
  scenePainter.fillRect(60, 72, 1, 5, '#3a3550');
  scenePainter.fillRect(68, 72, 1, 5, '#3a3550');
  scenePainter.fillPixel(60, 77, '#e0d4c0');
  scenePainter.fillPixel(68, 77, '#e0d4c0');
  // Chaussettes hautes et souliers vernis
  scenePainter.fillRect(62, 78, 1, 2, '#d8ccb8');
  scenePainter.fillRect(66, 78, 1, 2, '#d8ccb8');
  scenePainter.fillRect(61, 80, 2, 1, '#120e0c');
  scenePainter.fillRect(66, 80, 2, 1, '#120e0c');
}

/** Arbre mort au premier plan, à gauche : ses branches griffent le coin de la façade. */
const DEAD_TREE_BRANCHES: readonly (readonly [PixelPoint, PixelPoint])[] = [
  [
    [22, 62],
    [33, 48],
  ],
  [
    [33, 48],
    [38, 44],
  ],
  [
    [33, 48],
    [31, 38],
  ],
  [
    [21, 50],
    [28, 34],
  ],
  [
    [28, 34],
    [34, 28],
  ],
  [
    [24, 72],
    [30, 68],
  ],
];

function paintOvergrownGarden(scenePainter: PixelPainter): void {
  scenePainter.fillRect(0, 86, 128, 10, '#1f2a1a');
  scenePainter.sprinkle(0, 86, 128, 10, '#2b3a22', 0.2);
  scenePainter.sprinkle(0, 86, 128, 10, '#3d5230', 0.08);
  // Herbes folles au pied de la façade
  for (let grassX: number = FACADE_LEFT; grassX < FACADE_RIGHT; grassX += 2) {
    const grassHeight: number = 1 + Math.floor(stoneNoise(grassX, 7) * 4);
    scenePainter.fillRect(grassX, 86 - grassHeight, 1, grassHeight, '#2b3a22');
  }

  scenePainter.fillRect(16, 40, 5, 56, '#14101c');
  scenePainter.fillRect(20, 40, 1, 56, '#1e1828');
  DEAD_TREE_BRANCHES.forEach(
    ([[startX, startY], [endX, endY]]: readonly [PixelPoint, PixelPoint]) =>
      scenePainter.drawLine(startX, startY, endX, endY, '#14101c'),
  );

  // Grille en fer forgé, portail entrouvert au milieu
  for (let barX: number = 0; barX < 128; barX += 4) {
    if (barX > 44 && barX < 84) {
      continue;
    }
    scenePainter.fillRect(barX, 85, 1, 11, '#14111c');
    scenePainter.fillPixel(barX, 84, '#3a3652');
  }
  scenePainter.fillRect(0, 87, 45, 1, '#14111c');
  scenePainter.fillRect(84, 87, 44, 1, '#14111c');
  scenePainter.fillRect(0, 93, 45, 1, '#14111c');
  scenePainter.fillRect(84, 93, 44, 1, '#14111c');
  // Battant du portail, ouvert vers l'intérieur
  scenePainter.drawLine(44, 85, 50, 89, '#14111c');
  scenePainter.drawLine(44, 93, 50, 95, '#14111c');
  scenePainter.fillRect(47, 86, 1, 9, '#14111c');
}

/**
 * L'Orphelinat : la grande maison de pierre au bord de la mer, au crépuscule.
 * Une lampe brûle à l'étage ; sur le perron, Tomás et son masque de sac.
 */
export function paintLOrphelinatScene(
  scenePainter: PixelPainter,
  lightPainter: PixelPainter,
  apparitionPainter: PixelPainter,
): void {
  scenePainter.fillVerticalGradient(0, 0, 128, 40, ['#1a1430', '#261b3a', '#3a2440', '#52303f']);
  scenePainter.paintStars(14, 16);

  paintMansardRoof(scenePainter);
  paintStoneWall(scenePainter);

  WINDOW_CENTERS_X.forEach((centerX: number) => {
    paintArchedWindow(scenePainter, centerX, UPPER_WINDOW_TOP, centerX === 96);
    paintArchedWindow(scenePainter, centerX, LOWER_WINDOW_TOP, false);
  });

  // Lampe allumée à l'étage
  lightPainter.fillRect(
    LIT_WINDOW_CENTER_X - 4,
    UPPER_WINDOW_TOP + 2,
    9,
    WINDOW_HEIGHT - 2,
    '#e8a33d',
  );
  lightPainter.fillRect(LIT_WINDOW_CENTER_X - 3, UPPER_WINDOW_TOP + 1, 7, 1, '#e8a33d');
  lightPainter.fillRect(LIT_WINDOW_CENTER_X, UPPER_WINDOW_TOP + 1, 1, WINDOW_HEIGHT - 1, '#8a6a3a');
  lightPainter.fillRect(LIT_WINDOW_CENTER_X - 4, UPPER_WINDOW_TOP + 7, 9, 1, '#8a6a3a');
  lightPainter.fillRect(LIT_WINDOW_CENTER_X - 3, UPPER_WINDOW_TOP + 3, 2, 3, '#f5c26b');
  lightPainter.paintGlow(LIT_WINDOW_CENTER_X, UPPER_WINDOW_TOP + 7, 14, '#e8a33d', 0.12);

  paintPortico(scenePainter);
  paintSackMaskChild(scenePainter);
  paintOvergrownGarden(scenePainter);
  scenePainter.paintFog(88, 0.1);

  // Apparition : un autre visage de toile, à la fenêtre de l'étage, à gauche du portique
  apparitionPainter.fillRect(44, UPPER_WINDOW_TOP + 3, 5, 5, '#b39a70');
  apparitionPainter.fillRect(45, UPPER_WINDOW_TOP + 2, 3, 1, '#b39a70');
  apparitionPainter.fillPixel(45, UPPER_WINDOW_TOP + 4, '#14100c');
  apparitionPainter.fillPixel(47, UPPER_WINDOW_TOP + 5, '#14100c');
  apparitionPainter.fillRect(45, UPPER_WINDOW_TOP + 8, 3, 2, '#3a3550');
}
