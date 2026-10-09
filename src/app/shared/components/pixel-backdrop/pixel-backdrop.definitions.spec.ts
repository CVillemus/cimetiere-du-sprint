import { PixelGrid } from '../../pixel-art/pixel-grid';
import {
  PIXEL_BACKDROP_DEFINITIONS,
  PixelBackdropDefinition,
  PixelBackdropStep,
} from './pixel-backdrop.definitions';

describe('PIXEL_BACKDROP_DEFINITIONS', () => {
  const definitions: [string, PixelBackdropDefinition][] = Object.entries(
    PIXEL_BACKDROP_DEFINITIONS,
  );

  it.each(definitions)('%s should have rows of equal width in every frame', (_kind, definition) => {
    const expectedWidth: number = definition.frames[0][0].length;
    definition.frames.forEach((frame: PixelGrid) => {
      frame.forEach((pixelRow: string) => expect(pixelRow.length).toBe(expectedWidth));
    });
  });

  it.each(definitions)('%s should only reference existing frames', (_kind, definition) => {
    definition.steps.forEach((step: PixelBackdropStep) => {
      expect(step.frameIndex).toBeLessThan(definition.frames.length);
    });
  });
});
