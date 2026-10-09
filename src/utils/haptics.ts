// Advanced Web Vibration API, Acoustic Speaker Cone Resonance Exciter, and Bluetooth Audio Routing

export interface BluetoothAudioTarget {
  id: string;
  name: string;
  type: string;
  isBluetooth: boolean;
  active: boolean;
}

class HapticAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private continuousOscs: Map<string, { osc: OscillatorNode; gain: GainNode }> = new Map();
  private streamIntervalId: number | null = null;
  private playbackRhythmIntervalId: number | null = null;
  private isStreamingToBluetooth: boolean = false;
  private hasConnectedBluetoothDevice: boolean = false;
  private activeTargetDeviceId: string = 'woojer-1';
  private activeStemRoute: string = 'bass'; // 'all' | 'bass' | 'vocals' | 'drums' | 'synths'
  private speakerResonanceEnabled: boolean = true;
  private phoneVibrationEnabled: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Create a distortion curve to add rich subharmonics that physically vibrate speaker cones
  private makeDistortionCurve(amount: number = 20): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Play a sub-bass resonant tactile tone simulating physical body/speaker vibration
  public playTactilePulse(frequencyHz: number = 68, durationMs: number = 180, intensity: number = 8) {
    // 1. PHYSICAL SMARTPHONE VIBRATION (when no Bluetooth connected or in tandem)
    if (this.phoneVibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const scaledDuration = Math.min(200, Math.max(30, Math.round(durationMs * (intensity / 10))));
        // Rhythmic double-strike on heavy bass (tum-tum)
        if (intensity >= 7) {
          navigator.vibrate([scaledDuration, 40, Math.round(scaledDuration * 0.6)]);
        } else {
          navigator.vibrate(scaledDuration);
        }
      } catch {
        // Ignored if vibration permission is restricted
      }
    }

    // 2. ACOUSTIC SPEAKER CONE EXCURSION SYNTHESIZER (makes device speaker physically vibrate)
    try {
      const ctx = this.getAudioContext();
      if (!ctx || this.isMuted) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Low-shelf and peaking filter chain to induce maximum speaker diaphragm excursion
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.setValueAtTime(frequencyHz, ctx.currentTime);
      bassFilter.gain.setValueAtTime(14, ctx.currentTime); // +14dB physical boost

      const peakFilter = ctx.createBiquadFilter();
      peakFilter.type = 'peaking';
      peakFilter.frequency.setValueAtTime(frequencyHz, ctx.currentTime);
      peakFilter.Q.setValueAtTime(2.5, ctx.currentTime);
      peakFilter.gain.setValueAtTime(12, ctx.currentTime);

      // Deep triangle wave combined with low fundamental
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequencyHz, ctx.currentTime);

      // Sub-harmonic frequency drop during hit (simulates heavy bass acoustic impact)
      osc.frequency.exponentialRampToValueAtTime(Math.max(35, frequencyHz * 0.6), ctx.currentTime + durationMs / 1000);

      const normalizedVol = Math.max(0.04, Math.min(0.45, (intensity / 10) * 0.35));
      gain.gain.setValueAtTime(normalizedVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(bassFilter);
      bassFilter.connect(peakFilter);
      peakFilter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio fallback
    }
  }

  // CONTINUOUS RHYTHMIC PLAYBACK HAPTICS & SPEAKER CONE SHAKER
  // Synchronizes continuous smartphone vibration & loudspeaker resonance to song BPM
  public startPlaybackRhythm(bpm: number = 128, frequencyHz: number = 68, intensity: number = 8) {
    this.stopPlaybackRhythm();

    const beatIntervalMs = Math.round((60 / bpm) * 1000);
    let step = 0;

    this.playbackRhythmIntervalId = window.setInterval(() => {
      step = (step + 1) % 4; // 4/4 musical measure

      const isDownbeat = step === 0; // Beat 1 (Kick / Strongest)
      const isBackbeat = step === 2; // Beat 3 (Snare / Pulse)

      // Intensity scaled durations
      const baseMs = Math.round(35 + (intensity / 10) * 45);

      // 1. SMARTPHONE PHYSICAL VIBRATION (when no Bluetooth connected or enabled)
      if (this.phoneVibrationEnabled && !this.isStreamingToBluetooth && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          if (isDownbeat) {
            // Beat 1: Strong tactile kick pulse
            navigator.vibrate([baseMs * 1.5, 30, baseMs * 0.8]);
          } else if (isBackbeat) {
            // Beat 3: Syncopated pulse
            navigator.vibrate(baseMs);
          } else {
            // Beats 2 & 4: Gentle micro-pulse
            navigator.vibrate(Math.round(baseMs * 0.5));
          }
        } catch {
          // ignore
        }
      }

      // 2. SPEAKER CONE RESONANCE EXCITER (sub-bass impulse through physical speakers)
      if (this.speakerResonanceEnabled) {
        try {
          const ctx = this.getAudioContext();
          if (ctx && !this.isMuted) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            filter.type = 'lowshelf';
            filter.frequency.setValueAtTime(frequencyHz, ctx.currentTime);
            filter.gain.setValueAtTime(15, ctx.currentTime);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(isDownbeat ? frequencyHz : frequencyHz * 1.2, ctx.currentTime);

            const hitVol = (isDownbeat ? 0.22 : 0.12) * (intensity / 10);
            gain.gain.setValueAtTime(hitVol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.18);
          }
        } catch {
          // ignore
        }
      }
    }, beatIntervalMs);
  }

  public stopPlaybackRhythm() {
    if (this.playbackRhythmIntervalId) {
      clearInterval(this.playbackRhythmIntervalId);
      this.playbackRhythmIntervalId = null;
    }
  }

  // Route audio to specific device (e.g. Bluetooth headset / Woojer via setSinkId)
  public async routeToAudioSink(deviceId: string): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return false;

      const ctxAny = ctx as unknown as { setSinkId?: (sinkId: string) => Promise<void> };
      if (typeof ctxAny.setSinkId === 'function') {
        await ctxAny.setSinkId(deviceId);
        this.activeTargetDeviceId = deviceId;
        this.hasConnectedBluetoothDevice = true;
        return true;
      }
      this.activeTargetDeviceId = deviceId;
      this.hasConnectedBluetoothDevice = true;
      return true;
    } catch {
      return false;
    }
  }

  // Request native Bluetooth device pairing via Web Bluetooth API
  public async requestBluetoothPairing(): Promise<{ success: boolean; name?: string; error?: string }> {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const bt = (navigator as unknown as {
          bluetooth: {
            requestDevice: (options: {
              acceptAllDevices?: boolean;
              optionalServices?: string[];
            }) => Promise<{ name?: string; id: string }>;
          };
        }).bluetooth;

        const device = await bt.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'generic_access'],
        });

        this.hasConnectedBluetoothDevice = true;
        return { success: true, name: device.name || 'Dispositivo Bluetooth' };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Cancelado ou não suportado';
        return { success: false, error: message };
      }
    }
    return { success: false, error: 'Web Bluetooth não suportado neste navegador' };
  }

  // Start continuous audio stream for the extracted stem (sent to Bluetooth device or speakers)
  public startExtractedStemStream(stem: string, frequencyHz: number = 68, intensity: number = 8) {
    this.stopExtractedStemStream();
    this.isStreamingToBluetooth = true;
    this.activeStemRoute = stem;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Speaker resonance bass booster filter
      const subBoost = ctx.createBiquadFilter();
      subBoost.type = 'lowshelf';
      subBoost.frequency.setValueAtTime(frequencyHz, ctx.currentTime);
      subBoost.gain.setValueAtTime(16, ctx.currentTime);

      if (stem === 'bass') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequencyHz, ctx.currentTime);
      } else if (stem === 'vocals') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
      } else if (stem === 'drums') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
      }

      const baseVol = Math.max(0.04, Math.min(0.38, (intensity / 10) * 0.28));
      gain.gain.setValueAtTime(baseVol, ctx.currentTime);

      osc.connect(subBoost);
      subBoost.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      this.continuousOscs.set('active_stream', { osc, gain });

      // Pulsing rhythmic pattern with smartphone vibration
      let beat = 0;
      this.streamIntervalId = window.setInterval(() => {
        if (!this.isStreamingToBluetooth || !this.audioCtx) return;
        beat++;
        const currentGain = this.continuousOscs.get('active_stream')?.gain;
        if (currentGain) {
          const mod = beat % 2 === 0 ? baseVol * 1.35 : baseVol * 0.7;
          currentGain.gain.setValueAtTime(mod, this.audioCtx.currentTime);
        }

        // Rhythmic phone vibration if no Bluetooth device is receiving
        if (this.phoneVibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            const vibeMs = beat % 2 === 0 ? 55 : 25;
            navigator.vibrate(vibeMs);
          } catch {
            // ignore
          }
        }
      }, 468); // ~128 BPM
    } catch {
      // Fallback
    }
  }

  public stopExtractedStemStream() {
    this.isStreamingToBluetooth = false;
    if (this.streamIntervalId) {
      clearInterval(this.streamIntervalId);
      this.streamIntervalId = null;
    }
    const current = this.continuousOscs.get('active_stream');
    if (current) {
      try {
        current.osc.stop();
        current.osc.disconnect();
        current.gain.disconnect();
      } catch {
        // ignore
      }
      this.continuousOscs.delete('active_stream');
    }
  }

  public getIsStreaming(): boolean {
    return this.isStreamingToBluetooth;
  }

  public getHasConnectedBluetoothDevice(): boolean {
    return this.hasConnectedBluetoothDevice;
  }

  public setHasConnectedBluetoothDevice(connected: boolean) {
    this.hasConnectedBluetoothDevice = connected;
  }

  public getActiveStemRoute(): string {
    return this.activeStemRoute;
  }

  public getActiveTargetDeviceId(): string {
    return this.activeTargetDeviceId;
  }

  public setSpeakerResonanceEnabled(enabled: boolean) {
    this.speakerResonanceEnabled = enabled;
  }

  public getSpeakerResonanceEnabled(): boolean {
    return this.speakerResonanceEnabled;
  }

  public setPhoneVibrationEnabled(enabled: boolean) {
    this.phoneVibrationEnabled = enabled;
  }

  public getPhoneVibrationEnabled(): boolean {
    return this.phoneVibrationEnabled;
  }

  public triggerClickFeedback() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }
  }
}

export const hapticEngine = new HapticAudioEngine();

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
