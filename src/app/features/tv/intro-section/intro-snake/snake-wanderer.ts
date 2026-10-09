export type SnakeDirection = 'up' | 'down' | 'left' | 'right';

/** `hidden` : hors champ ; `wandering` : se promène ; `leaving` : file vers le bord le plus proche. */
export type SnakePhase = 'hidden' | 'wandering' | 'leaving';

export interface GridCell {
  readonly column: number;
  readonly row: number;
}

const DIRECTION_OFFSETS: Readonly<Record<SnakeDirection, GridCell>> = {
  up: { column: 0, row: -1 },
  down: { column: 0, row: 1 },
  left: { column: -1, row: 0 },
  right: { column: 1, row: 0 },
};

const OPPOSITE_DIRECTIONS: Readonly<Record<SnakeDirection, SnakeDirection>> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/** Chance de tourner à chaque pas : assez rare pour onduler, assez fréquente pour surprendre. */
const TURN_PROBABILITY: number = 0.12;

/**
 * Déplacement d'un serpent sur une grille, sans aucun dessin ni minuterie :
 * c'est de la logique pure, facile à tester.
 */
export class SnakeWanderer {
  private segments: GridCell[] = [];
  private direction: SnakeDirection = 'right';
  private currentPhase: SnakePhase = 'hidden';

  constructor(
    private readonly gridColumns: number,
    private readonly gridRows: number,
    private readonly snakeLength: number,
    private readonly random: () => number = Math.random,
  ) {}

  get phase(): SnakePhase {
    return this.currentPhase;
  }

  /** Les segments, tête en premier. */
  get bodySegments(): readonly GridCell[] {
    return this.segments;
  }

  get headDirection(): SnakeDirection {
    return this.direction;
  }

  /** Apparaît depuis un bord au hasard, corps encore hors champ, tête tournée vers l'intérieur. */
  enterFromRandomEdge(): void {
    const entryDirections: readonly SnakeDirection[] = ['up', 'down', 'left', 'right'];
    this.direction = entryDirections[Math.floor(this.random() * entryDirections.length)];
    const headCell: GridCell = this.pickEntryCell(this.direction);
    const backwardOffset: GridCell = DIRECTION_OFFSETS[OPPOSITE_DIRECTIONS[this.direction]];
    this.segments = Array.from(
      { length: this.snakeLength },
      (_unused: unknown, segmentIndex: number): GridCell => ({
        column: headCell.column + backwardOffset.column * segmentIndex,
        row: headCell.row + backwardOffset.row * segmentIndex,
      }),
    );
    this.currentPhase = 'wandering';
  }

  /** Part vers le bord le plus proche, sans plus tourner, jusqu'à disparaître. */
  startLeaving(): void {
    if (this.currentPhase !== 'wandering') {
      return;
    }
    this.direction = this.findDirectionToNearestEdge();
    this.currentPhase = 'leaving';
  }

  advance(): void {
    if (this.currentPhase === 'hidden') {
      return;
    }
    if (this.currentPhase === 'wandering') {
      this.chooseWanderingDirection();
    }
    const offset: GridCell = DIRECTION_OFFSETS[this.direction];
    const headCell: GridCell = this.segments[0];
    this.segments = [
      { column: headCell.column + offset.column, row: headCell.row + offset.row },
      ...this.segments.slice(0, -1),
    ];
    const isFullyOutside: boolean = this.segments.every(
      (cell: GridCell): boolean => !this.isInsideGrid(cell),
    );
    if (this.currentPhase === 'leaving' && isFullyOutside) {
      this.segments = [];
      this.currentPhase = 'hidden';
    }
  }

  isInsideGrid(cell: GridCell): boolean {
    return (
      cell.column >= 0 &&
      cell.column < this.gridColumns &&
      cell.row >= 0 &&
      cell.row < this.gridRows
    );
  }

  private chooseWanderingDirection(): void {
    const headCell: GridCell = this.segments[0];
    const turnDirections: readonly SnakeDirection[] = this.perpendicularDirections(this.direction);
    const isHeadInside: boolean = this.isInsideGrid(headCell);
    const wantsToTurn: boolean = isHeadInside && this.random() < TURN_PROBABILITY;
    const isBlockedAhead: boolean =
      isHeadInside && !this.isInsideGrid(this.nextCell(headCell, this.direction));

    if (!wantsToTurn && !isBlockedAhead) {
      return;
    }
    const possibleTurns: readonly SnakeDirection[] = turnDirections.filter(
      (turnDirection: SnakeDirection): boolean =>
        this.isInsideGrid(this.nextCell(headCell, turnDirection)),
    );
    if (possibleTurns.length > 0) {
      this.direction = possibleTurns[Math.floor(this.random() * possibleTurns.length)];
    }
  }

  /** Le bord le plus proche, sans jamais faire demi-tour sur soi-même. */
  private findDirectionToNearestEdge(): SnakeDirection {
    const headCell: GridCell = this.segments[0];
    const distanceToEdge: Readonly<Record<SnakeDirection, number>> = {
      up: headCell.row,
      down: this.gridRows - 1 - headCell.row,
      left: headCell.column,
      right: this.gridColumns - 1 - headCell.column,
    };
    const allowedDirections: SnakeDirection[] = (['up', 'down', 'left', 'right'] as const).filter(
      (edgeDirection: SnakeDirection): boolean =>
        edgeDirection !== OPPOSITE_DIRECTIONS[this.direction],
    );
    return allowedDirections.reduce(
      (nearestDirection: SnakeDirection, edgeDirection: SnakeDirection): SnakeDirection =>
        distanceToEdge[edgeDirection] < distanceToEdge[nearestDirection]
          ? edgeDirection
          : nearestDirection,
    );
  }

  isHidden(): boolean {
    return this.currentPhase === 'hidden';
  }

  private pickEntryCell(entryDirection: SnakeDirection): GridCell {
    const randomColumn: number = 2 + Math.floor(this.random() * (this.gridColumns - 4));
    const randomRow: number = 2 + Math.floor(this.random() * (this.gridRows - 4));
    switch (entryDirection) {
      case 'down':
        return { column: randomColumn, row: 0 };
      case 'up':
        return { column: randomColumn, row: this.gridRows - 1 };
      case 'right':
        return { column: 0, row: randomRow };
      case 'left':
        return { column: this.gridColumns - 1, row: randomRow };
    }
  }

  private perpendicularDirections(direction: SnakeDirection): readonly SnakeDirection[] {
    return direction === 'up' || direction === 'down' ? ['left', 'right'] : ['up', 'down'];
  }

  private nextCell(cell: GridCell, direction: SnakeDirection): GridCell {
    const offset: GridCell = DIRECTION_OFFSETS[direction];
    return { column: cell.column + offset.column, row: cell.row + offset.row };
  }
}
