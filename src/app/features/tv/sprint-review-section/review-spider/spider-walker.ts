/**
 * `hidden` : hors champ ; `descending` : descend du plafond au bout de son fil ;
 * `walking` : trottine vers un point ; `pausing` : s'arrête et guette ; `leaving` : file par un côté.
 */
export type SpiderPhase = 'hidden' | 'descending' | 'walking' | 'pausing' | 'leaving';

export interface SpiderPosition {
  readonly x: number;
  readonly y: number;
}

export interface SpiderWalkerArea {
  /** Taille de la zone de jeu, en pixels « art ». */
  readonly width: number;
  readonly height: number;
  /** Taille du sprite de l'araignée. */
  readonly spiderWidth: number;
  readonly spiderHeight: number;
}

const MINIMUM_WAYPOINT_COUNT: number = 3;
const MAXIMUM_WAYPOINT_COUNT: number = 6;
const MINIMUM_PAUSE_STEP_COUNT: number = 6;
const MAXIMUM_PAUSE_STEP_COUNT: number = 30;
const EDGE_MARGIN: number = 4;

/**
 * Déplacement d'une araignée, pixel par pixel, sans dessin ni minuterie : logique pure, testable.
 */
export class SpiderWalker {
  private position: SpiderPosition = { x: 0, y: 0 };
  private destination: SpiderPosition = { x: 0, y: 0 };
  private currentPhase: SpiderPhase = 'hidden';
  private remainingWaypointCount: number = 0;
  private remainingPauseSteps: number = 0;
  private legsFrameIndex: number = 0;
  /** Abscisse où le fil est accroché au plafond (pendant la descente). */
  private threadX: number = 0;

  constructor(
    private readonly spiderWalkerArea: SpiderWalkerArea,
    private readonly random: () => number = Math.random,
  ) {}

  get phase(): SpiderPhase {
    return this.currentPhase;
  }

  get spiderPosition(): SpiderPosition {
    return this.position;
  }

  /** Alterne à chaque pas : les pattes bougent quand l'araignée avance. */
  get currentLegsFrameIndex(): number {
    return this.legsFrameIndex;
  }

  get isHangingFromThread(): boolean {
    return this.currentPhase === 'descending';
  }

  get threadAnchorX(): number {
    return this.threadX;
  }

  isHidden(): boolean {
    return this.currentPhase === 'hidden';
  }

  /** Apparaît au-dessus de l'écran et descend au bout de son fil. */
  descendFromCeiling(): void {
    const { width, height, spiderWidth, spiderHeight }: SpiderWalkerArea = this.spiderWalkerArea;
    const startX: number = this.randomBetween(EDGE_MARGIN, width - spiderWidth - EDGE_MARGIN);
    this.position = { x: startX, y: -spiderHeight };
    this.destination = {
      x: startX,
      y: this.randomBetween(EDGE_MARGIN, height - spiderHeight - EDGE_MARGIN),
    };
    this.threadX = startX + Math.floor(spiderWidth / 2);
    this.remainingWaypointCount = this.randomBetween(
      MINIMUM_WAYPOINT_COUNT,
      MAXIMUM_WAYPOINT_COUNT,
    );
    this.currentPhase = 'descending';
  }

  advance(): void {
    switch (this.currentPhase) {
      case 'hidden':
        return;
      case 'pausing':
        this.remainingPauseSteps--;
        if (this.remainingPauseSteps <= 0) {
          this.walkToNextWaypointOrLeave();
        }
        return;
      case 'descending':
      case 'walking':
      case 'leaving':
        this.moveOnePixelTowardsDestination();
        if (this.hasReachedDestination()) {
          this.handleDestinationReached();
        }
    }
  }

  private handleDestinationReached(): void {
    if (this.currentPhase === 'leaving') {
      this.currentPhase = 'hidden';
      return;
    }
    // Arrivée en bas du fil, ou à un point de passage : petite pause aux aguets.
    this.remainingPauseSteps = this.randomBetween(
      MINIMUM_PAUSE_STEP_COUNT,
      MAXIMUM_PAUSE_STEP_COUNT,
    );
    this.currentPhase = 'pausing';
  }

  private walkToNextWaypointOrLeave(): void {
    const { width, height, spiderWidth, spiderHeight }: SpiderWalkerArea = this.spiderWalkerArea;
    if (this.remainingWaypointCount <= 0) {
      // Sortie par le côté le plus proche, à la même hauteur.
      const isCloserToLeftEdge: boolean = this.position.x < width / 2;
      this.destination = {
        x: isCloserToLeftEdge ? -spiderWidth : width,
        y: this.position.y,
      };
      this.currentPhase = 'leaving';
      return;
    }
    this.remainingWaypointCount--;
    this.destination = {
      x: this.randomBetween(EDGE_MARGIN, width - spiderWidth - EDGE_MARGIN),
      y: this.randomBetween(EDGE_MARGIN, height - spiderHeight - EDGE_MARGIN),
    };
    this.currentPhase = 'walking';
  }

  private moveOnePixelTowardsDestination(): void {
    this.position = {
      x: this.position.x + Math.sign(this.destination.x - this.position.x),
      y: this.position.y + Math.sign(this.destination.y - this.position.y),
    };
    this.legsFrameIndex = 1 - this.legsFrameIndex;
  }

  private hasReachedDestination(): boolean {
    return this.position.x === this.destination.x && this.position.y === this.destination.y;
  }

  private randomBetween(minimum: number, maximum: number): number {
    return minimum + Math.floor(this.random() * (maximum - minimum + 1));
  }
}
