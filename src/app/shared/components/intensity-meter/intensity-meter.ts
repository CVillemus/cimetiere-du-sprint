import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { IntensityLevel } from '../../../core/films/film.model';

export type IntensityTone = 'fear' | 'gore';

const MAXIMUM_INTENSITY_LEVEL: number = 5;

/** Jauge pixel « Peur ■■■□□ ». */
@Component({
  selector: 'app-intensity-meter',
  templateUrl: './intensity-meter.html',
  styleUrl: './intensity-meter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"intensity-meter--" + tone()' },
})
export class IntensityMeter {
  readonly label: InputSignal<string> = input.required<string>();
  readonly level: InputSignal<IntensityLevel> = input.required<IntensityLevel>();
  readonly tone: InputSignal<IntensityTone> = input.required<IntensityTone>();

  /** Un booléen par carré : `true` = carré plein. */
  protected readonly filledSquares: Signal<readonly boolean[]> = computed((): readonly boolean[] =>
    Array.from(
      { length: MAXIMUM_INTENSITY_LEVEL },
      (_unused: unknown, squareIndex: number): boolean => squareIndex < this.level(),
    ),
  );
}
