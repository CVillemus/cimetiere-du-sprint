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

/** Largeur du bord tramé du voile, en colonnes : un long fondu plutôt qu'un rideau net. */
export const SWARM_VEIL_DITHER_WIDTH: number = 18;
/** Le bord avance plus ou moins vite selon la ligne : il ondule et s'effiloche comme une fumée. */
const SWARM_VEIL_EDGE_RAGGEDNESS: number = 10;
/** Marge hors écran : au début et à la fin, même le bord le plus en avance reste invisible. */
const SWARM_VEIL_MARGIN: number = SWARM_VEIL_DITHER_WIDTH + SWARM_VEIL_EDGE_RAGGEDNESS;
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
  const travel: number = gridWidth + SWARM_VEIL_MARGIN * 2;
  if (progress < 0.5) {
    return {
      trailingEdge: Number.NEGATIVE_INFINITY,
      leadingEdge: easeInOutQuadratic(progress * 2) * travel - SWARM_VEIL_MARGIN,
    };
  }
  return {
    trailingEdge: easeInOutQuadratic((progress - 0.5) * 2) * travel - SWARM_VEIL_MARGIN,
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

/**
 * Décalage du bord du voile pour une ligne : deux ondulations lentes qui bougent pendant le vol,
 * plus un léger grain fixe par ligne. Toujours compris entre -10 et +10 colonnes.
 */
function veilEdgeOffsetAt(rowY: number, progress: number, phase: number): number {
  const slowWave: number = Math.sin(rowY * 0.31 + progress * 9 + phase) * 4;
  const wideWave: number = Math.sin(rowY * 0.11 + phase * 2.3) * 5;
  const rowGrainSine: number = Math.sin((rowY + 1) * 91.7 + phase) * 10_000;
  const rowGrain: number = (rowGrainSine - Math.floor(rowGrainSine) - 0.5) * 2;
  return slowWave + wideWave + rowGrain;
}

/**
 * Épaisseur du voile en un pixel : 1 au cœur, entre 0 et 1 dans le long bord effiloché.
 * Le bord avant et le bord arrière ondulent différemment.
 */
export function swarmVeilDensityAt(
  columnInFlightDirection: number,
  rowY: number,
  swarmVeil: SwarmVeil,
  progress: number,
): number {
  const distanceInsideLeadingEdge: number =
    swarmVeil.leadingEdge + veilEdgeOffsetAt(rowY, progress, 0) - columnInFlightDirection;
  const distanceInsideTrailingEdge: number =
    columnInFlightDirection - swarmVeil.trailingEdge - veilEdgeOffsetAt(rowY, progress, 1.7);
  const distanceInside: number = Math.min(distanceInsideLeadingEdge, distanceInsideTrailingEdge);
  return Math.max(0, Math.min(1, distanceInside / SWARM_VEIL_DITHER_WIDTH));
}
