# CLAUDE.md

## Projet

Le Cimetière du Sprint : une onepage projetée sur une TV pour qu'un groupe d'amis choisisse un film d'horreur, façon poker planning. La soirée a eu lieu le samedi 10 octobre 2026 : **le site est désormais une archive**, sans back-end ni vote.

- **Site (`/`)** : 12 sections plein écran (accueil souvenir, 10 films, Sprint Review). Chaque film a un carrousel horizontal : Résumé → Presse → Trailer → Vote (les cartes retournées ce soir-là).
- **Résultats** : figés dans `src/app/core/voting/resultats-de-la-soiree.json` (export Supabase), lus par `PartyResultsStore`.
- **Teaser (`/teaser`)** : la page partagée avant la soirée.
- **Podium** : moyenne des scores, puis nombre de « OHHHHH OUI ! », puis film le plus court. Veto : au moins 3 « Hors de question » éliminent le film.
- **Refaire une soirée** : lire `docs/RECETTE.md` et partir de l'étiquette Git `soiree-du-10-octobre-2026`, qui contient le vote en direct (Supabase, QR code, téléphones).

## Stack

- Angular 22, zoneless, composants standalone, signals, nouveau control flow.
- Aucun back-end : les résultats de la soirée sont un fichier JSON (le vote en direct Supabase est dans l'étiquette `soiree-du-10-octobre-2026`).
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
- **Couleurs** : uniquement via les variables CSS de `src/styles.css`. Seules exceptions : les illustrations pixel art (le dossier `film-scene/scenes/`, les fichiers `*.scene.ts`, `shared/pixel-art/snake-skins.ts`, `spider-sprite.ts`), qui gardent leur palette avec le dessin.
- Nommage des fichiers selon le style guide Angular actuel : `tv-page.ts` / classe `TvPage`.

## Navigation de la TV

- `TvNavigationStore` (core) est la seule source de vérité : section courante, slide courante.
- Aucun scroll natif : les pistes de sections et de slides sont translatées en CSS selon le store.
- Clavier, molette et clics passent par `TvNavigator`. Changement de section : la coulure `PixelDripTransition` (0,8 s, « sang séché »). Changement d'onglet : la nuée `BatSwarmTransition` (0,65 s, dans le sens de la navigation). Les deux partagent le même verrou.
- Les décors sont dessinés sur `<canvas>` (128×96) avec `PixelPainter` : décor fixe, lumières qui vacillent, calque animé image par image (`FILM_SCENE_ANIMATORS`, ~12 i/s, seulement quand le décor est visible), apparition en fondu.
- Sur la TV, le panneau ne montre que le centre d'un décor (x ≈ 24 à 104) : y placer tout ce qui compte. Le coin bas droit est masqué par l'encart des votes.
- Les fonds des panneaux (`PixelBackdrop`) alternent crâne, tête de mort, arbre mort, corbeau, araignée, avec une animation « idle ».

## Sound design

- Sons dans `core/sound/`, joués seulement après un premier geste (touche ou clic).
- Sons 8-bit synthétisés en Web Audio par `SpookySynth` (aucun fichier audio), avec une réverbération de « crypte ».
- `TvSoundDesign` : vent de crypte au changement de section, battements d'ailes en stéréo au changement d'onglet, coup de théâtre en ouvrant l'onglet Vote (décliné selon la moyenne : `chooseRevealMood`), orgue + glas à la Sprint Review.
- Le navigateur bloque le son jusqu'à la première touche ou au premier clic ; touche `M` pour couper. Volume baissé pendant la bande-annonce.

## Arborescence

```
src/app/
  core/       singletons (données des films, navigation TV, résultats de la soirée)
  features/
    tv/       page projetée
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
