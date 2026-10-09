/**
 * Une grille de pixels écrite à la main : `#` = pixel plein, `.` = vide.
 * Toutes les lignes d'une grille ont la même longueur.
 */
export type PixelGrid = readonly string[];

const FILLED_PIXEL: string = '#';
const EMPTY_PIXEL: string = '.';

/** Transforme la grille en un seul chemin SVG : un carré de 1×1 par pixel plein. */
export function buildPixelGridPath(
  pixelGrid: PixelGrid,
  offsetX: number = 0,
  offsetY: number = 0,
): string {
  return pixelGrid
    .flatMap((pixelRow: string, rowIndex: number) =>
      [...pixelRow].map((pixel: string, columnIndex: number) =>
        pixel === FILLED_PIXEL ? `M${columnIndex + offsetX} ${rowIndex + offsetY}h1v1h-1z` : '',
      ),
    )
    .join('');
}

/** Remplit certaines cellules : pratique pour fermer des yeux (paupières). */
export function fillPixelGridCells(
  pixelGrid: PixelGrid,
  rowIndexes: readonly number[],
  columnIndexes: readonly number[],
): PixelGrid {
  return pixelGrid.map((pixelRow: string, rowIndex: number): string =>
    rowIndexes.includes(rowIndex)
      ? [...pixelRow]
          .map((pixel: string, columnIndex: number): string =>
            columnIndexes.includes(columnIndex) ? FILLED_PIXEL : pixel,
          )
          .join('')
      : pixelRow,
  );
}

/** Décale certaines lignes d'un pixel vers la gauche (-1) ou la droite (+1) : branches qui se balancent. */
export function shiftPixelGridRows(
  pixelGrid: PixelGrid,
  rowIndexes: readonly number[],
  direction: -1 | 1,
): PixelGrid {
  return pixelGrid.map((pixelRow: string, rowIndex: number): string => {
    if (!rowIndexes.includes(rowIndex)) {
      return pixelRow;
    }
    return direction === 1 ? EMPTY_PIXEL + pixelRow.slice(0, -1) : pixelRow.slice(1) + EMPTY_PIXEL;
  });
}

/** Insère une ligne vide : la mâchoire qui s'ouvre. */
export function insertEmptyPixelGridRow(pixelGrid: PixelGrid, rowIndex: number): PixelGrid {
  const emptyRow: string = EMPTY_PIXEL.repeat(pixelGrid[0].length);
  return [...pixelGrid.slice(0, rowIndex), emptyRow, ...pixelGrid.slice(rowIndex)];
}
