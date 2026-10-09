import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { Film } from '../../../../core/films/film.model';
import { IntensityMeter } from '../../../../shared/components/intensity-meter/intensity-meter';
import { SkullBackdrop } from '../../../../shared/components/skull-backdrop/skull-backdrop';
import { TriggerWarningList } from '../../../../shared/components/trigger-warning-list/trigger-warning-list';
import { FilmScene } from '../film-scene/film-scene';

/**
 * Mise en page commune aux slides Résumé et Presse :
 * panneau texte à gauche (en-tête du film + contenu projeté), décor pixel à droite.
 */
@Component({
  selector: 'app-film-panel-layout',
  imports: [SkullBackdrop, IntensityMeter, TriggerWarningList, FilmScene],
  templateUrl: './film-panel-layout.html',
  styleUrl: './film-panel-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmPanelLayout {
  readonly film: InputSignal<Film> = input.required<Film>();
  readonly tombNumber: InputSignal<number> = input.required<number>();
  readonly filmCount: InputSignal<number> = input.required<number>();
  readonly triggerWarnings: InputSignal<readonly string[]> = input.required<readonly string[]>();

  protected readonly directorNames: Signal<string> = computed((): string =>
    this.film().directors.join(' & '),
  );

  protected readonly formattedDuration: Signal<string> = computed((): string => {
    const durationInMinutes: number = this.film().durationInMinutes;
    const hours: number = Math.floor(durationInMinutes / 60);
    const minutes: string = String(durationInMinutes % 60).padStart(2, '0');
    return `${hours}h${minutes}`;
  });
}
