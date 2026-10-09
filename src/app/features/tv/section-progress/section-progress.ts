import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { TvSection } from '../../../core/navigation/tv-section.model';
import { TvNavigator } from '../tv-navigator/tv-navigator';

/** Les 12 crans à droite de l'écran : où en est-on dans la soirée ? */
@Component({
  selector: 'app-section-progress',
  templateUrl: './section-progress.html',
  styleUrl: './section-progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionProgress {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvNavigator: TvNavigator = inject(TvNavigator);

  protected readonly sections: readonly TvSection[] = this.tvNavigationStore.sections;
  protected readonly currentSectionIndex: Signal<number> =
    this.tvNavigationStore.currentSectionIndex;

  protected describeSection(section: TvSection): string {
    switch (section.kind) {
      case 'waiting-room':
        return "Salle d'attente";
      case 'intro':
        return 'QR code';
      case 'film':
        return `Tombe ${section.tombNumber} : ${section.film.frenchTitle}`;
      case 'sprint-review':
        return 'Sprint Review';
    }
  }

  protected selectSection(sectionIndex: number): void {
    this.tvNavigator.navigateToSection(sectionIndex);
  }
}
