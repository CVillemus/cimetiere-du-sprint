const ONE_SECOND_IN_MILLISECONDS: number = 1000;
const SECONDS_PER_MINUTE: number = 60;
const SECONDS_PER_HOUR: number = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY: number = 24 * SECONDS_PER_HOUR;

export interface Countdown {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  /** `true` dès que l'heure de début est atteinte : le compte à rebours reste alors à zéro. */
  readonly hasStarted: boolean;
}

/** Temps restant entre `now` et `target`, découpé en jours, heures, minutes et secondes. */
export function buildCountdown(now: Date, target: Date): Countdown {
  const remainingSeconds: number = Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / ONE_SECOND_IN_MILLISECONDS),
  );
  return {
    days: Math.floor(remainingSeconds / SECONDS_PER_DAY),
    hours: Math.floor((remainingSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((remainingSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: remainingSeconds % SECONDS_PER_MINUTE,
    hasStarted: remainingSeconds === 0,
  };
}

/** « 7 » devient « 07 » : les cases du compte à rebours gardent toujours deux chiffres. */
export function padCountdownUnit(value: number): string {
  return String(value).padStart(2, '0');
}
