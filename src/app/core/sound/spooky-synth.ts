/**
 * Synthétiseur 8-bit « crypte » : tous les sons de la soirée sont fabriqués à la volée
 * avec la Web Audio API (aucun fichier audio, aucun droit d'auteur).
 *
 * Chaque son passe par un bus qui alimente à la fois la sortie directe
 * et une réverbération sombre d'environ 3,5 s (l'« écho de crypte »).
 */

interface ToneSettings {
  readonly waveform?: OscillatorType;
  readonly frequency: number;
  /** Fréquence d'arrivée, atteinte en glissant pendant toute la durée. */
  readonly endFrequency?: number;
  readonly startDelayInSeconds?: number;
  readonly durationInSeconds: number;
  readonly volume: number;
  readonly attackInSeconds?: number;
  readonly lowpassFrequency?: number;
  /** Vibrato : vitesse (Hz) et amplitude (Hz) du tremblement de la note. */
  readonly vibratoRate?: number;
  readonly vibratoDepth?: number;
  /** Désaccordage en cents : une note légèrement fausse sonne plus inquiétante. */
  readonly detuneInCents?: number;
}

interface NoiseSettings {
  readonly startDelayInSeconds?: number;
  readonly durationInSeconds: number;
  readonly volume: number;
  readonly filterType?: BiquadFilterType;
  readonly filterFrequency: number;
  readonly endFilterFrequency?: number;
  readonly filterQuality?: number;
  readonly attackInSeconds?: number;
  /** Fait onduler le filtre, comme une rafale de vent qui siffle. */
  readonly wobbleRate?: number;
}

/** Rapport de fréquence, volume, durée : les partiels inharmoniques d'une cloche d'église. */
const CHURCH_BELL_PARTIALS: readonly (readonly [
  frequencyRatio: number,
  volume: number,
  durationInSeconds: number,
])[] = [
  [0.5, 0.2, 4],
  [1, 0.22, 3.4],
  [1.19, 0.13, 2.6],
  [1.5, 0.07, 2],
  [2, 0.09, 1.8],
  [2.52, 0.05, 1.2],
  [3, 0.04, 1],
];

/** Notes d'une vieille boîte à musique, chacune un peu fausse (fréquence, désaccordage). */
const MUSIC_BOX_NOTES: readonly (readonly [frequency: number, detuneInCents: number])[] = [
  [659.25, -35],
  [698.46, -10],
  [493.88, -25],
  [466.16, -40],
];

/** Accord diminué grave (La, Si bémol, Mi bémol) : le coup de théâtre de la révélation. */
const REVEAL_CHORD_FREQUENCIES: readonly number[] = [110, 116.54, 155.56];

/** Orgue de la crypte : La mineur → Fa majeur → Mi majeur. */
const CRYPT_ORGAN_CHORDS: readonly (readonly number[])[] = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [164.81, 207.65, 246.94],
];
const CRYPT_ORGAN_CHORD_SPACING_IN_SECONDS: number = 0.85;

const SILENT_GAIN: number = 0.0001;
const REVERB_DURATION_IN_SECONDS: number = 3.5;
const REVERB_DECAY_CURVE: number = 2.6;
const REVERB_LOWPASS_FREQUENCY: number = 2200;
const REVERB_LEVEL: number = 0.77;

export class SpookySynth {
  private readonly soundBus: GainNode;

  constructor(
    private readonly audioContext: AudioContext,
    destination: AudioNode,
  ) {
    this.soundBus = audioContext.createGain();
    this.soundBus.connect(destination);

    const reverbDarkener: BiquadFilterNode = audioContext.createBiquadFilter();
    reverbDarkener.type = 'lowpass';
    reverbDarkener.frequency.value = REVERB_LOWPASS_FREQUENCY;
    const cryptReverb: ConvolverNode = audioContext.createConvolver();
    cryptReverb.buffer = this.createCryptImpulseResponse();
    const reverbLevel: GainNode = audioContext.createGain();
    reverbLevel.gain.value = REVERB_LEVEL;
    this.soundBus.connect(reverbDarkener);
    reverbDarkener.connect(cryptReverb);
    cryptReverb.connect(reverbLevel);
    reverbLevel.connect(destination);
  }

