# CLAUDE.md

## Projet

Le Cimetière du Sprint : une onepage projetée sur une TV pour qu'un groupe de 10 personnes choisisse un film d'horreur, façon poker planning. Chacun vote depuis son téléphone (route `/vote`, ouverte via un QR code).

- **TV (`/`)** : 12 sections plein écran avec scroll vertical aimanté (QR code, 10 films, Sprint Review). Chaque film a un carrousel horizontal : Résumé → Trailer → Presse.
- **Téléphones (`/vote`)** : pseudo, puis 5 cartes (Hors de question / Bof / Ok / Cool ! / OHHHHH OUI !).
- **Mode Scrum Master** : la TV pilote le film en cours, les votes restent secrets jusqu'à la révélation (touche `R`).
- **Podium** : moyenne des scores, puis nombre de « OHHHHH OUI ! », puis film le plus court. Veto : au moins 3 « Hors de question » éliminent le film.

## Stack

- Angular 22, zoneless, composants standalone, signals, nouveau control flow.
- Supabase (PostgreSQL + realtime) pour la session, les participants et les votes.
- Hébergement GitHub Pages, déployé par `.github/workflows/deploy-github-pages.yml` à chaque push sur `main`.

## Conventions obligatoires

- **Tout typer** : jamais de `any`. Exposer `Signal<T>` en lecture seule, garder `WritableSignal<T>` privé.
- **OnPush partout** : `changeDetection: ChangeDetectionStrategy.OnPush` sur chaque composant.
- **Pas de `ngOnInit`** : utiliser `afterNextRender()`, `effect()` ou `computed()`.
- **Templates séparés** : toujours `templateUrl` + fichier `.html`, jamais de template inline.
- **Nommage métier** : `openVotingForFilm()` pas `open()`, `filmVote` pas `item`.
- **Lisibilité** : `films.length > 0` plutôt que `!films.length`.
- **Template d'une resource** : `hasValue()` → `error()` → sinon chargement.
- **Lazy loading** : chaque page passe par `loadComponent`.
- **Couleurs** : uniquement via les variables CSS de `src/styles.css`. Seules exceptions : les illustrations pixel art (`*.scene.ts`, `snake-skins.ts`, `spider-sprite.ts`), qui gardent leur palette avec le dessin.
- Nommage des fichiers selon le style guide Angular actuel : `tv-page.ts` / classe `TvPage`.

## Navigation de la TV

- `TvNavigationStore` (core) est la seule source de vérité : section courante, slide courante.
- Aucun scroll natif : les pistes de sections et de slides sont translatées en CSS selon le store.
- Clavier, molette et clics passent par `TvNavigator`, qui joue chaque changement derrière la transition `PixelDripTransition` (coulure de pixels, 0,8 s, teinte « sang séché »), aussi sur le téléphone.
- Les décors sont dessinés sur `<canvas>` (128×96) avec `PixelPainter` ; les lumières sont sur un second canvas qui vacille.
- Les fonds des panneaux (`PixelBackdrop`) alternent crâne, tête de mort, arbre mort, corbeau, araignée, avec une animation « idle ».

## Arborescence

```
src/app/
  core/       singletons (données des films, navigation TV, session de vote Supabase)
  features/
    tv/       page projetée
    vote/     page téléphone
  shared/     briques réutilisables (sprites pixel, badges de trigger warning…)
```

## Git

Conventional Commits en français, minuscules, sans point final (< 72 caractères). Les hooks Husky lancent Prettier, `tsc` et commitlint.

## Commandes

```bash
npm start                  # http://localhost:4200
npm test                   # Vitest en mode watch
npm run test:ci            # Vitest une seule fois
npm run build:github-pages # build avec le base-href du repo
```
