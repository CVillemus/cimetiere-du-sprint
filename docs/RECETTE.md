# Recette : refaire une soirée « Cimetière du Sprint »

Tout ce qu'il faut pour refaire ce projet sur un autre thème de films (comédies, SF, Noël…).
Écrit après la soirée du samedi 10 octobre 2026, avant le retrait du vote en direct.

## Retrouver la version « vote en direct »

Le site actuel est une archive : les votes sont figés dans un fichier JSON, sans back-end.
La version jouée le soir même (Supabase, QR code, téléphones, touche R, sons de vote) est conservée
sous l'étiquette Git **`soiree-du-10-octobre-2026`** :

```bash
git switch -c nouvelle-soiree soiree-du-10-octobre-2026
```

C'est le meilleur point de départ pour une nouvelle soirée : on change les films, les décors et la palette,
et toute la mécanique de vote fonctionne déjà.

## Le concept

- Une TV affiche un site plein écran ; chaque invité vote sur son téléphone (QR code sur la TV).
- Mécanique de poker planning (« Scrum Master ») : la TV pilote, les votes restent secrets jusqu'à la révélation.
- Un film = une section verticale ; chaque film a 4 onglets horizontaux : Résumé → Presse → Trailer → Vote.
- L'onglet Vote reste verrouillé tant que tout le monde n'a pas voté ; en l'ouvrant, compte à rebours de 5 s,
  puis les cartes se retournent sur la TV et sur les téléphones. La touche R force l'ouverture.
- 5 cartes, de la meilleure à la pire : OHHHHH OUI ! (5), Cool ! (4), Ok (3), Bof (2), Hors de question (1).
- Classement final : moyenne, puis nombre de « OHHHHH OUI ! », puis film le plus court.
  Veto : 3 « Hors de question » ou plus éliminent le film.
- Une page teaser (`/teaser`) à partager avant la soirée, avec compte à rebours et aperçu Open Graph.

## La pile technique (gratuite)

