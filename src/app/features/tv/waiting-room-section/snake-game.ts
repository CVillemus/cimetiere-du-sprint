export type SnakeDirection = 'up' | 'down' | 'left' | 'right';

export interface GridCell {
  readonly x: number;
  readonly y: number;
}

const DIRECTION_STEPS: Readonly<Record<SnakeDirection, GridCell>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS: Readonly<Record<SnakeDirection, SnakeDirection>> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const ALL_DIRECTIONS: readonly SnakeDirection[] = ['up', 'right', 'down', 'left'];
const INITIAL_LENGTH: number = 4;
/** On garde au plus deux virages d'avance : deux flèches tapées très vite ne sont pas perdues. */
const MAXIMUM_QUEUED_DIRECTIONS: number = 2;

/** Un virage envisagé par le mode démo : la place qu'il laisse, et la distance à l'âme. */
interface AutopilotMove {
  readonly direction: SnakeDirection;
  readonly freeSpace: number;
  readonly distanceToFood: number;
}

function moveCell(cell: GridCell, direction: SnakeDirection): GridCell {
  const step: GridCell = DIRECTION_STEPS[direction];
  return { x: cell.x + step.x, y: cell.y + step.y };
}

function isSameCell(firstCell: GridCell, secondCell: GridCell): boolean {
  return firstCell.x === secondCell.x && firstCell.y === secondCell.y;
}

/**
 * Une partie de Snake, sans aucun affichage : la grille, le serpent (tête en premier),
 * l'âme à dévorer, le score. Le composant appelle `advance()` à chaque battement.
 */
export class SnakeGame {
  private snake: GridCell[] = [];
  private food: GridCell = { x: 0, y: 0 };
  private direction: SnakeDirection = 'right';
  private readonly queuedDirections: SnakeDirection[] = [];
  private scoreValue: number = 0;
  private hasCrashed: boolean = false;

  constructor(
    readonly columnCount: number,
    readonly rowCount: number,
    private readonly random: () => number = Math.random,
  ) {
    this.restart();
  }

  get snakeCells(): readonly GridCell[] {
    return this.snake;
  }

  get foodCell(): GridCell {
    return this.food;
  }

  get currentDirection(): SnakeDirection {
    return this.direction;
  }

  get score(): number {
    return this.scoreValue;
  }

  get isGameOver(): boolean {
    return this.hasCrashed;
  }

  restart(): void {
    const middleRow: number = Math.floor(this.rowCount / 2);
    this.snake = Array.from(
      { length: INITIAL_LENGTH },
      (_: unknown, cellIndex: number): GridCell => ({
        x: INITIAL_LENGTH - cellIndex,
        y: middleRow,
      }),
    );
    this.direction = 'right';
    this.queuedDirections.length = 0;
    this.scoreValue = 0;
    this.hasCrashed = false;
    this.placeFood();
  }

  /** Change de direction au prochain pas. Un demi-tour sur soi-même est ignoré. */
  steer(requestedDirection: SnakeDirection): void {
    const lastPlannedDirection: SnakeDirection =
      this.queuedDirections[this.queuedDirections.length - 1] ?? this.direction;
    if (
      requestedDirection === lastPlannedDirection ||
      requestedDirection === OPPOSITE_DIRECTIONS[lastPlannedDirection] ||
      this.queuedDirections.length >= MAXIMUM_QUEUED_DIRECTIONS
    ) {
      return;
    }
    this.queuedDirections.push(requestedDirection);
  }

  /** Avance d'une case : mange l'âme, ou se cogne contre un mur ou contre lui-même. */
  advance(): void {
    if (this.hasCrashed) {
      return;
    }
    this.direction = this.queuedDirections.shift() ?? this.direction;
    const nextHead: GridCell = moveCell(this.snake[0], this.direction);
    const isEating: boolean = isSameCell(nextHead, this.food);
    // La queue avance en même temps que la tête : sa case se libère, sauf si on grandit.
    const bodyAfterMove: readonly GridCell[] = isEating ? this.snake : this.snake.slice(0, -1);
    if (
      !this.isInsideGrid(nextHead) ||
      bodyAfterMove.some((cell: GridCell) => isSameCell(cell, nextHead))
    ) {
      this.hasCrashed = true;
      return;
    }
    this.snake = [nextHead, ...bodyAfterMove];
    if (isEating) {
      this.scoreValue++;
      this.placeFood();
    }
  }

