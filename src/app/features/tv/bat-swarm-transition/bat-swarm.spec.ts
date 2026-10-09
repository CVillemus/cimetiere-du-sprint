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

    expect(swarmVeilDensityAt(0, swarmVeil)).toBe(0);
  });

  it('should cover every column at mid-flight, when the slide is swapped', () => {
    [0.4999, 0.5].forEach((progress: number) => {
      const swarmVeil: SwarmVeil = swarmVeilAt(progress, GRID_WIDTH);
      const columnDensities: number[] = Array.from(
        { length: GRID_WIDTH },
        (_: unknown, column: number): number => swarmVeilDensityAt(column, swarmVeil),
      );

      expect(Math.min(...columnDensities)).toBe(1);
    });
  });

  it('should uncover the whole screen at the end', () => {
    const swarmVeil: SwarmVeil = swarmVeilAt(1, GRID_WIDTH);

    expect(swarmVeilDensityAt(GRID_WIDTH - 1, swarmVeil)).toBe(0);
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
