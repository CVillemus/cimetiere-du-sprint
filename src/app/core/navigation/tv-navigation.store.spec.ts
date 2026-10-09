import { TestBed } from '@angular/core/testing';
import { FILMS } from '../films/films.data';
import { TvNavigationStore } from './tv-navigation.store';

describe('TvNavigationStore', () => {
  let tvNavigationStore: TvNavigationStore;

  beforeEach(() => {
    tvNavigationStore = TestBed.inject(TvNavigationStore);
  });

  it('should build 12 sections: intro, 10 films, sprint review', () => {
    expect(tvNavigationStore.sections.length).toBe(FILMS.length + 2);
    expect(tvNavigationStore.sections[0].kind).toBe('intro');
    expect(tvNavigationStore.sections[tvNavigationStore.sections.length - 1].kind).toBe(
      'sprint-review',
    );
  });

  it('should start on the intro without current film', () => {
    expect(tvNavigationStore.currentSectionIndex()).toBe(0);
    expect(tvNavigationStore.currentFilm()).toBeNull();
  });

  it('should expose the first film after going to the next section', () => {
    tvNavigationStore.goToNextSection();

    expect(tvNavigationStore.currentFilm()?.id).toBe(FILMS[0].id);
  });

  it('should not go above the first section nor below the last one', () => {
    tvNavigationStore.goToPreviousSection();
    expect(tvNavigationStore.currentSectionIndex()).toBe(0);

    tvNavigationStore.goToSection(99);
    expect(tvNavigationStore.currentSectionIndex()).toBe(tvNavigationStore.sections.length - 1);
  });

  it('should reset the slide to the summary when entering another film', () => {
    tvNavigationStore.goToNextSection();
    tvNavigationStore.goToNextSlide();
    tvNavigationStore.goToNextSlide();
    expect(tvNavigationStore.currentSlideKind()).toBe('trailer');

    tvNavigationStore.goToNextSection();

    expect(tvNavigationStore.currentSlideKind()).toBe('summary');
  });

  it('should ignore slide navigation outside of a film section', () => {
    tvNavigationStore.goToNextSlide();

    expect(tvNavigationStore.currentSlideIndex()).toBe(0);
  });

  it('should keep the slide when asked to go to the current section again', () => {
    tvNavigationStore.goToNextSection();
    tvNavigationStore.goToNextSlide();

    tvNavigationStore.goToSection(1);

    expect(tvNavigationStore.currentSlideKind()).toBe('press');
  });
});
