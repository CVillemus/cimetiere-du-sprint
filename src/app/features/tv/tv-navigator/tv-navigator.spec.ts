import { TestBed } from '@angular/core/testing';
import { VOTE_SLIDE_INDEX } from '../../../core/navigation/tv-section.model';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { VotingApi } from '../../../core/voting/voting-api';
import { TvNavigator } from './tv-navigator';

/**
 * Sans composant de transition enregistré, la navigation s'applique immédiatement.
 * La séance de vote n'est pas démarrée : personne n'est inscrit, la slide Vote reste verrouillée.
 */
/** L'intro, puis le premier film. */
const FIRST_FILM_SECTION_INDEX: number = 1;

describe('TvNavigator', () => {
  let tvNavigator: TvNavigator;
  let tvNavigationStore: TvNavigationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: VotingApi, useValue: {} }],
    });
    tvNavigator = TestBed.inject(TvNavigator);
    tvNavigationStore = TestBed.inject(TvNavigationStore);
  });

  it('should go to the next section', () => {
    tvNavigator.navigateToNextSection();

    expect(tvNavigationStore.currentSectionIndex()).toBe(1);
  });

  it('should ignore a slide change on the intro section', () => {
    tvNavigator.navigateToNextSlide();

    expect(tvNavigationStore.currentSlideIndex()).toBe(0);
  });

  it('should come back to the intro from a film slide', () => {
    tvNavigator.navigateToSection(3);
    tvNavigator.navigateToNextSlide();

    tvNavigator.navigateToIntroSection();

    expect(tvNavigationStore.currentSectionIndex()).toBe(tvNavigationStore.introSectionIndex);
    expect(tvNavigationStore.currentSlideIndex()).toBe(0);
  });

  it('should stop on the trailer while the vote slide is locked', () => {
    tvNavigator.navigateToSection(FIRST_FILM_SECTION_INDEX);
    for (let slideStep: number = 0; slideStep < 5; slideStep++) {
      tvNavigator.navigateToNextSlide();
    }

    expect(tvNavigationStore.currentSlideKind()).toBe('trailer');
  });

  it('should open the vote slide when the Scrum Master forces it', () => {
    tvNavigator.navigateToSection(FIRST_FILM_SECTION_INDEX);

    tvNavigator.forceNavigationToVoteSlide();

    expect(tvNavigationStore.currentSlideIndex()).toBe(VOTE_SLIDE_INDEX);
  });
});
