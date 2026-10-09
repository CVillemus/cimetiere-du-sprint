import { TestBed } from '@angular/core/testing';
import { TvNavigationStore } from '../../../core/navigation/tv-navigation.store';
import { TvNavigator } from './tv-navigator';

/** Sans composant de transition enregistré, la navigation s'applique immédiatement. */
describe('TvNavigator', () => {
  let tvNavigator: TvNavigator;
  let tvNavigationStore: TvNavigationStore;

  beforeEach(() => {
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

    expect(tvNavigationStore.currentSectionIndex()).toBe(0);
    expect(tvNavigationStore.currentSlideIndex()).toBe(0);
  });
});
