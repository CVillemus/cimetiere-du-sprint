import {
  createBatSwarm,
  SwarmBat,
  swarmBatPositionAt,
  SwarmVeil,
  swarmVeilAt,
  swarmVeilDensityAt,
} from './bat-swarm';

const GRID_WIDTH: number = 128;
const GRID_HEIGHT: number = 72;

describe('bat swarm', () => {
  it('should leave the screen uncovered before the swarm arrives', () => {
    const swarmVeil: SwarmVeil = swarmVeilAt(0, GRID_WIDTH);

    expect(swarmVeilDensityAt(0, 0, swarmVeil, 0)).toBe(0);
  });

  it('should cover every pixel at mid-flight, when the slide is swapped', () => {
    [0.4999, 0.5].forEach((progress: number) => {
      const swarmVeil: SwarmVeil = swarmVeilAt(progress, GRID_WIDTH);
      const pixelDensities: number[] = Array.from(
        { length: GRID_WIDTH * GRID_HEIGHT },
        (_: unknown, pixelIndex: number): number =>
          swarmVeilDensityAt(
            pixelIndex % GRID_WIDTH,
            Math.floor(pixelIndex / GRID_WIDTH),
            swarmVeil,
            progress,
          ),
      );

      expect(Math.min(...pixelDensities)).toBe(1);
    });
  });

  it('should leave a ragged edge rather than a straight curtain', () => {
    const swarmVeil: SwarmVeil = swarmVeilAt(0.25, GRID_WIDTH);
    const edgeColumnPerRow: number[] = Array.from(
      { length: GRID_HEIGHT },
      (_: unknown, rowY: number): number =>
        Array.from({ length: GRID_WIDTH }, (__: unknown, column: number): number => column).filter(
          (column: number): boolean => swarmVeilDensityAt(column, rowY, swarmVeil, 0.25) > 0,
        ).length,
    );

    expect(Math.max(...edgeColumnPerRow) - Math.min(...edgeColumnPerRow)).toBeGreaterThan(5);
  });

  it('should uncover the whole screen at the end', () => {
    const swarmVeil: SwarmVeil = swarmVeilAt(1, GRID_WIDTH);

    expect(swarmVeilDensityAt(GRID_WIDTH - 1, 0, swarmVeil, 1)).toBe(0);
  });

  it('should mirror the flight when going to the previous tab', () => {
    const [swarmBat]: readonly SwarmBat[] = createBatSwarm(1);

    const toRightX: number = swarmBatPositionAt(
      swarmBat,
      0.3,
      0,
      'to-right',
      GRID_WIDTH,
      GRID_HEIGHT,
    ).x;
    const toLeftX: number = swarmBatPositionAt(
      swarmBat,
      0.3,
      0,
      'to-left',
      GRID_WIDTH,
      GRID_HEIGHT,
    ).x;

    expect(toLeftX).toBeCloseTo(GRID_WIDTH - 1 - toRightX);
  });

  it('should create the same swarm every time', () => {
    expect(createBatSwarm(5)).toEqual(createBatSwarm(5));
  });
});
