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

  protected readonly imdbRatingsCheckedOn: string = IMDB_RATINGS_CHECKED_ON;

  protected readonly pressTriggerWarnings: Signal<readonly string[]> = computed(
    (): readonly string[] =>
      this.film().pressReception.containsSpoilers ? [SPOILER_TRIGGER_WARNING] : [],
  );

  /** Note IMDb sur 10 convertie en largeur de jauge (%). */
  protected readonly imdbGaugeWidthPercentage: Signal<number> = computed(
    (): number => this.film().pressReception.imdbRating * 10,
  );

  protected readonly formattedImdbRating: Signal<string> = computed((): string =>
    this.film().pressReception.imdbRating.toFixed(1).replace('.', ','),
  );
}
