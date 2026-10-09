import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Film, STREAMING_CHECKED_ON } from '../../../../core/films/film.model';
import { TriggerWarningList } from '../../../../shared/components/trigger-warning-list/trigger-warning-list';

const WARNING_SCREEN_DURATION_IN_SECONDS: number = 3;
const ONE_SECOND_IN_MILLISECONDS: number = 1000;

/**
 * Slide Trailer : un écran d'avertissement de 3 s, puis le lecteur YouTube.
 * Le lecteur n'existe dans le DOM que si la slide est active : pas 10 iframes chargées en même temps,
 * et le son se coupe tout seul quand on change de slide.
 */
@Component({
  selector: 'app-trailer-slide',
  imports: [TriggerWarningList],
  templateUrl: './trailer-slide.html',
  styleUrl: './trailer-slide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrailerSlide {
  private readonly domSanitizer: DomSanitizer = inject(DomSanitizer);

  readonly film: InputSignal<Film> = input.required<Film>();
  readonly isActive: InputSignal<boolean> = input.required<boolean>();

  private readonly warningSecondsLeftState: WritableSignal<number> = signal(
    WARNING_SCREEN_DURATION_IN_SECONDS,
  );
  protected readonly warningSecondsLeft: Signal<number> = this.warningSecondsLeftState.asReadonly();

  protected readonly streamingCheckedOn: string = STREAMING_CHECKED_ON;
  protected readonly isWarningScreenVisible: Signal<boolean> = computed(
    (): boolean => this.warningSecondsLeftState() > 0,
  );

  /** URL d'embed marquée comme sûre : on la construit nous-mêmes à partir d'un identifiant connu. */
  protected readonly trailerEmbedUrl: Signal<SafeResourceUrl | null> = computed(
    (): SafeResourceUrl | null => {
      const youtubeVideoId: string | null = this.film().trailer.youtubeVideoId;
      if (youtubeVideoId === null) {
        return null;
      }
      return this.domSanitizer.bypassSecurityTrustResourceUrl(
        // Avec le son : la touche ou le clic de navigation compte comme une action de
        // l'utilisateur, et `allow="autoplay"` transmet ce droit à l'iframe YouTube.
        `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=0&rel=0`,
      );
    },
  );

  constructor() {
    effect((onCleanup: (cleanupFunction: () => void) => void) => {
      if (!this.isActive()) {
        return;
      }
      this.warningSecondsLeftState.set(WARNING_SCREEN_DURATION_IN_SECONDS);
      const countdownIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
        this.warningSecondsLeftState.update((secondsLeft: number): number =>
          Math.max(secondsLeft - 1, 0),
        );
      }, ONE_SECOND_IN_MILLISECONDS);
      onCleanup(() => clearInterval(countdownIntervalId));
    });
  }
}
