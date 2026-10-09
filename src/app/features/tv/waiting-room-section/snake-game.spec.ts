import { GridCell, SnakeGame } from './snake-game';

/** Le hasard est figé : l'âme apparaît toujours dans la première case libre. */
const alwaysFirstFreeCell = (): number => 0;

describe('SnakeGame', () => {
  it('should start with a snake of four cells heading right', () => {
    const snakeGame: SnakeGame = new SnakeGame(20, 10, alwaysFirstFreeCell);

    expect(snakeGame.snakeCells.length).toBe(4);
    expect(snakeGame.currentDirection).toBe('right');
  });

  it('should move one cell forward on each step', () => {
    const snakeGame: SnakeGame = new SnakeGame(20, 10, alwaysFirstFreeCell);
    const headBefore: GridCell = snakeGame.snakeCells[0];

    snakeGame.advance();

    expect(snakeGame.snakeCells[0]).toEqual({ x: headBefore.x + 1, y: headBefore.y });
    expect(snakeGame.snakeCells.length).toBe(4);
  });

  it('should ignore a U-turn onto itself', () => {
    const snakeGame: SnakeGame = new SnakeGame(20, 10, alwaysFirstFreeCell);

    snakeGame.steer('left');
    snakeGame.advance();

    expect(snakeGame.currentDirection).toBe('right');
    expect(snakeGame.isGameOver).toBe(false);
  });

  it('should crash into the wall', () => {
    const snakeGame: SnakeGame = new SnakeGame(8, 6, alwaysFirstFreeCell);

    for (let stepIndex: number = 0; stepIndex < 10; stepIndex++) {
      snakeGame.advance();
    }

    expect(snakeGame.isGameOver).toBe(true);
  });

  it('should grow and score when eating a soul', () => {
    // L'âme apparaît en (0, 0) : on monte jusqu'à la ligne 0, puis on file vers la gauche.
    const snakeGame: SnakeGame = new SnakeGame(10, 6, alwaysFirstFreeCell);
    expect(snakeGame.foodCell).toEqual({ x: 0, y: 0 });

    snakeGame.steer('up');
    for (let stepIndex: number = 0; stepIndex < 3; stepIndex++) {
      snakeGame.advance();
    }
    snakeGame.steer('left');
    for (let stepIndex: number = 0; stepIndex < 4; stepIndex++) {
      snakeGame.advance();
    }

    expect(snakeGame.score).toBe(1);
    expect(snakeGame.snakeCells.length).toBe(5);
  });

  it('should survive a long time on autopilot', () => {
    const snakeGame: SnakeGame = new SnakeGame(30, 15, Math.random);

    for (let stepIndex: number = 0; stepIndex < 300; stepIndex++) {
      snakeGame.steerAutomatically();
      snakeGame.advance();
    }

    expect(snakeGame.isGameOver).toBe(false);
    expect(snakeGame.score).toBeGreaterThan(3);
  });
});
