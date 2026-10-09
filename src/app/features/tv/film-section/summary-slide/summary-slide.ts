import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { Film } from '../../../../core/films/film.model';
import { FilmPanelLayout } from '../film-panel-layout/film-panel-layout';

@Component({
  selector: 'app-summary-slide',
  imports: [FilmPanelLayout],
  templateUrl: './summary-slide.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block; height: 100%' },
})
export class SummarySlide {
  readonly film: InputSignal<Film> = input.required<Film>();
  readonly tombNumber: InputSignal<number> = input.required<number>();
  readonly filmCount: InputSignal<number> = input.required<number>();
}
