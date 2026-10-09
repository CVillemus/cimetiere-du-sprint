import { inject, Injectable } from '@angular/core';
import { Film } from '../../../core/films/film.model';
import { FILM_SLIDE_ORDER, VOTE_SLIDE_INDEX } from '../../../core/navigation/tv-section.model';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { FilmVoteSummary } from '../../../core/voting/film-vote-summary';
import { TvSoundDesign } from '../../../core/sound/tv-sound-design';
import { TvVotingSessionStore } from '../../../core/voting/tv-voting-session.store';
import {
  BatSwarmDirection,
  PixelDripTransitionService,
} from '../../../shared/components/pixel-drip-transition/pixel-drip-transition.service';

/**
 * Toutes les intentions de navigation de la TV (clavier, molette, clics) passent par ici :
 * on vérifie que le déplacement change quelque chose, puis on le joue derrière la coulure de pixels.
 */
@Injectable({ providedIn: 'root' })
export class TvNavigator {
  private readonly tvNavigationStore: TvNavigationStore = inject(TvNavigationStore);
  private readonly tvVotingSessionStore: TvVotingSessionStore = inject(TvVotingSessionStore);
  private readonly pixelDripTransitionService: PixelDripTransitionService = inject(
    PixelDripTransitionService,
  );
  private readonly tvSoundDesign: TvSoundDesign = inject(TvSoundDesign);

  navigateToSection(sectionIndex: number): void {
    const isOutOfRange: boolean =
      sectionIndex < 0 || sectionIndex >= this.tvNavigationStore.sections.length;
    if (
      isOutOfRange ||
      sectionIndex === this.tvNavigationStore.currentSectionIndex() ||
      this.pixelDripTransitionService.isPlaying()
    ) {
      return;
    }
    this.tvSoundDesign.playSectionChange();
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
    this.navigateToSection(this.tvNavigationStore.introSectionIndex);
  }

  /** La slide Vote reste verrouillée tant que tout le monde n'a pas voté (sauf si déjà révélée). */
  navigateToSlide(slideIndex: number): void {
    if (slideIndex === VOTE_SLIDE_INDEX && !this.isVoteSlideUnlocked()) {
      return;
    }
    this.playSlideTransition(slideIndex);
  }

  navigateToNextSlide(): void {
    this.navigateToSlide(this.tvNavigationStore.currentSlideIndex() + 1);
  }

  navigateToPreviousSlide(): void {
    this.navigateToSlide(this.tvNavigationStore.currentSlideIndex() - 1);
  }

  /** Touche R : le Scrum Master force l'ouverture du vote, même si des retardataires n'ont pas voté. */
  forceNavigationToVoteSlide(): void {
    this.playSlideTransition(VOTE_SLIDE_INDEX);
  }

  isVoteSlideUnlocked(): boolean {
    const currentFilm: Film | null = this.tvNavigationStore.currentFilm();
    if (currentFilm === null) {
      return false;
    }
    const filmVoteSummary: FilmVoteSummary = this.tvVotingSessionStore.filmVoteSummary(
      currentFilm.id,
    );
    return filmVoteSummary.hasEveryoneVoted || filmVoteSummary.isRevealed;
  }

  private playSlideTransition(slideIndex: number): void {
    const isOutOfRange: boolean = slideIndex < 0 || slideIndex >= FILM_SLIDE_ORDER.length;
    const isOutsideFilmSection: boolean = this.tvNavigationStore.currentFilm() === null;
    if (
      isOutOfRange ||
      isOutsideFilmSection ||
      slideIndex === this.tvNavigationStore.currentSlideIndex()
    ) {
      return;
    }
    if (this.pixelDripTransitionService.isPlaying()) {
      return;
    }
    const direction: BatSwarmDirection =
      slideIndex > this.tvNavigationStore.currentSlideIndex() ? 'to-right' : 'to-left';
    this.tvSoundDesign.playTabChange(direction);
    this.pixelDripTransitionService.playBatSwarmTransition(
      () => this.tvNavigationStore.goToSlide(slideIndex),
      direction,
    );
  }
}
