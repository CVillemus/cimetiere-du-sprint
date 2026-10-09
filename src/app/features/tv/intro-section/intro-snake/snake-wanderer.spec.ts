import { GridCell, SnakeDirection, SnakeWanderer } from './snake-wanderer';

const OPPOSITE_DIRECTIONS: Readonly<Record<SnakeDirection, SnakeDirection>> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

describe('SnakeWanderer', () => {
  it('should be hidden before entering', () => {
    const snakeWanderer: SnakeWanderer = new SnakeWanderer(20, 12, 5);

    expect(snakeWanderer.phase).toBe('hidden');
    expect(snakeWanderer.bodySegments.length).toBe(0);
  });

  it('should keep its length and never turn back on itself while wandering', () => {
    const snakeWanderer: SnakeWanderer = new SnakeWanderer(20, 12, 5);
    snakeWanderer.enterFromRandomEdge();

    for (let stepIndex: number = 0; stepIndex < 500; stepIndex++) {
      const previousDirection: SnakeDirection = snakeWanderer.headDirection;
      snakeWanderer.advance();
      expect(snakeWanderer.headDirection).not.toBe(OPPOSITE_DIRECTIONS[previousDirection]);
      expect(snakeWanderer.bodySegments.length).toBe(5);
    }
  });

  it('should stay inside the grid once fully entered', () => {
    const snakeWanderer: SnakeWanderer = new SnakeWanderer(20, 12, 5);
    snakeWanderer.enterFromRandomEdge();
    for (let stepIndex: number = 0; stepIndex < 10; stepIndex++) {
      snakeWanderer.advance();
    }

    for (let stepIndex: number = 0; stepIndex < 500; stepIndex++) {
      snakeWanderer.advance();
      const headCell: GridCell = snakeWanderer.bodySegments[0];
      expect(snakeWanderer.isInsideGrid(headCell)).toBe(true);
    }
  });

  it('should disappear completely after leaving', () => {
    const snakeWanderer: SnakeWanderer = new SnakeWanderer(20, 12, 5);
    snakeWanderer.enterFromRandomEdge();
    for (let stepIndex: number = 0; stepIndex < 30; stepIndex++) {
      snakeWanderer.advance();
    }

    snakeWanderer.startLeaving();
    for (let stepIndex: number = 0; stepIndex < 60; stepIndex++) {
      snakeWanderer.advance();
    }

    expect(snakeWanderer.phase).toBe('hidden');
  });
});
