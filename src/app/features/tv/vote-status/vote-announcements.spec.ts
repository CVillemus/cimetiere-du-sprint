import { buildStragglersMessage } from './vote-announcements';

describe('buildStragglersMessage', () => {
  it('should name a single straggler', () => {
    expect(buildStragglersMessage(['Hugo'])).toBe('Plus que Hugo');
  });

  it('should join two or three stragglers the French way', () => {
    expect(buildStragglersMessage(['Hugo', 'Max'])).toBe('Plus que Hugo et Max');
    expect(buildStragglersMessage(['Hugo', 'Inès', 'Max'])).toBe('Plus que Hugo, Inès et Max');
  });

  it('should stay silent when nobody is missing or too many are', () => {
    expect(buildStragglersMessage([])).toBeNull();
    expect(buildStragglersMessage(['A', 'B', 'C', 'D'])).toBeNull();
  });
});
