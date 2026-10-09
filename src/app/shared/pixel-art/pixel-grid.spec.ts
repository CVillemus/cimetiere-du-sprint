import {
  buildPixelGridPath,
  fillPixelGridCells,
  insertEmptyPixelGridRow,
  PixelGrid,
  shiftPixelGridRows,
} from './pixel-grid';

describe('pixel-grid', () => {
  const pixelGrid: PixelGrid = ['#.', '.#'];

  it('should build one square per filled pixel', () => {
    expect(buildPixelGridPath(pixelGrid)).toBe('M0 0h1v1h-1zM1 1h1v1h-1z');
  });

  it('should fill the requested cells only', () => {
    expect(fillPixelGridCells(pixelGrid, [0], [1])).toEqual(['##', '.#']);
  });

  it('should shift a row to the right and keep its width', () => {
    expect(shiftPixelGridRows(pixelGrid, [0], 1)).toEqual(['.#', '.#']);
  });

  it('should insert an empty row', () => {
    expect(insertEmptyPixelGridRow(pixelGrid, 1)).toEqual(['#.', '..', '.#']);
  });
});
