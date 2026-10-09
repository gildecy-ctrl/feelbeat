import { Song } from '../types';
import { hapticEngine } from './haptics';

export type TimeUpdateCallback = (currentTime: number) => void;
export type EndedCallback = () => void;
export type PlayStateCallback = (isPlaying: boolean) => void;

export interface StemVolumes {
  vocals: number; // 0 - 100
  bass: number; // 0 - 100
  drums: number; // 0 - 100
  synths: number; // 0 - 100
  mutedStems?: Record<string, boolean>;
}

class MasterAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private vocalsFilter: BiquadFilterNode | null = null;
  private drumsFilter: BiquadFilterNode | null = null;
  private synthsFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private frequencyDataArray: Uint8Array | null = null;

  private currentSong: Song | null = null;
  private isSyntheticBacking: boolean = false;
  private synthIntervalId: number | null = null;
  private beatRhythmIntervalId: number | null = null;
  private isPlayingState: boolean = false;

  private onTimeUpdateCallback: TimeUpdateCallback | null = null;
  private onEndedCallback: EndedCallback | null = null;
  private onPlayStateCallback: PlayStateCallback | null = null;

  private currentSpeed: number = 1.0;
  private currentIntensity: number = 8;
  private currentVolume: number = 1.0;
  private isInitialized: boolean = false;
  private isAudioGraphConnected: boolean = false;
  private currentSinkId: string = '';

  // Synthetic synth components for catalog tracks without audioUrl
  private synthNodes: { osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode } = {};

  private initAudio() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    this.audio = new Audio();
    this.audio.preload = 'auto';

    // Hook up timeupdate
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && this.onTimeUpdateCallback && !this.isSyntheticBacking) {
        this.onTimeUpdateCallback(this.audio.currentTime);
      }
    });

    // Hook up play / pause states
    this.audio.addEventListener('play', () => {
      this.isPlayingState = true;
      if (this.onPlayStateCallback) this.onPlayStateCallback(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingState = false;
      if (this.onPlayStateCallback) this.onPlayStateCallback(false);
    });

    // Hook up track end
    this.audio.addEventListener('ended', () => {
      this.isPlayingState = false;
      this.stopBeatRhythm();
      if (this.onPlayStateCallback) this.onPlayStateCallback(false);
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    // Handle errors gracefully
    this.audio.addEventListener('error', (e) => {
      console.warn('FeelBeat Audio Player notice:', e);
    });

    this.setupAudioGraph();
    this.isInitialized = true;
  }

  // Setup Web Audio processing graph (Bass exciter, Stems EQ, Analyser, Master Gain)
  private setupAudioGraph() {
    if (this.isAudioGraphConnected || !this.audio) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();

      // Media Element Source
      this.mediaSource = this.audioCtx.createMediaElementSource(this.audio);

      // 1. Sub-bass physical speaker cone exciter filter (Low-Shelf at 65Hz)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.setValueAtTime(65, this.audioCtx.currentTime);
      this.bassFilter.gain.setValueAtTime(4 + (this.currentIntensity / 10) * 14, this.audioCtx.currentTime);

      // 2. Vocals EQ filter (Peaking at 1200Hz)
      this.vocalsFilter = this.audioCtx.createBiquadFilter();
      this.vocalsFilter.type = 'peaking';
      this.vocalsFilter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      this.vocalsFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.vocalsFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // 3. Drums / Transient High filter (Peaking at 3500Hz)
      this.drumsFilter = this.audioCtx.createBiquadFilter();
      this.drumsFilter.type = 'peaking';
      this.drumsFilter.frequency.setValueAtTime(3500, this.audioCtx.currentTime);
      this.drumsFilter.Q.setValueAtTime(1.2, this.audioCtx.currentTime);
      this.drumsFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // 4. Synths / Mid filter (Peaking at 600Hz)
      this.synthsFilter = this.audioCtx.createBiquadFilter();
      this.synthsFilter.type = 'peaking';
      this.synthsFilter.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      this.synthsFilter.Q.setValueAtTime(0.8, this.audioCtx.currentTime);
      this.synthsFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // 5. Analyser for real-time frequency spectrum visualizers
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.frequencyDataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // 6. Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime);

      // Audio Graph Pipeline:
      // mediaSource -> bassFilter -> vocalsFilter -> drumsFilter -> synthsFilter -> analyser -> gainNode -> destination
      this.mediaSource.connect(this.bassFilter);
      this.bassFilter.connect(this.vocalsFilter);
      this.vocalsFilter.connect(this.drumsFilter);
      this.drumsFilter.connect(this.synthsFilter);
      this.synthsFilter.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isAudioGraphConnected = true;
    } catch {
      // In case createMediaElementSource is restricted, audio will play directly via the HTMLAudioElement
      this.isAudioGraphConnected = false;
    }
  }

  // Ensure AudioContext is active upon user interaction
  private async ensureAudioContextResumed() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // ignore
      }
    }
  }

  // Set callbacks
  public setCallbacks(
    onTimeUpdate: TimeUpdateCallback,
    onEnded: EndedCallback,
    onPlayState?: PlayStateCallback
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
    if (onPlayState) this.onPlayStateCallback = onPlayState;
  }

  // Load a song (whether extracted from device or catalog)
  public async loadSong(song: Song, startTime: number = 0, autoPlay: boolean = false) {
    this.initAudio();
    this.stopSyntheticBacking();
    this.stopBeatRhythm();
    this.currentSong = song;

    await this.ensureAudioContextResumed();

    if (song.audioUrl) {
      // REAL DEVICE EXTRACTED AUDIO (or external audio url)
      this.isSyntheticBacking = false;
      if (this.audio) {
        // Avoid setting crossOrigin for blob: or data: URLs to avoid CORS block
        if (song.audioUrl.startsWith('http://') || song.audioUrl.startsWith('https://')) {
          this.audio.crossOrigin = 'anonymous';
        } else {
          this.audio.removeAttribute('crossorigin');
        }

        this.audio.src = song.audioUrl;
        this.audio.currentTime = startTime;
        this.audio.playbackRate = this.currentSpeed;
        this.audio.volume = this.currentVolume;

        // Apply sinkId if already set
        if (this.currentSinkId && 'setSinkId' in this.audio) {
          try {
            await (this.audio as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(
              this.currentSinkId
            );
          } catch {
            // ignore
          }
        }

        if (autoPlay) {
          try {
            await this.audio.play();
            this.isPlayingState = true;
            this.startBeatRhythm(song.bpm);
            if (this.onPlayStateCallback) this.onPlayStateCallback(true);
          } catch {
            // Autoplay policy fallback: waiting for user click
          }
        }
      }
    } else {
      // PRESET CATALOG SONG: Generate synthesized acoustic-tactile musical stems
      this.isSyntheticBacking = true;
      if (this.audio) {
        this.audio.pause();
      }
      if (autoPlay) {
        this.startSyntheticBacking(song.bpm, startTime);
        this.isPlayingState = true;
        this.startBeatRhythm(song.bpm);
        if (this.onPlayStateCallback) this.onPlayStateCallback(true);
      }
    }
  }

  // Play audio
  public async play(song?: Song, startTime?: number) {
    this.initAudio();
    await this.ensureAudioContextResumed();

    if (song && song.id !== this.currentSong?.id) {
      await this.loadSong(song, startTime || 0, true);
      return;
    }

    const targetSong = song || this.currentSong;
    if (!targetSong) return;

    if (targetSong.audioUrl && this.audio) {
      if (startTime !== undefined && Math.abs(this.audio.currentTime - startTime) > 1) {
        this.audio.currentTime = startTime;
      }
      this.audio.playbackRate = this.currentSpeed;
      this.audio.volume = this.currentVolume;

      try {
        await this.audio.play();
        this.isPlayingState = true;
        this.startBeatRhythm(targetSong.bpm);
        if (this.onPlayStateCallback) this.onPlayStateCallback(true);
      } catch (err) {
        console.warn('Audio playback play failed:', err);
      }
    } else {
      this.isSyntheticBacking = true;
      this.startSyntheticBacking(targetSong.bpm, startTime || 0);
      this.isPlayingState = true;
      this.startBeatRhythm(targetSong.bpm);
      if (this.onPlayStateCallback) this.onPlayStateCallback(true);
    }
  }

  // Pause audio
  public pause() {
    this.isPlayingState = false;
    if (this.audio && !this.isSyntheticBacking) {
      this.audio.pause();
    }
    this.stopSyntheticBacking();
    this.stopBeatRhythm();
    if (this.onPlayStateCallback) this.onPlayStateCallback(false);
  }

  // Toggle playback
  public toggle(song?: Song, startTime?: number) {
    if (this.isPlayingState) {
      this.pause();
    } else {
      this.play(song, startTime);
    }
  }

  // Seek playback position
  public seek(seconds: number) {
    if (this.audio && this.currentSong?.audioUrl) {
      const clamped = Math.max(0, Math.min(seconds, this.audio.duration || this.currentSong.durationSec));
      this.audio.currentTime = clamped;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(clamped);
      }
    }
  }

  // Set playback speed (0.75x, 1.0x, 1.25x, 1.5x)
  public setSpeed(speed: number) {
    this.currentSpeed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
    // Update rhythm tempo if playing
    if (this.isPlayingState && this.currentSong) {
      this.startBeatRhythm(this.currentSong.bpm);
    }
  }

  // Set master volume (0.0 to 1.0)
  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.currentVolume;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime);
    }
  }

  // Adjust tactile intensity (scales speaker cone bass gain from +4dB to +20dB)
  public setIntensity(intensity: number) {
    this.currentIntensity = intensity;
    if (this.bassFilter && this.audioCtx) {
      const bassGain = 4 + (intensity / 10) * 16;
      this.bassFilter.gain.setValueAtTime(bassGain, this.audioCtx.currentTime);
    }
  }

  // Adjust stem equalizer / isolation
  public setStemVolumes(stems: StemVolumes) {
    if (!this.audioCtx) return;

    // Vocals adjustment (-12dB to +8dB)
    if (this.vocalsFilter) {
      const isMuted = stems.mutedStems?.vocals;
      const gainVal = isMuted ? -24 : ((stems.vocals - 50) / 50) * 8;
      this.vocalsFilter.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
    }

    // Bass adjustment (-12dB to +14dB)
    if (this.bassFilter) {
      const isMuted = stems.mutedStems?.bass;
      const baseGain = 4 + (this.currentIntensity / 10) * 14;
      const gainVal = isMuted ? -24 : baseGain + ((stems.bass - 50) / 50) * 6;
      this.bassFilter.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
    }

    // Drums adjustment
    if (this.drumsFilter) {
      const isMuted = stems.mutedStems?.drums;
      const gainVal = isMuted ? -24 : ((stems.drums - 50) / 50) * 8;
      this.drumsFilter.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
    }

    // Synths adjustment
    if (this.synthsFilter) {
      const isMuted = stems.mutedStems?.synths;
      const gainVal = isMuted ? -24 : ((stems.synths - 50) / 50) * 7;
      this.synthsFilter.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
    }
  }

  // Route audio output device (e.g. to Bluetooth headset / Woojer via setSinkId)
  public async setSinkId(deviceId: string): Promise<boolean> {
    this.currentSinkId = deviceId;
    let success = false;

    // 1. Audio element setSinkId
    if (this.audio && 'setSinkId' in this.audio) {
      try {
        await (this.audio as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
        success = true;
      } catch {
        // ignore
      }
    }

    // 2. AudioContext setSinkId
    if (this.audioCtx && 'setSinkId' in this.audioCtx) {
      try {
        await (this.audioCtx as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
        success = true;
      } catch {
        // ignore
      }
    }

    return success;
  }

  // Real-time audio frequency data for UI spectrum and waveform animations
  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.frequencyDataArray) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.analyser.getByteFrequencyData(this.frequencyDataArray as any);
      return this.frequencyDataArray;
    }
    return new Uint8Array(32);
  }

  // Get current audio energy level (0.0 to 1.0)
  public getAudioEnergy(): number {
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length * 255);
  }

  // Continuous beat rhythm synchronization:
  // Synchronizes smartphone physical vibration and speaker cone exciter to the song tempo & energy
  private startBeatRhythm(bpm: number) {
    this.stopBeatRhythm();

    // Scale BPM with playback rate
    const effectiveBpm = Math.max(50, Math.min(220, bpm * this.currentSpeed));
    const beatMs = Math.round((60 / effectiveBpm) * 1000);
    let beatCount = 0;

    this.beatRhythmIntervalId = window.setInterval(() => {
      if (!this.isPlayingState) return;

      beatCount = (beatCount + 1) % 4;
      const isDownbeat = beatCount === 0;

      // Also check real audio energy if playing extracted audio
      const energy = this.getAudioEnergy();
      const scaledIntensity = Math.min(10, Math.max(2, Math.round(this.currentIntensity * (energy > 0.3 ? 1.2 : 0.9))));

      // 1. Phone vibration (when no Bluetooth device is connected or in tandem)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          const duration = Math.round((isDownbeat ? 60 : 35) * (scaledIntensity / 10));
          if (isDownbeat && scaledIntensity >= 7) {
            navigator.vibrate([duration, 35, Math.round(duration * 0.7)]);
          } else {
            navigator.vibrate(duration);
          }
        } catch {
          // ignore
        }
      }

      // 2. Speaker cone excitation on downbeat
      if (isDownbeat) {
        hapticEngine.playTactilePulse(64, 140, scaledIntensity);
      }
    }, beatMs);
  }

  private stopBeatRhythm() {
    if (this.beatRhythmIntervalId) {
      clearInterval(this.beatRhythmIntervalId);
      this.beatRhythmIntervalId = null;
    }
  }

  // Synthetic musical backing generator for catalog tracks without mp3
  private startSyntheticBacking(bpm: number, startSec: number) {
    this.stopSyntheticBacking();
    const effectiveBpm = Math.max(50, Math.min(200, bpm * this.currentSpeed));
    const beatMs = Math.round((60 / effectiveBpm) * 1000);
    let currentSec = startSec;

    this.synthIntervalId = window.setInterval(() => {
      currentSec += (beatMs / 1000) * this.currentSpeed;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(currentSec);
      }

      // Check track end
      if (this.currentSong && currentSec >= this.currentSong.durationSec) {
        this.pause();
        if (this.onEndedCallback) this.onEndedCallback();
        return;
      }

      // Play synthesized sub-bass kick & acoustic harmonic chords
      hapticEngine.playTactilePulse(65, 160, this.currentIntensity);
    }, beatMs);
  }

  private stopSyntheticBacking() {
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  public getCurrentTime(): number {
    if (this.audio && this.currentSong?.audioUrl) {
      return this.audio.currentTime;
    }
    return 0;
  }

  public getDuration(): number {
    if (this.audio && this.currentSong?.audioUrl && !isNaN(this.audio.duration)) {
      return this.audio.duration;
    }
    return this.currentSong?.durationSec || 0;
  }

  public getIsPlaying(): boolean {
    return this.isPlayingState;
  }
}

export const masterAudioPlayer = new MasterAudioPlayer();
