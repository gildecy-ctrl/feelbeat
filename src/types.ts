export interface GlosaToken {
  id: string;
  word: string;
  active: boolean;
  frequencyHz?: number;
  tactilePattern?: string;
  handConfig?: string;
  facialExpression?: string;
  movement?: string;
}

export interface LyricLine {
  id: string;
  timeSec: number;
  durationSec: number;
  textPt: string;
  glosa: string[];
  activeGlosaIndex: number;
  activeSign: string;
  frequencyHz: number;
  tactileDescription: string;
  section: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  durationSec: number;
  verifiedLabel: string;
  interpreterName: string;
  interpreterRole: string;
  interpreterPhoto: string;
  coverUrl: string;
  tactilePreset: string;
  key: string;
  audioUrl?: string;
  lyrics: LyricLine[];
}

export interface Stem {
  id: string;
  name: string;
  color: string;
  textColor: string;
  bgBadge: string;
  volume: number; // 0 to 100
  hapticIntensity: number; // 0 to 10
  isMuted: boolean;
  isSolo: boolean;
  frequencyRange: string;
  targetDevice: 'Colete Háptico' | 'Anel de Pulso' | 'Luva Tátil' | 'Alto-Falante Sub';
}

export interface HapticDevice {
  id: string;
  name: string;
  type: string;
  battery: number;
  connected: boolean;
  latencyMs: number;
  hapticFrequency: string;
}
