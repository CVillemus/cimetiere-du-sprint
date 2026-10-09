import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Page projetée sur la TV : la onepage avec le QR code, les 10 films et la Sprint Review.
 * Étape 1 : simple écran d'accueil pour valider le déploiement.
 */
@Component({
  selector: 'app-tv-page',
  templateUrl: './tv-page.html',
  styleUrl: './tv-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvPage {}
