/**
 * Sound Service — Web Audio API synthesizer for casino-themed poker sounds.
 *
 * All sounds are generated programmatically (no external files).
 * AudioContext is lazy-initialized on the first user gesture to comply
 * with browser autoplay policies.
 *
 * Mute state is persisted in localStorage under `bf-sound-muted`.
 */

const STORAGE_KEY = 'bf-sound-muted';

class SoundService {
  private ctx: AudioContext | null = null;
  private _muted: boolean;
  private _prefersReducedMotion = false;

  constructor() {
    // Default: unmuted, unless the user previously chose muted
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      this._muted = stored === 'true';
      this._prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      // If reduced motion is preferred and no explicit preference was saved, default to muted
      if (stored === null && this._prefersReducedMotion) {
        this._muted = true;
      }
    } else {
      this._muted = true;
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(this._muted));
    }
    return this._muted;
  }

  setMuted(value: boolean): void {
    this._muted = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  }

  /** Ensure AudioContext is ready. Must be called after a user gesture. */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private shouldPlay(): boolean {
    return !this._muted;
  }

  // ── Helpers ──────────────────────────────────────────────────

  private createGain(ctx: AudioContext, volume: number): GainNode {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    return gain;
  }

  private createNoiseBurst(
    ctx: AudioContext,
    duration: number,
    frequency: number,
    q: number,
    volume: number
  ): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, ctx.currentTime);
    filter.Q.setValueAtTime(q, ctx.currentTime);

    const gain = this.createGain(ctx, volume);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + duration);
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine',
    startTime?: number
  ): void {
    const start = startTime ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  // ── Public Sound Methods ─────────────────────────────────────

  /** Poker chip click — short noise burst, subtle and satisfying */
  playVote(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.createNoiseBurst(ctx, 0.08, 2500, 3, 0.15);
    this.playTone(ctx, 1200, 0.06, 0.05, 'sine');
  }

  /** Lighter chip sound for changing an existing vote */
  playVoteChange(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.createNoiseBurst(ctx, 0.06, 3000, 4, 0.1);
  }

  /** Soft "unplace" — vote cleared */
  playVoteClear(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.playTone(ctx, 600, 0.1, 0.06, 'sine');
  }

  /** Card reveal — dramatic whoosh with frequency sweep */
  playReveal(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Frequency sweep
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);

    // Noise accent
    this.createNoiseBurst(ctx, 0.15, 1500, 2, 0.08);
  }

  /** New round — quick ascending arpeggio (3 notes) */
  playNewRound(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const spacing = 0.07;
    notes.forEach((freq, i) => {
      this.playTone(ctx, freq, 0.15, 0.08, 'triangle', ctx.currentTime + i * spacing);
    });
  }

  /** Consensus — major chord with gentle sustain */
  playConsensus(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // C major chord: C4-E4-G4
    const freqs = [261.63, 329.63, 392.0];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      // Gentle attack
      gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.05);
      // Sustain and fade
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    });

    // Add a soft high shimmer
    this.playTone(ctx, 1046.5, 0.4, 0.03, 'sine', ctx.currentTime + 0.05);
  }

  /** Player joined — gentle high-pitched ding */
  playJoin(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.playTone(ctx, 880, 0.15, 0.06, 'sine');
  }

  /** Player left — lower-pitched ding */
  playLeave(): void {
    if (!this.shouldPlay()) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.playTone(ctx, 440, 0.18, 0.05, 'sine');
  }
}

// Module-level singleton
const globalForSound = globalThis as unknown as { soundService?: SoundService };
export const soundService =
  typeof window !== 'undefined'
    ? (globalForSound.soundService ?? new SoundService())
    : new SoundService();
if (typeof window !== 'undefined') {
  globalForSound.soundService = soundService;
}
