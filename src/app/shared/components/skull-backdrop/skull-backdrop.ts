import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Grille du crâne : `#` = pixel plein, `.` = vide. */
const SKULL_PIXEL_ROWS: readonly string[] = [
  '....#####....',
  '..#########..',
  '.###########.',
  '.###########.',
  '#############',
  '###...#...###',
  '###...#...###',
  '###...#...###',
  '#############',
  '.#####.#####.',
  '..####.####..',
  '...#.#.#.#...',
  '...#########.',
  '....#.#.#....',
];

/** Transforme la grille en un seul chemin SVG : un carré de 1×1 par pixel plein. */
function buildPixelPath(pixelRows: readonly string[]): string {
  return pixelRows
    .flatMap((pixelRow: string, rowIndex: number) =>
      [...pixelRow].map((pixel: string, columnIndex: number) =>
        pixel === '#' ? `M${columnIndex} ${rowIndex}h1v1h-1z` : '',
      ),
    )
    .join('');
}

/**
 * Crâne pixel très discret, posé en fond d'un panneau.
 * Son opacité vient de la variable CSS globale `--skull-opacity`.
 */
@Component({
  selector: 'app-skull-backdrop',
  templateUrl: './skull-backdrop.html',
  styleUrl: './skull-backdrop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkullBackdrop {
  protected readonly skullPath: string = buildPixelPath(SKULL_PIXEL_ROWS);
  protected readonly skullViewBox: string = `0 0 ${SKULL_PIXEL_ROWS[0].length} ${SKULL_PIXEL_ROWS.length}`;
}
