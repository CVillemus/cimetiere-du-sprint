import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { buildCountdown, Countdown, padCountdownUnit } from '../../core/party/countdown';
import { PARTY_DATE_LABEL, PARTY_STARTS_AT } from '../../core/party/party-schedule';
import { PixelBackdrop } from '../../shared/components/pixel-backdrop/pixel-backdrop';
import { PixelPainter } from '../../shared/pixel-art/pixel-painter';
import {
  paintTeaserGraveyard,
  TEASER_GRAVEYARD_HEIGHT,
  TEASER_GRAVEYARD_WIDTH,
} from './teaser-graveyard.scene';

interface CountdownUnit {
  readonly label: string;
  readonly value: string;
}

const ONE_SECOND_IN_MILLISECONDS: number = 1000;

/**
 * Page teaser à partager avant la soirée : un seul écran, un cimetière pixel,
 * la date et un compte à rebours jusqu'à samedi 18h.
 */
@Component({
  selector: 'app-teaser-page',
  imports: [PixelBackdrop],
  templateUrl: './teaser-page.html',
  styleUrl: './teaser-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeaserPage {
  protected readonly partyDateLabel: string = PARTY_DATE_LABEL;
  protected readonly graveyardWidth: number = TEASER_GRAVEYARD_WIDTH;
  protected readonly graveyardHeight: number = TEASER_GRAVEYARD_HEIGHT;

  private readonly nowState: WritableSignal<Date> = signal(new Date());

  protected readonly countdown: Signal<Countdown> = computed((): Countdown =>
    buildCountdown(this.nowState(), PARTY_STARTS_AT),
  );

  protected readonly countdownUnits: Signal<readonly CountdownUnit[]> = computed(
    (): readonly CountdownUnit[] => {
      const countdown: Countdown = this.countdown();
      return [
        { label: 'jours', value: padCountdownUnit(countdown.days) },
        { label: 'heures', value: padCountdownUnit(countdown.hours) },
        { label: 'min', value: padCountdownUnit(countdown.minutes) },
        { label: 'sec', value: padCountdownUnit(countdown.seconds) },
      ];
    },
  );

  private readonly graveyardCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('graveyardCanvas');
  private readonly graveyardLightCanvas: Signal<ElementRef<HTMLCanvasElement>> =
    viewChild.required<ElementRef<HTMLCanvasElement>>('graveyardLightCanvas');

  constructor() {
    const destroyRef: DestroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.paintGraveyard();
      const clockIntervalId: ReturnType<typeof setInterval> = setInterval(
        () => this.nowState.set(new Date()),
        ONE_SECOND_IN_MILLISECONDS,
      );
      destroyRef.onDestroy(() => clearInterval(clockIntervalId));
    });
  }

  private paintGraveyard(): void {
    const scenePainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.graveyardCanvas().nativeElement,
    );
    const lightPainter: PixelPainter | null = PixelPainter.fromCanvas(
      this.graveyardLightCanvas().nativeElement,
    );
    if (scenePainter !== null && lightPainter !== null) {
      paintTeaserGraveyard(scenePainter, lightPainter);
    }
  }
}
