import { inject, Injectable } from '@angular/core';
import { FILM_SLIDE_ORDER } from '../../../core/navigation/tv-section.model';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { PixelDripTransitionService } from '../pixel-drip-transition/pixel-drip-transition.service';

/**
 * Toutes les intentions de navigation de la TV (clavier, molette, clics) passent par ici :
 * on vérifie que le déplacement change quelque chose, puis on le joue derrière la coulure de pixels.
 */
@Injectable({ providedIn: 'root' })
export class TvNavigator {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );

  navigateToSection(sectionIndex: number): void {
    const isOutOfRange: boolean =
      sectionIndex < 0 || sectionIndex >= this.tvNavigationStore.sections.length;
    if (isOutOfRange || sectionIndex === this.tvNavigationStore.currentSectionIndex()) {
      return;
    }
    this.pixelDripTransitionService.playTransition(() =>
      this.tvNavigationStore.goToSection(sectionIndex),
    );
  }

  navigateToNextSection(): void {
    this.navigateToSection(this.tvNavigationStore.currentSectionIndex() + 1);
  }

  navigateToPreviousSection(): void {
    this.navigateToSection(this.tvNavigationStore.currentSectionIndex() - 1);
  }

  navigateToIntroSection(): void {
    this.navigateToSection(0);
  }

  navigateToSlide(slideIndex: number): void {
    const isOutOfRange: boolean = slideIndex < 0 || slideIndex >= FILM_SLIDE_ORDER.length;
    const isOutsideFilmSection: boolean = this.tvNavigationStore.currentFilm() === null;
    if (
      isOutOfRange ||
      isOutsideFilmSection ||
      slideIndex === this.tvNavigationStore.currentSlideIndex()
    ) {
      return;
    }
    this.pixelDripTransitionService.playTransition(() =>
      this.tvNavigationStore.goToSlide(slideIndex),
    );
  }

  navigateToNextSlide(): void {
    this.navigateToSlide(this.tvNavigationStore.currentSlideIndex() + 1);
  }

  navigateToPreviousSlide(): void {
    this.navigateToSlide(this.tvNavigationStore.currentSlideIndex() - 1);
  }
}
