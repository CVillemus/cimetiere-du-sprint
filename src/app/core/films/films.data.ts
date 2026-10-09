import { Film } from './film.model';

/**
 * Les 10 films en compétition, dans l'ordre de passage sur la TV.
 * Contenu statique : il ne change pas pendant la soirée, il n'a donc rien à faire en base.
 */
export const FILMS: readonly Film[] = [
  {
    id: 'les-autres',
    frenchTitle: 'Les Autres',
    originalTitle: 'The Others',
    releaseYear: 2001,
    directors: ['Alejandro Amenábar'],
    durationInMinutes: 101,
    fearLevel: 3,
    goreLevel: 1,
    summary:
      "1945, île de Jersey. Grace vit seule avec ses deux enfants, malades de la lumière, dans un manoir aux rideaux toujours tirés. L'arrivée de trois domestiques coïncide avec d'étranges présences.",
    triggerWarnings: ['Enfants en danger', 'Deuil', 'Ambiance oppressante'],
    trailer: {
      youtubeVideoId: 'zWxCQs7qQT4',
      language: 'VF',
      triggerWarnings: ['Ambiance oppressante'],
    },
    pressReception: {
      imdbTitleId: 'tt0230600',
      imdbRating: 7.6,
      reviewSummary:
        'Un huis clos gothique tout en suggestion, porté par Nicole Kidman. La critique salue une mise en scène élégante et un final resté culte.',
      containsSpoilers: false,
    },
  },
  {
    id: 'get-out',
    frenchTitle: 'Get Out',
    originalTitle: 'Get Out',
    releaseYear: 2017,
    directors: ['Jordan Peele'],
    durationInMinutes: 104,
    fearLevel: 2,
    goreLevel: 2,
    summary:
      "Chris part passer le week-end chez les parents de sa petite amie. L'accueil est chaleureux, presque trop. Les domestiques ont des sourires figés, et les invités le regardent d'un drôle d'air.",
    triggerWarnings: ['Racisme', 'Hypnose et manipulation', 'Violence (final)'],
    trailer: {
      youtubeVideoId: 'XzmeT5rEPDg',
      language: 'VF',
      triggerWarnings: ['Tension', 'Images de violence brèves'],
    },
    pressReception: {
      imdbTitleId: 'tt5052448',
      imdbRating: 7.8,
      reviewSummary:
        "Thriller satirique devenu une référence, récompensé par l'Oscar du meilleur scénario original. On rit jaune autant qu'on frissonne.",
      containsSpoilers: false,
    },
  },
  {
    id: 'conjuring',
    frenchTitle: 'Conjuring : Les Dossiers Warren',
    originalTitle: 'The Conjuring',
    releaseYear: 2013,
    directors: ['James Wan'],
    durationInMinutes: 112,
    fearLevel: 4,
    goreLevel: 1,
    summary:
      "1971. Les Perron emménagent dans une vieille ferme du Rhode Island. Portes qui claquent, horloges arrêtées : ils appellent à l'aide Ed et Lorraine Warren, enquêteurs du paranormal.",
    triggerWarnings: [
      'Possession',
      'Jump scares',
      'Violence envers des enfants',
      "Mort d'un animal",
    ],
    trailer: { youtubeVideoId: 'VRIgnMz_gBs', language: 'VF', triggerWarnings: ['Jump scares'] },
    pressReception: {
      imdbTitleId: 'tt1457767',
      imdbRating: 7.5,
      reviewSummary:
        "Une maison hantée à l'ancienne, d'une efficacité redoutable. Souvent cité parmi les films d'horreur grand public les plus réussis de sa décennie.",
      containsSpoilers: false,
    },
  },
  {
    id: 'mama',
    frenchTitle: 'Mama',
    originalTitle: 'Mama',
    releaseYear: 2013,
    directors: ['Andrés Muschietti'],
    durationInMinutes: 100,
    fearLevel: 3,
    goreLevel: 1,
    summary:
      'Deux fillettes disparues sont retrouvées après cinq ans seules dans une cabane au fond des bois. Leur oncle les recueille... mais quelque chose les a suivies.',
    triggerWarnings: ['Enfants en danger', 'Violence familiale', 'Jump scares'],
    trailer: {
      youtubeVideoId: 'Z68IqurkFVE',
      language: 'VF',
      triggerWarnings: ['Jump scares', 'Créature'],
    },
    pressReception: {
      imdbTitleId: 'tt2023587',
      imdbRating: 6.2,
      reviewSummary:
        'Une ambiance de conte noir très réussie, produite par Guillermo del Toro. Sa dernière partie divise.',
      containsSpoilers: false,
    },
  },
  {
    id: 'sinister',
    frenchTitle: 'Sinister',
    originalTitle: 'Sinister',
    releaseYear: 2012,
    directors: ['Scott Derrickson'],
    durationInMinutes: 110,
    fearLevel: 5,
    goreLevel: 2,
    summary:
      "Ellison, auteur de faits divers en panne d'inspiration, s'installe avec sa famille dans une maison où un crime a eu lieu. Au grenier, il trouve une boîte de bobines Super 8.",
    triggerWarnings: ['Meurtres filmés (suggérés)', 'Enfants impliqués', 'Jump scares'],
    trailer: {
      youtubeVideoId: 'bXfw4ZFbK5Y',
      language: 'VF',
      triggerWarnings: ['Images dérangeantes', 'Jump scares'],
    },
    pressReception: {
      imdbTitleId: 'tt1922777',
      imdbRating: 6.8,
      reviewSummary:
        "Régulièrement cité comme l'un des films les plus effrayants des années 2010, grâce à ses images d'archives glaçantes et sa bande-son.",
      containsSpoilers: false,
    },
  },
  {
    id: 'heredite',
    frenchTitle: 'Hérédité',
    originalTitle: 'Hereditary',
    releaseYear: 2018,
    directors: ['Ari Aster'],
    durationInMinutes: 127,
    fearLevel: 5,
    goreLevel: 3,
    summary:
      'Après la mort de sa mère, une femme secrète et distante, Annie voit sa famille se fissurer. Des secrets remontent, et le deuil prend une tournure de plus en plus inquiétante.',
    triggerWarnings: ['Deuil', 'Mort accidentelle choquante', 'Automutilation', 'Images choc'],
    trailer: {
      youtubeVideoId: 'AIWvsE_TxNA',
      language: 'VF',
      triggerWarnings: ['Images dérangeantes'],
    },
    pressReception: {
      imdbTitleId: 'tt7784604',
      imdbRating: 7.3,
      reviewSummary:
        'Un premier film acclamé, porté par une Toni Collette impressionnante. Lent, étouffant, et très éprouvant pour les nerfs.',
      containsSpoilers: false,
    },
  },
  {
    id: 'ghostland',
    frenchTitle: 'Ghostland',
    originalTitle: 'Incident in a Ghostland',
    releaseYear: 2018,
    directors: ['Pascal Laugier'],
    durationInMinutes: 91,
    fearLevel: 4,
    goreLevel: 3,
    summary:
      "Une mère et ses deux filles s'installent dans la maison héritée d'une tante. Dès la première nuit, des intrus font irruption. Seize ans plus tard, l'une des sœurs reçoit un appel au secours.",
    triggerWarnings: ['Violence physique brutale', 'Séquestration', "Agression d'adolescentes"],
    trailer: {
      youtubeVideoId: 'RafSudsP_aU',
      language: 'VF',
      triggerWarnings: ['Violence', 'Poupées inquiétantes'],
    },
    pressReception: {
      imdbTitleId: 'tt6195094',
      imdbRating: 6.4,
      reviewSummary:
        'Un film français radical et maîtrisé, qui divise par sa violence. Ses défenseurs saluent une mise en scène virtuose.',
      containsSpoilers: false,
    },
  },
  {
    id: 'l-orphelinat',
    frenchTitle: "L'Orphelinat",
    originalTitle: 'El orfanato',
    releaseYear: 2007,
    directors: ['Juan Antonio Bayona'],
    durationInMinutes: 105,
    fearLevel: 3,
    goreLevel: 1,
    summary:
      "Laura rachète l'orphelinat où elle a grandi pour en faire un foyer. Son fils Simón s'invente de nouveaux amis invisibles... jusqu'au jour où il disparaît.",
    triggerWarnings: ["Disparition d'enfant", 'Deuil', 'Une scène choc (accident)'],
    trailer: { youtubeVideoId: 'uf-Scp6HRXY', language: 'VF', triggerWarnings: ['Jump scares'] },
    pressReception: {
      imdbTitleId: 'tt0464141',
      imdbRating: 7.4,
      reviewSummary:
        'Un conte macabre et bouleversant, produit par Guillermo del Toro. La critique le place parmi les grands films de fantômes espagnols.',
      containsSpoilers: false,
    },
  },
  {
    id: 'late-night-with-the-devil',
    frenchTitle: 'Late Night with the Devil',
    originalTitle: 'Late Night with the Devil',
    releaseYear: 2023,
    directors: ['Cameron Cairnes', 'Colin Cairnes'],
    durationInMinutes: 93,
    fearLevel: 3,
    goreLevel: 2,
    summary:
      "Nuit d'Halloween 1977. Jack Delroy, animateur de talk-show en chute d'audience, mise tout sur une émission spéciale occulte en direct. Rien ne va se passer comme prévu.",
    triggerWarnings: ['Possession', 'Deuil', 'Gore ponctuel (final)'],
    trailer: {
      youtubeVideoId: 'ElGDnV4pkEc',
      language: 'VOST',
      triggerWarnings: ['Images de possession'],
    },
    pressReception: {
      imdbTitleId: 'tt14966898',
      imdbRating: 7.0,
      reviewSummary:
        'Un found footage façon émission TV des années 70, très bien reçu. On salue surtout son format original et la performance de David Dastmalchian.',
      containsSpoilers: false,
    },
  },
  {
    id: 'his-house',
    frenchTitle: 'His House',
    originalTitle: 'His House',
    releaseYear: 2020,
    directors: ['Remi Weekes'],
    durationInMinutes: 93,
    fearLevel: 3,
    goreLevel: 1,
    summary:
      'Bol et Rial ont fui la guerre au Soudan du Sud. En Angleterre, on leur attribue enfin une maison. Mais quelque chose a fait le voyage avec eux, et cette chose vit dans les murs.',
    triggerWarnings: ["Mort d'enfant", 'Traumatisme de guerre', 'Racisme'],
    trailer: { youtubeVideoId: '9Bfl1mKdpKg', language: 'VF', triggerWarnings: ['Jump scares'] },
    pressReception: {
      imdbTitleId: 'tt8508734',
      imdbRating: 6.4,
      reviewSummary:
        "Un premier film unanimement salué par la critique, qui mêle maison hantée et drame de l'exil avec une grande finesse.",
      containsSpoilers: false,
    },
  },
];
