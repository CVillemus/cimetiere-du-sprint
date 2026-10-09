import { buildCountdown, Countdown, padCountdownUnit } from './countdown';

const PARTY_STARTS_AT: Date = new Date(2026, 9, 10, 18, 0, 0);

describe('buildCountdown', () => {
  it('should split the remaining time into days, hours, minutes and seconds', () => {
    const countdown: Countdown = buildCountdown(new Date(2026, 9, 9, 15, 30, 10), PARTY_STARTS_AT);

    expect(countdown).toEqual({ days: 1, hours: 2, minutes: 29, seconds: 50, hasStarted: false });
  });

  it('should round up partial seconds so the countdown never shows zero too early', () => {
    const countdown: Countdown = buildCountdown(
      new Date(PARTY_STARTS_AT.getTime() - 400),
      PARTY_STARTS_AT,
    );

    expect(countdown.seconds).toBe(1);
    expect(countdown.hasStarted).toBe(false);
  });

  it('should stay at zero once the party has started', () => {
    const countdown: Countdown = buildCountdown(new Date(2026, 9, 10, 21, 0, 0), PARTY_STARTS_AT);

    expect(countdown).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: true });
  });
});

describe('padCountdownUnit', () => {
  it('should always keep two digits', () => {
    expect(padCountdownUnit(7)).toBe('07');
    expect(padCountdownUnit(42)).toBe('42');
  });
});
