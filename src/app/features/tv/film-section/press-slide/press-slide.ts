import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Film, IMDB_RATINGS_CHECKED_ON } from '../../../../core/films/film.model';
import { FilmPanelLayout } from '../film-panel-layout/film-panel-layout';

const SPOILER_TRIGGER_WARNING: string = 'Spoilers légers';
/** Une case de la jauge par point IMDb, comme les cœurs ou les crans d'une barre de vie. */
const IMDB_GAUGE_SEGMENT_COUNT: number = 10;
/** Les cases s'allument l'une après l'autre en arrivant sur la slide. */
const SEGMENT_CHARGE_DELAY_IN_MILLISECONDS: number = 70;

@Component({
  selector: 'app-press-slide',
  imports: [FilmPanelLayout],
  templateUrl: './press-slide.html',
  styleUrl: './press-slide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; height: 100%' },
})
export class PressSlide {
  readonly film: InputSignal<Film> = input.required<Film>();
  readonly tombNumber: InputSignal<number> = input.required<number>();
  readonly filmCount: InputSignal<number> = input.required<number>();
  /** La jauge se recharge case par case à chaque arrivée sur la slide Presse. */
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  protected readonly segmentChargeDelayInMilliseconds: number =
    SEGMENT_CHARGE_DELAY_IN_MILLISECONDS;

  protected readonly imdbRatingsCheckedOn: string = IMDB_RATINGS_CHECKED_ON;

  protected readonly pressTriggerWarnings: Signal<readonly string[]> = computed(
    (): readonly string[] =>
      this.film().pressReception.containsSpoilers ? [SPOILER_TRIGGER_WARNING] : [],
  );

  /** Remplissage de chaque case, entre 0 et 1 : 7,3 / 10 donne 7 cases pleines et une case à 30 %. */
  protected readonly imdbGaugeSegmentFillRatios: Signal<readonly number[]> = computed(
    (): readonly number[] =>
      Array.from({ length: IMDB_GAUGE_SEGMENT_COUNT }, (_: unknown, segmentIndex: number): number =>
        Math.max(0, Math.min(1, this.film().pressReception.imdbRating - segmentIndex)),
      ),
  );

  protected readonly formattedImdbRating: Signal<string> = computed((): string =>
    this.film().pressReception.imdbRating.toFixed(1).replace('.', ','),
  );
}
