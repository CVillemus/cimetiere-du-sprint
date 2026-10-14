import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Le Cimetière du Sprint',
    loadComponent: () => import('./features/tv/tv-page').then((module) => module.TvPage),
  },
  {
    path: 'teaser',
    title: 'Le Cimetière du Sprint · Samedi 18h',
    loadComponent: () =>
      import('./features/teaser/teaser-page').then((module) => module.TeaserPage),
  },
  { path: '**', redirectTo: '' },
];
