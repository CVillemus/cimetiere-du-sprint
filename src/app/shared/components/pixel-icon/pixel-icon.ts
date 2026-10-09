import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  Signal,
} from '@angular/core';
import { buildPixelGridPath, PixelGrid } from '../../pixel-art/pixel-grid';

/** Petite icône pixel art dessinée à partir d'une grille ; prend la couleur du texte (`currentColor`). */
@Component({
  selector: 'app-pixel-icon',
  templateUrl: './pixel-icon.html',
  styleUrl: './pixel-icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelIcon {
  readonly iconGrid: InputSignal<PixelGrid> = input.required<PixelGrid>();

  protected readonly iconPath: Signal<string> = computed((): string =>
    buildPixelGridPath(this.iconGrid()),
  );

  protected readonly viewBox: Signal<string> = computed(
    (): string => `0 0 ${this.iconGrid()[0].length} ${this.iconGrid().length}`,
  );
}
