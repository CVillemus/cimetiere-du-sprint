import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import {
  FieldTree,
  form,
  FormField,
  maxLength,
  required,
  submit,
  TreeValidationResult,
} from '@angular/forms/signals';
import { PhoneVotingSessionStore } from '../../../core/voting/phone-voting-session.store';
import { PseudoAlreadyTakenError } from '../../../core/voting/voting.model';

interface PseudoFormModel {
  pseudo: string;
}

const MAXIMUM_PSEUDO_LENGTH: number = 20;

/** Premier écran du téléphone : graver son pseudo (Signal Forms). */
@Component({
  selector: 'app-pseudo-form',
  imports: [FormField],
  templateUrl: './pseudo-form.html',
  styleUrl: './pseudo-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PseudoForm {
  private readonly phoneVotingSessionStore: PhoneVotingSessionStore =
    inject(PhoneVotingSessionStore);

  private readonly pseudoFormModel: WritableSignal<PseudoFormModel> = signal({ pseudo: '' });

  protected readonly pseudoForm: FieldTree<PseudoFormModel> = form(
    this.pseudoFormModel,
    (pseudoFormPath) => {
      required(pseudoFormPath.pseudo, { message: 'Il faut un nom à graver sur ta tombe.' });
      maxLength(pseudoFormPath.pseudo, MAXIMUM_PSEUDO_LENGTH, {
        message: `${MAXIMUM_PSEUDO_LENGTH} caractères maximum.`,
      });
    },
  );

  protected async submitPseudo(submitEvent: Event): Promise<void> {
    submitEvent.preventDefault();
    await submit(this.pseudoForm, (submittedPseudoForm) =>
      this.joinWithPseudo(submittedPseudoForm),
    );
  }

  /** Les erreurs renvoyées ici s'affichent sous le champ, comme les erreurs de validation. */
  private async joinWithPseudo(
    submittedPseudoForm: FieldTree<PseudoFormModel>,
  ): Promise<TreeValidationResult> {
    const pseudo: string = submittedPseudoForm.pseudo().value().trim();
    try {
      await this.phoneVotingSessionStore.joinVotingSession(pseudo);
      return undefined;
    } catch (joinError: unknown) {
      if (joinError instanceof PseudoAlreadyTakenError) {
        return {
          kind: 'pseudoAlreadyTaken',
          fieldTree: submittedPseudoForm.pseudo,
          message: `« ${pseudo} » repose déjà ici. Choisis un autre nom.`,
        };
      }
      console.error(joinError);
      return {
        kind: 'joinFailed',
        fieldTree: submittedPseudoForm.pseudo,
        message: 'Le cimetière ne répond pas. Réessaie dans un instant.',
      };
    }
  }
}
