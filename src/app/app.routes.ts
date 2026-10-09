import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Le Cimetière du Sprint',
    loadComponent: () => import('./features/tv/tv-page').then((module) => module.TvPage),
  },
  {
    path: 'vote',
    title: 'Vote · Le Cimetière du Sprint',
    loadComponent: () => import('./features/vote/vote-page').then((module) => module.VotePage),
  },
  {
    path: 'teaser',
    title: 'Le Cimetière du Sprint · Samedi 18h',
    loadComponent: () =>
      import('./features/teaser/teaser-page').then((module) => module.TeaserPage),
  },
  { path: '**', redirectTo: '' },
];
