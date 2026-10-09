import { SpiderPhase, SpiderPosition, SpiderWalker, SpiderWalkerArea } from './spider-walker';

const SPIDER_WALKER_AREA: SpiderWalkerArea = {
  width: 128,
  height: 72,
  spiderWidth: 9,
  spiderHeight: 5,
};

describe('SpiderWalker', () => {
  it('should be hidden before appearing', () => {
    const spiderWalker: SpiderWalker = new SpiderWalker(SPIDER_WALKER_AREA);

    expect(spiderWalker.isHidden()).toBe(true);
  });

  it('should hang from its thread while descending, then let go', () => {
    const spiderWalker: SpiderWalker = new SpiderWalker(SPIDER_WALKER_AREA);
    spiderWalker.descendFromCeiling();
    expect(spiderWalker.isHangingFromThread).toBe(true);

    for (let stepIndex: number = 0; stepIndex < 80; stepIndex++) {
      spiderWalker.advance();
    }

    expect(spiderWalker.isHangingFromThread).toBe(false);
  });

  it('should stay on screen while walking, then leave and hide', () => {
    const spiderWalker: SpiderWalker = new SpiderWalker(SPIDER_WALKER_AREA);
    spiderWalker.descendFromCeiling();
    const visitedPhases: Set<SpiderPhase> = new Set();

    for (let stepIndex: number = 0; stepIndex < 5000 && !spiderWalker.isHidden(); stepIndex++) {
      spiderWalker.advance();
      visitedPhases.add(spiderWalker.phase);
      if (spiderWalker.phase === 'walking' || spiderWalker.phase === 'pausing') {
        const spiderPosition: SpiderPosition = spiderWalker.spiderPosition;
        expect(spiderPosition.x).toBeGreaterThanOrEqual(0);
        expect(spiderPosition.x).toBeLessThanOrEqual(SPIDER_WALKER_AREA.width);
        expect(spiderPosition.y).toBeGreaterThanOrEqual(0);
        expect(spiderPosition.y).toBeLessThanOrEqual(SPIDER_WALKER_AREA.height);
      }
    }

    expect(visitedPhases.has('walking')).toBe(true);
    expect(visitedPhases.has('leaving')).toBe(true);
    expect(spiderWalker.isHidden()).toBe(true);
  });
});
