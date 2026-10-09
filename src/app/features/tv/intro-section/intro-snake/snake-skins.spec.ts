import { pickSnakeSkin, SNAKE_SKINS } from './snake-skins';

describe('pickSnakeSkin', () => {
  it('should pick the first skin for the lowest random value', () => {
    expect(pickSnakeSkin(0)).toBe(SNAKE_SKINS[0]);
  });

  it('should pick the last skin for the highest random value', () => {
    expect(pickSnakeSkin(0.9999)).toBe(SNAKE_SKINS[SNAKE_SKINS.length - 1]);
  });

  it('should pick the coral snake more often than a weight-1 skin', () => {
    const pickCounts: Map<string, number> = new Map();
    for (let drawIndex: number = 0; drawIndex < 1000; drawIndex++) {
      const skinName: string = pickSnakeSkin(drawIndex / 1000).name;
      pickCounts.set(skinName, (pickCounts.get(skinName) ?? 0) + 1);
    }

    expect(pickCounts.get(SNAKE_SKINS[0].name) ?? 0).toBeGreaterThan(
      pickCounts.get(SNAKE_SKINS[2].name) ?? 0,
    );
  });
});