- **Angular 22** : zoneless, composants standalone, OnPush, signals, Signal Forms, `resource()`, lazy routes.
- **Supabase** (offre gratuite) : Postgres + Realtime (`postgres_changes`) + authentification anonyme.
  Schéma et règles RLS : `supabase/migrations/001_schema_de_vote.sql` (dans l'étiquette ci-dessus).
  Remise à zéro avant la soirée : `truncate public.voting_session cascade;`
- **GitHub Pages**, déployé par `.github/workflows/deploy-github-pages.yml` à chaque push sur `main`.
- **Vitest** pour les tests, Husky + lint-staged + commitlint (en-têtes de commit ≤ 72 caractères, types
  `feat|fix|chore|style|refactor|test|docs`).

## Architecture qui a fait ses preuves

- `TvNavigationStore` : seule source de vérité de la position (section, onglet). Pas de scroll natif sur la TV :
  les pistes sont translatées en CSS. Tout passe par `TvNavigator`, qui joue la transition.
- Transitions : coulure de sang entre les films (0,8 s), nuée de chauves-souris entre les onglets (0,65 s),
  un verrou commun (`PixelDripTransitionService`). Le téléphone change d'écran DERRIÈRE la coulure :
  tout ce qu'il affiche doit être lu sur le film *affiché*, pas sur le film en cours côté TV.
- Décors : `<canvas>` 128 × 96 avec `PixelPainter` (hasard à graine fixe), sur 4 calques :
  décor fixe, lumières (vacillent en CSS), calque animé image par image (~12 i/s, seulement quand le décor
  est visible, `IntersectionObserver`), apparition en fondu (cycle CSS lancé à l'arrivée sur le décor).
  **Sur la TV, le panneau ne montre que le centre d'un décor (x ≈ 24 à 104)** ; le coin bas droit est caché
  par l'encart des votes. Tout ce qui compte doit tenir dans cette zone.
- Logique pure séparée de l'affichage et testée : classement, résumé de vote, déclencheurs de sons,
  nuée de chauves-souris, serpent promeneur…
- Sons : synthèse Web Audio 8 bits (`SpookySynth`), aucun fichier audio, TV uniquement, touche M pour couper.
  Les navigateurs bloquent le son jusqu'à la première touche : prévoir un bandeau « son endormi ».

## Les pièges rencontrés, et leurs solutions

- **Le téléphone rejoint la mauvaise session** : mettre `?sessionId=` dans l'URL du QR code.
- **Un vote tout juste envoyé disparaît** : ne recharger les votes que quand la liste des films révélés change.
- **Client Supabase typé en `never`** : les lignes du type `Database` doivent être des `type`, pas des `interface`.
- **Aperçu Messenger vide** : Messenger génère l'aperçu sur le téléphone et ne suit pas la redirection 301 que
  GitHub Pages fait sur les dossiers. Copier `index.html` en `teaser.html` (servi en 200 à `/teaser`),
  partager **sans barre oblique finale**, ne pas mettre `og:url`, et ajouter `?v=N` pour vider le cache Facebook.
- **SPA sur GitHub Pages** : copier `index.html` en `404.html` pour que `/vote` fonctionne.
- **Fins de ligne** : `.gitattributes` avec `* text=auto eol=lf`, sinon les scripts d'édition cassent les fichiers.
- **Apparition déjà visible en arrivant** : toutes les sections sont rendues au chargement ; démarrer les cycles
  CSS quand le décor devient visible, pas au chargement de la page.
- **Lumière qui clignote sur un personnage** : tout ce qui est dessiné sur le calque des lumières vacille.
  Un personnage ou un monstre ne doit jamais y être.
- **Le serveur de dev s'arrête parfois entre deux sessions** : le relancer avant de tester.

## La façon de travailler de Corentin

- Valider chaque visuel avec une **maquette** avant de coder (widgets de comparaison avec plusieurs options).
- Il choisit vite et revient souvent sur un choix après l'avoir vu en vrai : garder les changements petits,
  une branche `feat/…` ou `fix/…` par sujet, fusion en avance rapide sur `main`, puis push.
- Style : pixel art sombre façon Stardew Valley / Graveyard Keeper, « Halloween pas kitsch », différent de Netflix.
  Pas d'animation trop visible ni de flash ; préférer les paliers (`steps()`) et le tramage.
- Accessibilité : texte jamais posé sur l'image sans fond, tailles minimum 16 px (texte) et 14 px (étiquettes).
- Conventions de code : voir `CLAUDE.md` (tout typer, nommage métier, templates séparés, pas de `ngOnInit`…).

## Checklist pour une nouvelle soirée

1. Choisir le thème, puis 10 films : résumé, réalisateurs, durée, niveaux (peur / gore ou équivalent),
   avertissements de contenu, note IMDb, résumé critique écrit soi-même.
2. Bandes-annonces : vérifier chaque ID YouTube via l'API oEmbed (intégrable, bonne langue, chaîne fiable).
3. Streaming : relever abonnement + location sur JustWatch France, avec la date du relevé.
4. Un décor pixel art par film, maquetté avant d'être codé, centré dans la zone visible de la TV.
5. Adapter la palette (`src/styles.css`), les libellés des cartes et la page teaser (date, heure, image Open Graph :
   `npm run generer:image-partage`, favicon : `npm run generer:favicon`).
6. Supabase : nouveau projet (ou réveiller l'ancien), appliquer la migration, coller l'URL et la clé publique
   dans `src/environments/environment.ts`.
7. La veille : test complet TV + 2 téléphones. Le jour J : vérifier que Supabase n'est pas en pause,
   lancer la remise à zéro, ouvrir la TV et appuyer sur une touche pour réveiller le son.

## Les décisions qui ont été testées puis abandonnées

- Format en deux tours (présélection puis finale) : refusé, on garde les 10 films et on choisit en direct
  de montrer ou non chaque bande-annonce.
- Salle d'attente avec un Snake jouable : retirée, « ça n'apporte rien ».
- Annonces de vote furtives, ou progression intégrée au panneau : on est revenu à l'encart en bas à droite,
  affiché seulement après le premier vote.
- Podium en pierres tombales : remplacé par l'illustration du film élu et un « 1 » gothique en lettrine.