  /** Changement de section : une rafale qui siffle sur un bourdon grave en triton. */
  playCryptWind(): void {
    this.playNoise({
      durationInSeconds: 1.1,
      volume: 0.22,
      filterType: 'bandpass',
      filterFrequency: 520,
      endFilterFrequency: 240,
      filterQuality: 5,
      attackInSeconds: 0.25,
      wobbleRate: 3.3,
    });
    this.playTone({
      waveform: 'triangle',
      frequency: 73.4,
      durationInSeconds: 1.1,
      volume: 0.16,
      attackInSeconds: 0.2,
      vibratoRate: 5,
      vibratoDepth: 1.5,
    });
    this.playTone({
      waveform: 'triangle',
      frequency: 103.8,
      durationInSeconds: 1.1,
      volume: 0.09,
      attackInSeconds: 0.2,
    });
  }

  /** Quelqu'un vote : deux coups sourds sur un cercueil, hauteur légèrement aléatoire. */
  playCoffinKnock(): void {
    const pitchVariation: number = 0.95 + Math.random() * 0.1;
    [
      { startDelayInSeconds: 0, frequency: 175 },
      { startDelayInSeconds: 0.16, frequency: 150 },
    ].forEach(
      ({ startDelayInSeconds, frequency }: { startDelayInSeconds: number; frequency: number }) => {
        this.playNoise({
          startDelayInSeconds,
          durationInSeconds: 0.05,
          volume: 0.1,
          filterFrequency: 700,
        });
        this.playTone({
          waveform: 'triangle',
          frequency: frequency * pitchVariation,
          endFrequency: 70 * pitchVariation,
          startDelayInSeconds,
          durationInSeconds: 0.18,
          volume: 0.5,
          attackInSeconds: 0.002,
        });
      },
    );
  }

  /** Dernier vote reçu : le glas, suivi d'un souffle qui ressemble à un murmure. */
  playFuneralBell(): void {
    this.playChurchBell(98);
    this.playNoise({
      startDelayInSeconds: 0.6,
      durationInSeconds: 2.2,
      volume: 0.05,
      filterType: 'bandpass',
      filterFrequency: 1800,
      filterQuality: 9,
      attackInSeconds: 0.6,
      wobbleRate: 0.7,
    });
  }

  /** Quelqu'un rejoint le salon : quatre notes faussées d'une boîte à musique hantée. */
  playHauntedMusicBox(): void {
    MUSIC_BOX_NOTES.forEach(
      ([frequency, detuneInCents]: readonly [number, number], noteIndex: number) => {
        const startDelayInSeconds: number = noteIndex * 0.22;
        this.playTone({
          waveform: 'sine',
          frequency,
          startDelayInSeconds,
          durationInSeconds: 0.9,
          volume: 0.12,
          attackInSeconds: 0.003,
          detuneInCents,
          vibratoRate: 6,
          vibratoDepth: 4,
        });
        // Harmonique aiguë très courte : le « ting » métallique de la lamelle.
        this.playTone({
          waveform: 'sine',
          frequency: frequency * 3,
          startDelayInSeconds,
          durationInSeconds: 0.25,
          volume: 0.025,
          attackInSeconds: 0.002,
          detuneInCents,
        });
      },
    );
  }

  /** Les cartes se retournent : impact sourd, accord dissonant qui se désaccorde, porte qui grince. */
  playDramaticReveal(): void {
    this.playTone({
      waveform: 'sine',
      frequency: 120,
      endFrequency: 32,
      durationInSeconds: 0.6,
      volume: 0.8,
      attackInSeconds: 0.003,
    });
    this.playNoise({
      durationInSeconds: 0.4,
      volume: 0.3,
      filterFrequency: 400,
      endFilterFrequency: 90,
    });
    REVEAL_CHORD_FREQUENCIES.forEach((frequency: number) => {
      this.playTone({
        waveform: 'sawtooth',
        frequency,
        endFrequency: frequency * 0.94,
        startDelayInSeconds: 0.03,
        durationInSeconds: 2.6,
        volume: 0.06,
        attackInSeconds: 0.01,
        lowpassFrequency: 1000,
        vibratoRate: 4.5,
        vibratoDepth: 1.2,
      });
      this.playTone({
        frequency: frequency * 2,
        endFrequency: frequency * 1.88,
        startDelayInSeconds: 0.03,
        durationInSeconds: 2.2,
        volume: 0.03,
        lowpassFrequency: 1400,
      });
    });
    this.playCreakingDoor(0.5, 1.4, 0.25);
  }

