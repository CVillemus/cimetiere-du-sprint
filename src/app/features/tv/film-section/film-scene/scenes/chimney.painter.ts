import { PixelPainter } from '../../../../../shared/pixel-art/pixel-painter';

/** Forme et position d'une cheminée posée sur un pan de toit. */
export interface ChimneyShape {
  readonly leftX: number;
  readonly width: number;
  /** Haut du conduit, sous le chapeau. */
  readonly topY: number;
  /** Taille d'une pierre ou d'une brique, joint compris. */
  readonly blockWidth: number;
  readonly blockHeight: number;
  /** Hauteur du toit à une abscisse donnée : la cheminée s'arrête dessus, en biais. */
  readonly roofHeightAt: (x: number) => number;
}

/** Palette d'une cheminée : pierre grise, brique… */
export interface ChimneyPalette {
  readonly blockColor: string;
  readonly litEdgeColor: string;
  readonly shadedEdgeColor: string;
  readonly mortarColor: string;
  readonly capColor: string;
  readonly capHighlightColor: string;
  readonly flueColor: string;
}

const CAST_SHADOW_WIDTH: number = 2;
const CAST_SHADOW_HEIGHT: number = 3;
const CAST_SHADOW_OPACITY: number = 0.35;

/**
 * Cheminée maçonnée : blocs en quinconce, arête gauche éclairée, flanc droit dans l'ombre,
 * base taillée en biais pour épouser la pente du toit, chapeau débordant et ombre portée.
 */
export function paintChimney(
  scenePainter: PixelPainter,
  chimneyShape: ChimneyShape,
  chimneyPalette: ChimneyPalette,
): void {
  const { leftX, width, topY, blockWidth, blockHeight, roofHeightAt }: ChimneyShape = chimneyShape;

  for (let columnIndex: number = 0; columnIndex < width; columnIndex++) {
    const columnX: number = leftX + columnIndex;
    const edgeColor: string | null =
      columnIndex === 0
        ? chimneyPalette.litEdgeColor
        : columnIndex === width - 1
          ? chimneyPalette.shadedEdgeColor
          : null;

    for (let rowY: number = topY; rowY <= roofHeightAt(columnX); rowY++) {
      const blockRowIndex: number = Math.floor((rowY - topY) / blockHeight);
      const isMortarRow: boolean = (rowY - topY) % blockHeight === blockHeight - 1;
      // Joints verticaux décalés d'une rangée à l'autre, comme un vrai mur maçonné.
      const jointOffset: number = blockRowIndex % 2 === 0 ? 0 : Math.floor(blockWidth / 2);
      const isMortarJoint: boolean = (columnIndex + jointOffset) % blockWidth === blockWidth - 1;
      const pixelColor: string =
        isMortarRow || isMortarJoint
          ? chimneyPalette.mortarColor
          : (edgeColor ?? chimneyPalette.blockColor);
      scenePainter.fillPixel(columnX, rowY, pixelColor);
    }
  }

  // Chapeau débordant d'un pixel de chaque côté, conduit noir au sommet
  scenePainter.fillRect(leftX - 1, topY - 2, width + 2, 2, chimneyPalette.capColor);
  scenePainter.fillRect(leftX - 1, topY - 2, width + 2, 1, chimneyPalette.capHighlightColor);
  scenePainter.fillRect(leftX + 1, topY - 3, width - 2, 1, chimneyPalette.flueColor);

  // Ombre portée sur le toit, juste à droite
  scenePainter.setOpacity(CAST_SHADOW_OPACITY);
  for (
    let shadowX: number = leftX + width;
    shadowX < leftX + width + CAST_SHADOW_WIDTH;
    shadowX++
  ) {
    scenePainter.fillRect(
      shadowX,
      roofHeightAt(shadowX) - CAST_SHADOW_HEIGHT,
      1,
      CAST_SHADOW_HEIGHT,
      '#0a0812',
    );
  }
  scenePainter.setOpacity(1);
}
