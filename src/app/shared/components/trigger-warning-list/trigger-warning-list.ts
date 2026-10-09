import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

/** Bandeau ⚠ listant les avertissements de contenu d'une slide. */
@Component({
  selector: 'app-trigger-warning-list',
  templateUrl: './trigger-warning-list.html',
  styleUrl: './trigger-warning-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerWarningList {
  readonly triggerWarnings: InputSignal<readonly string[]> = input.required<readonly string[]>();
}