  /**
   * Le film de la soirée est élu : orgue d'église hanté, puis le glas.
   * Le glas tombe 2,2 s après le début (+ le délai demandé).
   */
  playCryptOrgan(startDelayInSeconds: number = 0): void {
    CRYPT_ORGAN_CHORDS.forEach((chordFrequencies: readonly number[], chordIndex: number) => {
      const chordStart: number =
        startDelayInSeconds + chordIndex * CRYPT_ORGAN_CHORD_SPACING_IN_SECONDS;
      const isLastChord: boolean = chordIndex === CRYPT_ORGAN_CHORDS.length - 1;
      const chordDuration: number = isLastChord ? 3 : 1;
      chordFrequencies.forEach((frequency: number) => {
        this.playTone({
          waveform: 'sawtooth',
          frequency,
          startDelayInSeconds: chordStart,
          durationInSeconds: chordDuration,
          volume: 0.045,
          attackInSeconds: 0.06,
          lowpassFrequency: 1600,
          vibratoRate: 5.5,
          vibratoDepth: 1.4,
        });
        this.playTone({
          frequency: frequency / 2,
          startDelayInSeconds: chordStart,
          durationInSeconds: chordDuration,
          volume: 0.035,
          attackInSeconds: 0.06,
          lowpassFrequency: 900,
        });
      });
    });
    this.playTone({
      waveform: 'triangle',
      frequency: 82.41,
      startDelayInSeconds: startDelayInSeconds + 1.7,
      durationInSeconds: 3.2,
      volume: 0.25,
      attackInSeconds: 0.1,
    });
    this.playChurchBell(82.41, startDelayInSeconds + 2.2, 0.9);
  }

  private playChurchBell(
    fundamentalFrequency: number,
    startDelayInSeconds: number = 0,
    volumeFactor: number = 1,
  ): void {
    CHURCH_BELL_PARTIALS.forEach(
      ([frequencyRatio, volume, durationInSeconds]: readonly [number, number, number]) =>
        this.playTone({
          waveform: 'sine',
          frequency: fundamentalFrequency * frequencyRatio,
          startDelayInSeconds,
          durationInSeconds,
          volume: volume * volumeFactor,
          attackInSeconds: 0.004,
          // Partiels un peu désaccordés : la cloche « bat », comme une vieille cloche fêlée.
          detuneInCents: (Math.random() - 0.5) * 14,
        }),
    );
  }

  /** Une dent de scie très grave qui accélère puis ralentit : le grincement d'un gond. */
  private playCreakingDoor(
    startDelayInSeconds: number,
    durationInSeconds: number,
    volume: number,
  ): void {
    const startTime: number = this.audioContext.currentTime + startDelayInSeconds;
    const hinge: OscillatorNode = this.audioContext.createOscillator();
    hinge.type = 'sawtooth';
    hinge.frequency.setValueAtTime(38, startTime);
    hinge.frequency.linearRampToValueAtTime(64, startTime + durationInSeconds * 0.4);
    hinge.frequency.linearRampToValueAtTime(30, startTime + durationInSeconds);
    const woodResonance: BiquadFilterNode = this.audioContext.createBiquadFilter();
    woodResonance.type = 'bandpass';
    woodResonance.frequency.value = 1100;
    woodResonance.Q.value = 4;
    const envelope: GainNode = this.createEnvelope(startTime, volume, 0.08, durationInSeconds);
    hinge.connect(woodResonance);
    woodResonance.connect(envelope);
    hinge.start(startTime);
    hinge.stop(startTime + durationInSeconds + 0.05);
  }

  private playTone(toneSettings: ToneSettings): void {
    const startTime: number =
      this.audioContext.currentTime + (toneSettings.startDelayInSeconds ?? 0);
    const stopTime: number = startTime + toneSettings.durationInSeconds + 0.05;
    const oscillator: OscillatorNode = this.audioContext.createOscillator();
    oscillator.type = toneSettings.waveform ?? 'square';
    oscillator.detune.value = toneSettings.detuneInCents ?? 0;
    oscillator.frequency.setValueAtTime(toneSettings.frequency, startTime);
    if (toneSettings.endFrequency !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(
        toneSettings.endFrequency,
        startTime + toneSettings.durationInSeconds,
      );
    }

    if (toneSettings.vibratoRate !== undefined && toneSettings.vibratoDepth !== undefined) {
      const vibrato: OscillatorNode = this.audioContext.createOscillator();
      const vibratoDepth: GainNode = this.audioContext.createGain();
      vibrato.frequency.value = toneSettings.vibratoRate;
      vibratoDepth.gain.value = toneSettings.vibratoDepth;
      vibrato.connect(vibratoDepth);
      vibratoDepth.connect(oscillator.frequency);
      vibrato.start(startTime);
      vibrato.stop(stopTime);
    }

    const envelope: GainNode = this.createEnvelope(
      startTime,
      toneSettings.volume,
      toneSettings.attackInSeconds ?? 0.005,
      toneSettings.durationInSeconds,
    );
    if (toneSettings.lowpassFrequency !== undefined) {
      const lowpass: BiquadFilterNode = this.audioContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = toneSettings.lowpassFrequency;
      oscillator.connect(lowpass);
      lowpass.connect(envelope);
    } else {
      oscillator.connect(envelope);
    }
    oscillator.start(startTime);
    oscillator.stop(stopTime);
  }

