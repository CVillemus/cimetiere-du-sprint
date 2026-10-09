/**
 * Calcul (sans dessin) de la forme d'une coulure : pour chaque colonne de pixels,
 * de combien elle est « en retard » sur la nappe. Les coulures sont des colonnes très en avance.
 */
export interface DripFront {
  /** Retard de chaque colonne, en pixels : 0 = colonne la plus avancée. */
  readonly columnLags: Float32Array;
  readonly drips: readonly Drip[];
}

export interface Drip {
  readonly centerX: number;
  readonly halfWidth: number;
}

export function createDripFront(
  gridWidth: number,
  maximumLag: number,
  dripCount: number,
): DripFront {
  const firstWavePhase: number = Math.random() * 6;
  const secondWavePhase: number = Math.random() * 6;
  const columnLags: Float32Array = new Float32Array(gridWidth);

  // Bord de la nappe : deux ondulations douces superposées.
  for (let columnX: number = 0; columnX < gridWidth; columnX++) {
    columnLags[columnX] =
      maximumLag *
      (0.55 +
        0.25 * Math.sin(columnX / (gridWidth / 11) + firstWavePhase) +
        0.15 * Math.sin(columnX / (gridWidth / 30) + secondWavePhase));
  }

  // Coulures : on « creuse » le retard autour de quelques colonnes, en forme de cloche.
  const drips: Drip[] = [];
  for (let dripIndex: number = 0; dripIndex < dripCount; dripIndex++) {
    const centerX: number = Math.random() * gridWidth;
    const halfWidth: number = 1 + (Math.random() * gridWidth) / 40;
    const dripLength: number = maximumLag * (0.35 + Math.random() * 0.6);
    drips.push({ centerX, halfWidth });

    for (
      let columnX: number = Math.floor(centerX - halfWidth - 1);
      columnX <= Math.ceil(centerX + halfWidth + 1);
      columnX++
    ) {
      if (columnX < 0 || columnX >= gridWidth) {
        continue;
      }
      const distanceRatio: number = Math.min(Math.abs(columnX - centerX) / (halfWidth + 1), 1);
      const bellShape: number = Math.cos((distanceRatio * Math.PI) / 2) ** 2;
      columnLags[columnX] = Math.max(0, columnLags[columnX] - dripLength * bellShape);
    }
  }

  return { columnLags, drips };
}
