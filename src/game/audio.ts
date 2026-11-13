// Procedural Web Audio API synthesizer for cozy farming ambience & crisp SFX

class CozyAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private muted = false;
  private musicTimer: number | null = null;
  private stepIndex = 0;
  private isPlayingState = false;

  // Cozy C major pentatonic notes (Hz)
  private readonly melodyNotes = [
    523.25, // C5
    659.25, // E5
    587.33, // D5
    783.99, // G5
    659.25, // E5
    440.0,  // A4
    523.25, // C5
    392.0,  // G4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    523.25, // C5
  ];

  private readonly bassNotes = [130.81, 130.81, 174.61, 196.0]; // C3, C3, F3, G3

  public init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.7;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.22;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.masterGain);
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.7, this.ctx.currentTime, 0.04);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public startAmbientMusic(): void {
    this.isPlayingState = true;
    this.init();
    if (this.musicTimer !== null) return;

    this.musicTimer = window.setInterval(() => {
      if (!this.isPlayingState || this.muted || !this.ctx || !this.musicGain) return;
      if (this.ctx.state !== 'running') return;

      const now = this.ctx.currentTime;
      const noteFreq = this.melodyNotes[this.stepIndex % this.melodyNotes.length];

      // Gentle kalimba/music-box pluck on melody
      if (this.stepIndex % 2 === 0 || this.stepIndex % 5 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.8);
      }

      // Warm bass pad every 4 steps
      if (this.stepIndex % 4 === 0) {
        const bassFreq = this.bassNotes[Math.floor(this.stepIndex / 4) % this.bassNotes.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bassFreq, now);
        bGain.gain.setValueAtTime(0.001, now);
        bGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        bOsc.connect(bGain);
        bGain.connect(this.musicGain);
        bOsc.start(now);
        bOsc.stop(now + 1.55);
      }

      this.stepIndex += 1;
    }, 540);
  }

  public pauseAmbientMusic(): void {
    this.isPlayingState = false;
  }

  public stopAmbientMusic(): void {
    this.isPlayingState = false;
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public playSfx(
    kind:
      | 'till'
      | 'plant'
      | 'water'
      | 'refill'
      | 'harvest'
      | 'clear'
      | 'place'
      | 'coin'
      | 'click'
      | 'hurt'
      | 'defend'
      | 'morning'
      | 'error'
  ): void {
    this.init();
    if (this.muted || !this.ctx || !this.sfxGain) return;
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    const pitchJitter = 0.94 + Math.random() * 0.12;

    if (kind === 'click') {
      this.tone(440 * pitchJitter, 560, 0.055, 'triangle', 0.12, now);
      return;
    }
    if (kind === 'error') {
      this.tone(210, 165, 0.11, 'sine', 0.14, now);
      return;
    }
    if (kind === 'till') {
      this.tone(160 * pitchJitter, 85, 0.11, 'triangle', 0.28, now);
      this.noiseBurst(0.08, 700, 0.14, now);
      return;
    }
    if (kind === 'plant') {
      this.tone(320 * pitchJitter, 480, 0.08, 'sine', 0.18, now);
      return;
    }
    if (kind === 'water' || kind === 'refill') {
      this.noiseBurst(0.16, 1500, 0.16, now);
      this.tone(520 * pitchJitter, 760, 0.11, 'sine', 0.14, now + 0.03);
      return;
    }
    if (kind === 'harvest') {
      this.tone(523.25, 659.25, 0.12, 'triangle', 0.22, now);
      this.tone(783.99, 1046.5, 0.18, 'sine', 0.2, now + 0.07);
      return;
    }
    if (kind === 'clear') {
      this.tone(220 * pitchJitter, 110, 0.1, 'square', 0.12, now);
      this.noiseBurst(0.06, 900, 0.12, now);
      return;
    }
    if (kind === 'place') {
      this.tone(240 * pitchJitter, 140, 0.1, 'triangle', 0.24, now);
      return;
    }
    if (kind === 'coin') {
      this.tone(987.77, 987.77, 0.07, 'sine', 0.18, now);
      this.tone(1318.51, 1318.51, 0.18, 'sine', 0.2, now + 0.06);
      return;
    }
    if (kind === 'defend') {
      this.tone(290 * pitchJitter, 160, 0.12, 'sawtooth', 0.14, now);
      return;
    }
    if (kind === 'hurt') {
      this.tone(160, 75, 0.22, 'sawtooth', 0.22, now);
      return;
    }
    if (kind === 'morning') {
      this.tone(392.0, 392.0, 0.15, 'triangle', 0.18, now);
      this.tone(493.88, 493.88, 0.15, 'triangle', 0.18, now + 0.11);
      this.tone(587.33, 587.33, 0.15, 'triangle', 0.18, now + 0.22);
      this.tone(783.99, 783.99, 0.32, 'sine', 0.22, now + 0.33);
    }
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    startTime: number
  ): void {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), startTime + duration);
    }
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private noiseBurst(duration: number, cutoffHz: number, volume: number, startTime: number): void {
    if (!this.ctx || !this.sfxGain) return;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoffHz;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(startTime);
    src.stop(startTime + duration + 0.02);
  }
}

export const audioEngine = new CozyAudioEngine();
