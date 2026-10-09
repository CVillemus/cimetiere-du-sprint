import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  viewChildren,
} from '@angular/core';
import { VOTE_CARDS, VoteCard } from '../../../core/voting/vote-card.model';
import { VoteScore } from '../../../core/voting/voting.model';
import { PixelIcon } from '../../../shared/components/pixel-icon/pixel-icon';

/** Touche → déplacement dans la liste des cartes (motif « radio group » du W3C). */
const ARROW_KEY_STEPS: Readonly<Record<string, number>> = {
  ArrowDown: 1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowLeft: -1,
};

/**
 * Les 5 cartes du poker planning de l'horreur, en groupe radio accessible :
 * une seule tabulation pour entrer dans le groupe, puis les flèches pour changer de carte.
 */
@Component({
  selector: 'app-vote-card-picker',
  imports: [PixelIcon],
  templateUrl: './vote-card-picker.html',
  styleUrl: './vote-card-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteCardPicker {
  readonly selectedScore: InputSignal<VoteScore | null> = input.required<VoteScore | null>();
  readonly scoreSelected: OutputEmitterRef<VoteScore> = output<VoteScore>();

  /** De la meilleure à la pire : « OHHHHH OUI ! » en haut, sous le pouce. */
  protected readonly voteCards: readonly VoteCard[] = [...VOTE_CARDS].reverse();

  private readonly voteCardButtons: Signal<readonly ElementRef<HTMLButtonElement>[]> =
    viewChildren<ElementRef<HTMLButtonElement>>('voteCardButton');

  /** La carte choisie reçoit la tabulation ; sans choix, la première carte. */
  protected readonly focusableScore: Signal<VoteScore> = computed(
    (): VoteScore => this.selectedScore() ?? this.voteCards[0].score,
  );

  protected selectVoteCard(voteCard: VoteCard): void {
    this.scoreSelected.emit(voteCard.score);
  }

  /** Flèches : on passe à la carte voisine (en boucle) et on la choisit, Début / Fin aux extrémités. */
  protected selectVoteCardWithArrows(keyboardEvent: KeyboardEvent, voteCardIndex: number): void {
    const lastIndex: number = this.voteCards.length - 1;
    let targetIndex: number;
    if (keyboardEvent.key === 'Home') {
      targetIndex = 0;
    } else if (keyboardEvent.key === 'End') {
      targetIndex = lastIndex;
    } else if (keyboardEvent.key in ARROW_KEY_STEPS) {
      targetIndex =
        (voteCardIndex + ARROW_KEY_STEPS[keyboardEvent.key] + this.voteCards.length) %
        this.voteCards.length;
    } else {
      return;
    }
    keyboardEvent.preventDefault();
    this.selectVoteCard(this.voteCards[targetIndex]);
    this.voteCardButtons()[targetIndex]?.nativeElement.focus();
  }
}
