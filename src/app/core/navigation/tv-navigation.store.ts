import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Film } from '../films/film.model';
import { FILMS } from '../films/films.data';
import { FILM_SLIDE_ORDER, FilmSlideKind, TvSection } from './tv-section.model';

/**
 * Source de vérité unique de la position sur la TV : quelle section verticale, quelle slide horizontale.
 *
 * Les composants lisent des Signal en lecture seule et agissent via des méthodes nommées.
 * L'affichage (translation des pistes) est une conséquence de cet état, jamais l'inverse.
 * Côté TV, on ne l'appelle pas directement : on passe par le `TvNavigator`, qui ajoute la transition.
 */
@Injectable({ providedIn: 'root' })
export class TvNavigationStore {
  readonly sections: readonly TvSection[] = [
    { kind: 'intro' },
    ...FILMS.map((film: Film, filmIndex: number): TvSection => ({
      kind: 'film',
      film,
      tombNumber: filmIndex + 1,
    })),
    { kind: 'sprint-review' },
  ];

  readonly filmCount: number = FILMS.length;

  private readonly currentSectionIndexState: WritableSignal<number> = signal(0);
  private readonly currentSlideIndexState: WritableSignal<number> = signal(0);

  readonly currentSectionIndex: Signal<number> = this.currentSectionIndexState.asReadonly();
  readonly currentSlideIndex: Signal<number> = this.currentSlideIndexState.asReadonly();

  readonly currentSection: Signal<TvSection> = computed(
    (): TvSection => this.sections[this.currentSectionIndexState()],
  );

  /** Film affiché, ou `null` sur l'intro et la Sprint Review. */
  readonly currentFilm: Signal<Film | null> = computed((): Film | null => {
    const currentSection: TvSection = this.currentSection();
    return currentSection.kind === 'film' ? currentSection.film : null;
  });

  readonly currentSlideKind: Signal<FilmSlideKind> = computed(
    (): FilmSlideKind => FILM_SLIDE_ORDER[this.currentSlideIndexState()],
  );

  goToSection(sectionIndex: number): void {
    const clampedSectionIndex: number = this.clampIndex(sectionIndex, this.sections.length);
    if (clampedSectionIndex === this.currentSectionIndexState()) {
      return;
    }
    this.currentSectionIndexState.set(clampedSectionIndex);
    // Entrer dans un film ramène toujours au Résumé.
    this.currentSlideIndexState.set(0);
  }

  goToNextSection(): void {
    this.goToSection(this.currentSectionIndexState() + 1);
  }

  goToPreviousSection(): void {
    this.goToSection(this.currentSectionIndexState() - 1);
  }

  goToIntroSection(): void {
    this.goToSection(0);
  }

  goToSlide(slideIndex: number): void {
    if (this.currentFilm() === null) {
      return;
    }
    this.currentSlideIndexState.set(this.clampIndex(slideIndex, FILM_SLIDE_ORDER.length));
  }

  goToNextSlide(): void {
    this.goToSlide(this.currentSlideIndexState() + 1);
  }

  goToPreviousSlide(): void {
    this.goToSlide(this.currentSlideIndexState() - 1);
  }

  private clampIndex(index: number, itemCount: number): number {
    return Math.min(Math.max(index, 0), itemCount - 1);
  }
}
