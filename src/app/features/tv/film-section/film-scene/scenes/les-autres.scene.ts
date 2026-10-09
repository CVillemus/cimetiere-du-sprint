import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

type SideDoor = readonly [x: number, height: number, width: number];

/** Les Autres : un couloir aux portes toutes fermées, Grace avance avec sa lampe à pétrole. */
export function paintLesAutresScene(scenePainter: PixelPainter, lightPainter: PixelPainter): void {
  scenePainter.fillRect(0, 0, 128, 96, '#0e0c18');
  scenePainter.fillPolygon(
    [
      [0, 0],
      [128, 0],
      [76, 30],
      [52, 30],
    ],
    '#0b0914',
  );
  scenePainter.fillPolygon(
    [
      [0, 0],
      [52, 30],
      [52, 66],
      [0, 96],
    ],
    '#1c1828',
  );
  scenePainter.fillPolygon(
    [
      [128, 0],
      [76, 30],
      [76, 66],
      [128, 96],
    ],
    '#181523',
  );

  // Parquet en perspective
  scenePainter.fillPolygon(
    [
      [0, 96],
      [52, 66],
      [76, 66],
      [128, 96],
    ],
    '#2a1f1c',
  );
  for (let boardIndex: number = 0; boardIndex < 9; boardIndex++) {
    scenePainter.drawLine(52 + boardIndex * 3, 66, -20 + boardIndex * 21, 96, '#1f1714');
  }

  // Porte du fond
  scenePainter.fillRect(52, 30, 24, 36, '#120f1c');
  scenePainter.fillRect(58, 36, 12, 30, '#2a1f1c');
  scenePainter.fillRect(59, 37, 10, 29, '#3b2c26');
  scenePainter.fillRect(66, 50, 1, 2, '#b8742a');

  const leftDoors: readonly SideDoor[] = [
    [6, 26, 18],
    [30, 38, 10],
  ];
  leftDoors.forEach(([x, height, width]: SideDoor) => {
    scenePainter.fillPolygon(
      [
        [x, 48 - height * 0.9],
        [x + width, 48 - height * 0.62],
        [x + width, 48 + height * 0.62],
        [x, 48 + height * 0.9],
      ],
      '#3b2c26',
    );
    scenePainter.fillPolygon(
      [
        [x + 2, 48 - height * 0.8],
        [x + width - 2, 48 - height * 0.55],
        [x + width - 2, 48 + height * 0.62],
        [x + 2, 48 + height * 0.9],
      ],
      '#2f231e',
    );
    scenePainter.fillPixel(x + width - 4, 48, '#b8742a');
  });

  const rightDoors: readonly SideDoor[] = [
    [104, 26, 18],
    [88, 38, 10],
  ];
  rightDoors.forEach(([x, height, width]: SideDoor) => {
    scenePainter.fillPolygon(
      [
        [x, 48 - height * 0.62],
        [x + width, 48 - height * 0.9],
        [x + width, 48 + height * 0.9],
        [x, 48 + height * 0.62],
      ],
      '#33261f',
    );
    scenePainter.fillPolygon(
      [
        [x + 2, 48 - height * 0.55],
        [x + width - 2, 48 - height * 0.8],
        [x + width - 2, 48 + height * 0.9],
        [x + 2, 48 + height * 0.62],
      ],
      '#291e19',
    );
    scenePainter.fillPixel(x + 3, 48, '#b8742a');
  });

  // Grace en silhouette
  scenePainter.fillRect(60, 52, 8, 4, '#0a0812');
  scenePainter.fillRect(61, 47, 6, 5, '#0a0812');
  scenePainter.fillCircle(64, 44, 3, '#0a0812');
  scenePainter.fillPolygon(
    [
      [59, 56],
      [69, 56],
      [72, 72],
      [56, 72],
    ],
    '#0a0812',
  );

  // Lampe à pétrole
  scenePainter.fillRect(69, 57, 4, 1, '#b8742a');
  scenePainter.fillRect(70, 53, 2, 4, '#e9e2cf');
  lightPainter.paintGlow(71, 55, 30, '#e8a33d', 0.22);
  lightPainter.fillRect(70, 54, 2, 2, '#f5c26b');
  lightPainter.fillPixel(70, 53, '#fff3d6');
}