  private playNoise(noiseSettings: NoiseSettings): void {
    const startTime: number =
      this.audioContext.currentTime + (noiseSettings.startDelayInSeconds ?? 0);
    const sampleCount: number = Math.ceil(
      this.audioContext.sampleRate * noiseSettings.durationInSeconds,
    );
    const noiseBuffer: AudioBuffer = this.audioContext.createBuffer(
      1,
      sampleCount,
      this.audioContext.sampleRate,
    );
    const samples: Float32Array = noiseBuffer.getChannelData(0);
    for (let sampleIndex: number = 0; sampleIndex < sampleCount; sampleIndex++) {
      samples[sampleIndex] = Math.random() * 2 - 1;
    }
    const noiseSource: AudioBufferSourceNode = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter: BiquadFilterNode = this.audioContext.createBiquadFilter();
    filter.type = noiseSettings.filterType ?? 'lowpass';
    filter.Q.value = noiseSettings.filterQuality ?? 1;
    filter.frequency.setValueAtTime(noiseSettings.filterFrequency, startTime);
    if (noiseSettings.endFilterFrequency !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(
        noiseSettings.endFilterFrequency,
        startTime + noiseSettings.durationInSeconds,
      );
    }
    if (noiseSettings.wobbleRate !== undefined) {
      const wobble: OscillatorNode = this.audioContext.createOscillator();
      const wobbleDepth: GainNode = this.audioContext.createGain();
      wobble.frequency.value = noiseSettings.wobbleRate;
      wobbleDepth.gain.value = noiseSettings.filterFrequency * 0.35;
      wobble.connect(wobbleDepth);
      wobbleDepth.connect(filter.frequency);
      wobble.start(startTime);
      wobble.stop(startTime + noiseSettings.durationInSeconds);
    }

    const envelope: GainNode = this.createEnvelope(
      startTime,
      noiseSettings.volume,
      noiseSettings.attackInSeconds ?? 0.01,
      noiseSettings.durationInSeconds,
    );
    noiseSource.connect(filter);
    filter.connect(envelope);
    noiseSource.start(startTime);
  }

  /** Attaque rapide puis extinction exponentielle, branchée sur le bus de la crypte. */
  private createEnvelope(
    startTime: number,
    volume: number,
    attackInSeconds: number,
    durationInSeconds: number,
  ): GainNode {
    const envelope: GainNode = this.audioContext.createGain();
    envelope.gain.setValueAtTime(SILENT_GAIN, startTime);
    envelope.gain.exponentialRampToValueAtTime(volume, startTime + attackInSeconds);
    envelope.gain.exponentialRampToValueAtTime(SILENT_GAIN, startTime + durationInSeconds);
    envelope.connect(this.soundBus);
    return envelope;
  }

  /** Réponse impulsionnelle synthétique : un bruit qui s'éteint lentement, comme une salle voûtée. */
  private createCryptImpulseResponse(): AudioBuffer {
    const sampleCount: number = Math.ceil(
      this.audioContext.sampleRate * REVERB_DURATION_IN_SECONDS,
    );
    const impulseResponse: AudioBuffer = this.audioContext.createBuffer(
      2,
      sampleCount,
      this.audioContext.sampleRate,
    );
    for (let channelIndex: number = 0; channelIndex < 2; channelIndex++) {
      const samples: Float32Array = impulseResponse.getChannelData(channelIndex);
      for (let sampleIndex: number = 0; sampleIndex < sampleCount; sampleIndex++) {
        const remainingRatio: number = 1 - sampleIndex / sampleCount;
        samples[sampleIndex] =
          (Math.random() * 2 - 1) * Math.pow(remainingRatio, REVERB_DECAY_CURVE);
      }
    }
    return impulseResponse;
  }
}
