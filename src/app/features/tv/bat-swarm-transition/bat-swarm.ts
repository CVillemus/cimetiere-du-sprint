import { BatSwarmDirection } from '../../../shared/components/pixel-drip-transition/pixel-drip-transition.service';

/** Une chauve-souris de la nuée : où elle vole par rapport au bord du voile, et à quel rythme. */
export interface SwarmBat {
  /** Hauteur de vol, entre 0 (haut de l'écran) et 1 (bas). */
  readonly laneRatio: number;
  /** Décalage horizontal par rapport au bord du voile, en fraction de la largeur de l'écran. */
  readonly edgeOffsetRatio: number;
  readonly bobPhase: number;
  readonly flapPhase: number;
}

export interface SwarmBatPosition {
  readonly x: number;
  readonly y: number;
  readonly areWingsUp: boolean;
}

/** Zone couverte par le voile sombre, en colonnes « dans le sens du vol » (0 = bord de départ). */
export interface SwarmVeil {
  readonly trailingEdge: number;
  readonly leadingEdge: number;
}

/** Largeur du bord tramé du voile, en colonnes. */
export const SWARM_VEIL_DITHER_WIDTH: number = 6;
const WING_FLAP_DURATION_IN_MILLISECONDS: number = 70;
const BOB_AMPLITUDE: number = 2;
const BOB_SPEED: number = 18;

const easeInOutQuadratic = (progress: number): number =>
  progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;

/** Nuée déterministe : même vol à chaque transition, pour un rendu maîtrisé. */
export function createBatSwarm(batCount: number): readonly SwarmBat[] {
  return Array.from({ length: batCount }, (_: unknown, batIndex: number): SwarmBat => {
    const pseudoRandom = (salt: number): number => {
      const sine: number = Math.sin((batIndex + 1) * salt) * 10_000;
      return sine - Math.floor(sine);
    };
    return {
      laneRatio: 0.06 + pseudoRandom(12.9898) * 0.88,
      // La plupart volent juste devant le voile, quelques-unes à la traîne dedans.
      edgeOffsetRatio: -0.22 + pseudoRandom(78.233) * 0.3,
      bobPhase: pseudoRandom(37.719) * Math.PI * 2,
      flapPhase: Math.floor(pseudoRandom(93.989) * 2),
    };
  });
}

/**
 * Phase 1 (0 → 0,5) : la nuée traverse et tire derrière elle un voile qui couvre l'écran.
 * Phase 2 (0,5 → 1) : une seconde vague emporte le voile et découvre la nouvelle slide.
 */
export function swarmVeilAt(progress: number, gridWidth: number): SwarmVeil {
  const travel: number = gridWidth + SWARM_VEIL_DITHER_WIDTH * 2;
  if (progress < 0.5) {
    return {
      trailingEdge: Number.NEGATIVE_INFINITY,
      leadingEdge: easeInOutQuadratic(progress * 2) * travel - SWARM_VEIL_DITHER_WIDTH,
    };
  }
  return {
    trailingEdge: easeInOutQuadratic((progress - 0.5) * 2) * travel - SWARM_VEIL_DITHER_WIDTH,
    leadingEdge: Number.POSITIVE_INFINITY,
  };
}

export function swarmBatPositionAt(
  swarmBat: SwarmBat,
  progress: number,
  elapsedMilliseconds: number,
  direction: BatSwarmDirection,
  gridWidth: number,
  gridHeight: number,
): SwarmBatPosition {
  const swarmVeil: SwarmVeil = swarmVeilAt(progress, gridWidth);
  const veilEdge: number = progress < 0.5 ? swarmVeil.leadingEdge : swarmVeil.trailingEdge;
  const columnInFlightDirection: number = veilEdge + swarmBat.edgeOffsetRatio * gridWidth;
  return {
    x: direction === 'to-right' ? columnInFlightDirection : gridWidth - 1 - columnInFlightDirection,
    y:
      swarmBat.laneRatio * gridHeight +
      Math.sin(progress * BOB_SPEED + swarmBat.bobPhase) * BOB_AMPLITUDE,
    areWingsUp:
      (Math.floor(elapsedMilliseconds / WING_FLAP_DURATION_IN_MILLISECONDS) + swarmBat.flapPhase) %
        2 ===
      0,
  };
}

/** Épaisseur du voile en une colonne : 1 au cœur, entre 0 et 1 dans les bords tramés. */
export function swarmVeilDensityAt(columnInFlightDirection: number, swarmVeil: SwarmVeil): number {
  const distanceInsideLeadingEdge: number = swarmVeil.leadingEdge - columnInFlightDirection;
  const distanceInsideTrailingEdge: number = columnInFlightDirection - swarmVeil.trailingEdge;
  const distanceInside: number = Math.min(distanceInsideLeadingEdge, distanceInsideTrailingEdge);
  return Math.max(0, Math.min(1, distanceInside / SWARM_VEIL_DITHER_WIDTH));
}
