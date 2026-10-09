import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

/**
 * Décor pixel art à droite du panneau texte.
 * Étape 2 : un cimetière générique avec le numéro de la tombe. Étape 3 : un décor par film.
 */
@Component({
  selector: 'app-film-scene',
  templateUrl: './film-scene.html',
  styleUrl: './film-scene.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmScene {
  readonly tombNumber: InputSignal<number> = input.required<number>();
}
