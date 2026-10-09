import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Page ouverte sur les téléphones via le QR code.
 * Étape 1 : simple écran d'attente pour valider la route /vote sur GitHub Pages.
 */
@Component({
  selector: 'app-vote-page',
  templateUrl: './vote-page.html',
  styleUrl: './vote-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotePage {}