  /**
   * Mode démo : choisit seul le prochain virage. Parmi les directions sans danger immédiat,
   * il garde celles qui laissent assez de place pour ne pas s'enfermer, puis file vers l'âme.
   */
  steerAutomatically(): void {
    const head: GridCell = this.snake[0];
    const bodyWithoutTail: readonly GridCell[] = this.snake.slice(0, -1);
    const safeMoves: AutopilotMove[] = ALL_DIRECTIONS.filter(
      (candidateDirection: SnakeDirection): boolean =>
        candidateDirection !== OPPOSITE_DIRECTIONS[this.direction],
    )
      .map((candidateDirection: SnakeDirection): AutopilotMove => {
        const nextHead: GridCell = moveCell(head, candidateDirection);
        const isSafe: boolean =
          this.isInsideGrid(nextHead) &&
          !bodyWithoutTail.some((cell: GridCell): boolean => isSameCell(cell, nextHead));
        return {
          direction: candidateDirection,
          freeSpace: isSafe ? this.countReachableCells(nextHead, bodyWithoutTail) : 0,
          distanceToFood: Math.abs(nextHead.x - this.food.x) + Math.abs(nextHead.y - this.food.y),
        };
      })
      .filter((autopilotMove: AutopilotMove): boolean => autopilotMove.freeSpace > 0);
    if (safeMoves.length === 0) {
      return;
    }
    const roomiestFreeSpace: number = Math.max(
      ...safeMoves.map((autopilotMove: AutopilotMove): number => autopilotMove.freeSpace),
    );
    const requiredFreeSpace: number = Math.min(this.snake.length, roomiestFreeSpace);
    const bestMove: AutopilotMove = safeMoves
      .filter(
        (autopilotMove: AutopilotMove): boolean => autopilotMove.freeSpace >= requiredFreeSpace,
      )
      .sort(
        (firstMove: AutopilotMove, secondMove: AutopilotMove): number =>
          firstMove.distanceToFood - secondMove.distanceToFood,
      )[0];
    this.queuedDirections.length = 0;
    if (bestMove.direction !== this.direction) {
      this.queuedDirections.push(bestMove.direction);
    }
  }

  private isInsideGrid(cell: GridCell): boolean {
    return cell.x >= 0 && cell.y >= 0 && cell.x < this.columnCount && cell.y < this.rowCount;
  }

  /** Remplissage par diffusion : combien de cases le serpent peut encore atteindre depuis `startCell`. */
  private countReachableCells(startCell: GridCell, blockedCells: readonly GridCell[]): number {
    const visitedKeys: Set<number> = new Set(
      blockedCells.map((cell: GridCell): number => cell.y * this.columnCount + cell.x),
    );
    const cellsToVisit: GridCell[] = [startCell];
    visitedKeys.add(startCell.y * this.columnCount + startCell.x);
    let reachableCount: number = 0;
    while (cellsToVisit.length > 0) {
      const cell: GridCell = cellsToVisit.pop() as GridCell;
      reachableCount++;
      ALL_DIRECTIONS.forEach((neighbourDirection: SnakeDirection) => {
        const neighbour: GridCell = moveCell(cell, neighbourDirection);
        const neighbourKey: number = neighbour.y * this.columnCount + neighbour.x;
        if (this.isInsideGrid(neighbour) && !visitedKeys.has(neighbourKey)) {
          visitedKeys.add(neighbourKey);
          cellsToVisit.push(neighbour);
        }
      });
    }
    return reachableCount;
  }

  private placeFood(): void {
    const freeCells: GridCell[] = [];
    for (let y: number = 0; y < this.rowCount; y++) {
      for (let x: number = 0; x < this.columnCount; x++) {
        if (!this.snake.some((cell: GridCell) => cell.x === x && cell.y === y)) {
          freeCells.push({ x, y });
        }
      }
    }
    this.food = freeCells[Math.floor(this.random() * freeCells.length)] ?? this.food;
  }
}
