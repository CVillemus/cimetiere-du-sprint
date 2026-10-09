import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Signal,
  viewChild,
} from '@angular/core';
import { TvNavigationStore } from '../../core/navigation/tv-navigation.store';
import { TvSection } from '../../core/navigation/tv-section.model';
import { FilmSection } from './film-section/film-section';
import { IntroSection } from './intro-section/intro-section';
import { SectionProgress } from './section-progress/section-progress';
import { SprintReviewSection } from './sprint-review-section/sprint-review-section';

/**
 * Page projetée sur la TV : 12 sections plein écran avec scroll vertical aimanté.
 *
 * Le store décide de la section courante, le scroll suit :
 * - clavier → méthode du store → signal → `afterRenderEffect` fait défiler ;
 * - molette → `scroll-snap` CSS → `scrollend` → `syncSectionFromScroll()`.
 * On écoute `scrollend` (et pas `scroll`) pour ne jamais signaler les sections traversées.
 */
@Component({
  selector: 'app-tv-page',
  imports: [IntroSection, FilmSection, SprintReviewSection, SectionProgress],
  templateUrl: './tv-page.html',
  styleUrl: './tv-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'handleKeyboardNavigation($event)' },
})
export class TvPage {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);

  protected readonly sections: readonly TvSection[] = this.tvNavigationStore.sections;
  protected readonly currentSectionIndex: Signal<number> =
    this.tvNavigationStore.currentSectionIndex;

  private readonly sectionScroller: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('sectionScroller');

  constructor() {
    afterRenderEffect(() => {
      const sectionScrollerElement: HTMLElement = this.sectionScroller().nativeElement;
      const targetScrollTop: number =
        this.currentSectionIndex() * sectionScrollerElement.clientHeight;
      if (Math.abs(sectionScrollerElement.scrollTop - targetScrollTop) < 1) {
        return;
      }
      sectionScrollerElement.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    });
  }

  /** Fin d'un scroll vertical manuel : on informe le store de la section visible. */
  protected handleSectionScrollEnd(): void {
    const sectionScrollerElement: HTMLElement = this.sectionScroller().nativeElement;
    const visibleSectionIndex: number = Math.round(
      sectionScrollerElement.scrollTop / sectionScrollerElement.clientHeight,
    );
    this.tvNavigationStore.syncSectionFromScroll(visibleSectionIndex);
  }

  protected handleKeyboardNavigation(keyboardEvent: KeyboardEvent): void {
    switch (keyboardEvent.key) {
      case 'ArrowDown':
      case 'PageDown':
        this.tvNavigationStore.goToNextSection();
        break;
      case 'ArrowUp':
      case 'PageUp':
        this.tvNavigationStore.goToPreviousSection();
        break;
      case 'ArrowRight':
        this.tvNavigationStore.goToNextSlide();
        break;
      case 'ArrowLeft':
        this.tvNavigationStore.goToPreviousSlide();
        break;
      case 'Escape':
        this.tvNavigationStore.goToIntroSection();
        break;
      default:
        return;
    }
    // On empêche le scroll natif du navigateur : c'est le store qui pilote.
    keyboardEvent.preventDefault();
  }
}
