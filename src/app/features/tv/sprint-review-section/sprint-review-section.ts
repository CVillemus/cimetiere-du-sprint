import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Section finale : le podium.
 * Étape 2 : podium vide. Les résultats arriveront avec Supabase (étape 5).
 */
@Component({
  selector: 'app-sprint-review-section',
  templateUrl: './sprint-review-section.html',
  styleUrl: './sprint-review-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintReviewSection {}
