import React, { useState, useEffect } from 'react';
import { Stem, Song } from '../types';
import { hapticEngine, formatTime } from '../utils/haptics';
import { masterAudioPlayer } from '../utils/audioPlayer';

const INITIAL_STEMS: Stem[] = [
  {
    id: 'vocals',
    name: 'Vocais & Melodia Principal',
    color: '#ff4b89',
    textColor: 'text-[#ff4b89]',
    bgBadge: 'bg-[#ff4b89]/20 text-[#ffb1c3]',
    volume: 85,
    hapticIntensity: 8,
    isMuted: false,
    isSolo: false,
    frequencyRange: '300 Hz – 4.000 Hz',
    targetDevice: 'Luva Tátil',
  },
  {
    id: 'bass',
    name: 'Baixo & Sub-Grave (Kick)',
    color: '#dbb8ff',
    textColor: 'text-[#dbb8ff]',
    bgBadge: 'bg-[#dbb8ff]/20 text-[#efdbff]',
    volume: 100,
    hapticIntensity: 10,
    isMuted: false,
    isSolo: false,
    frequencyRange: '20 Hz – 150 Hz',
    targetDevice: 'Colete Háptico',
  },
  {
    id: 'drums',
    name: 'Bateria & Transientes Rítmicos',
    color: '#00f2fe',
    textColor: 'text-[#00f2fe]',
    bgBadge: 'bg-[#00f2fe]/20 text-[#6ff6ff]',
    volume: 90,
    hapticIntensity: 7,
    isMuted: false,
    isSolo: false,
    frequencyRange: '80 Hz – 8.000 Hz',
    targetDevice: 'Anel de Pulso',
  },
  {
    id: 'synths',
    name: 'Sintetizadores & Harmonia',
    color: '#ffd9e0',
    textColor: 'text-[#ffd9e0]',
    bgBadge: 'bg-white/10 text-[#e4e1e7]',
    volume: 75,
    hapticIntensity: 5,
    isMuted: false,
    isSolo: false,
    frequencyRange: '400 Hz – 12.000 Hz',
    targetDevice: 'Alto-Falante Sub',
  },
];

interface StemsScreenProps {
  song?: Song;
  currentTime?: number;
  setCurrentTime?: (time: number) => void;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  hapticIntensity?: number;
  onOpenBluetoothModal?: () => void;
  onOpenExtractor?: () => void;
  onGoToLibras?: () => void;
}

export const StemsScreen: React.FC<StemsScreenProps> = ({
  song,
  currentTime = 0,
  setCurrentTime,
  isPlaying = false,
  setIsPlaying,
  hapticIntensity = 8,
  onOpenBluetoothModal,
  onOpenExtractor,
  onGoToLibras,
}) => {
  const [stems, setStems] = useState<Stem[]>(INITIAL_STEMS);
  const [isStreamingBT, setIsStreamingBT] = useState<boolean>(false);
  const [activeStemStreamed, setActiveStemStreamed] = useState<string>('bass');
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('Woojer Vest 3 Pro');

  useEffect(() => {
    setIsStreamingBT(hapticEngine.getIsStreaming());
    setActiveStemStreamed(hapticEngine.getActiveStemRoute() || 'bass');
  }, []);

  // Update master audio EQ in real-time when stems change
  useEffect(() => {
    const sVocals = stems.find((s) => s.id === 'vocals');
    const sBass = stems.find((s) => s.id === 'bass');
    const sDrums = stems.find((s) => s.id === 'drums');
    const sSynths = stems.find((s) => s.id === 'synths');

    const hasSolo = stems.some((s) => s.isSolo);

    masterAudioPlayer.setStemVolumes({
      vocals: hasSolo ? (sVocals?.isSolo ? sVocals.volume : 0) : (sVocals?.isMuted ? 0 : sVocals?.volume || 80),
      bass: hasSolo ? (sBass?.isSolo ? sBass.volume : 0) : (sBass?.isMuted ? 0 : sBass?.volume || 100),
      drums: hasSolo ? (sDrums?.isSolo ? sDrums.volume : 0) : (sDrums?.isMuted ? 0 : sDrums?.volume || 90),
      synths: hasSolo ? (sSynths?.isSolo ? sSynths.volume : 0) : (sSynths?.isMuted ? 0 : sSynths?.volume || 75),
      mutedStems: {
        vocals: hasSolo ? !sVocals?.isSolo : !!sVocals?.isMuted,
        bass: hasSolo ? !sBass?.isSolo : !!sBass?.isMuted,
        drums: hasSolo ? !sDrums?.isSolo : !!sDrums?.isMuted,
        synths: hasSolo ? !sSynths?.isSolo : !!sSynths?.isMuted,
      },
    });
  }, [stems]);

  const togglePlay = () => {
    if (setIsPlaying) {
      if (isPlaying) {
        setIsPlaying(false);
        masterAudioPlayer.pause();
      } else {
        setIsPlaying(true);
        if (song) {
          masterAudioPlayer.play(song, currentTime);
        } else {
          masterAudioPlayer.play();
        }
      }
    } else {
      masterAudioPlayer.toggle(song, currentTime);
    }
    hapticEngine.triggerClickFeedback();
  };

  const toggleMute = (id: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isMuted: !s.isMuted } : s))
    );
    hapticEngine.triggerClickFeedback();
  };

  const toggleSolo = (id: string) => {
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isSolo: !s.isSolo } : s))
    );
    hapticEngine.triggerClickFeedback();
  };

  const updateHaptic = (id: string, val: number) => {
    setStems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hapticIntensity: val } : s))
    );
    if (isStreamingBT && activeStemStreamed === id) {
      hapticEngine.startExtractedStemStream(id, 68, val);
    } else {
      hapticEngine.playTactilePulse(68, 60, val);
    }
  };

  // Toggle stream of a specific stem to Bluetooth
  const handleStreamStemToBluetooth = (stemId: string) => {
    if (isStreamingBT && activeStemStreamed === stemId) {
      // Pause
      hapticEngine.stopExtractedStemStream();
      setIsStreamingBT(false);
    } else {
      // Start streaming this specific stem
      const stemObj = stems.find((s) => s.id === stemId);
      const intensity = stemObj ? stemObj.hapticIntensity : 8;
      const freq = stemId === 'bass' ? 68 : stemId === 'drums' ? 90 : 320;
      hapticEngine.startExtractedStemStream(stemId, freq, intensity);
      setActiveStemStreamed(stemId);
      setIsStreamingBT(true);
    }
    hapticEngine.triggerClickFeedback();
  };

  const applyPreset = (preset: 'libras' | 'bass' | 'rhythm') => {
    if (preset === 'libras') {
      setStems((prev) =>
        prev.map((s) =>
          s.id === 'vocals'
            ? { ...s, volume: 100, hapticIntensity: 10, isMuted: false }
            : { ...s, volume: 60, hapticIntensity: 4, isMuted: false }
        )
      );
    } else if (preset === 'bass') {
      setStems((prev) =>
        prev.map((s) =>
          s.id === 'bass'
            ? { ...s, volume: 100, hapticIntensity: 10, isMuted: false }
            : { ...s, volume: 50, hapticIntensity: 3, isMuted: false }
        )
      );
    } else {
      setStems((prev) =>
        prev.map((s) =>
          s.id === 'drums' || s.id === 'bass'
            ? { ...s, volume: 100, hapticIntensity: 9, isMuted: false }
            : { ...s, volume: 40, hapticIntensity: 2, isMuted: false }
        )
      );
    }
    hapticEngine.playTactilePulse(80, 200, 8);
  };

  const activeStemLabel =
    stems.find((s) => s.id === activeStemStreamed)?.name || 'Baixo / Sub-Grave';

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 gap-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1b1b1f] border border-white/5">
        <div>
          <h2 className="text-[17px] font-bold text-[#e0fdff]">
            Mixer de Stems IA
          </h2>
          <p className="text-[12px] text-[#b9cacb]">
            Separação neural e roteamento para dispositivos Bluetooth
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenExtractor && (
            <button
              onClick={onOpenExtractor}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] hover:bg-[#00f2fe]/25 text-[11px] font-bold border border-[#00f2fe]/30 transition-colors"
              title="Extrair áudio de qualquer arquivo do aparelho"
            >
              <span className="material-symbols-outlined text-[14px]">file_upload</span>
              <span>Extrair Áudio</span>
            </button>
          )}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2a292e] text-[#b9cacb] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Demucs v4</span>
          </div>
        </div>
      </div>

      {/* ACTIVE TRACK PLAYER CARD */}
      {song && (
        <div className="p-3.5 rounded-xl bg-[#1f1f24] border border-white/10 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#ff4b89] text-[#00373a] flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all"
                title={isPlaying ? 'Pausar Áudio' : 'Reproduzir Áudio'}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-[14px] text-white truncate">
                    {song.title}
                  </h3>
                  {song.audioUrl && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00f2fe]/20 text-[#00f2fe] shrink-0 border border-[#00f2fe]/30">
                      ÁUDIO LOCAL
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#b9cacb] truncate">
                  {song.artist} • {song.bpm} BPM
                </p>
              </div>
            </div>

            {onGoToLibras && (
              <button
                type="button"
                onClick={onGoToLibras}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00f2fe]/10 hover:bg-[#00f2fe]/20 text-[#00f2fe] text-[11px] font-bold border border-[#00f2fe]/30 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">sign_language</span>
                <span>Ver em Libras</span>
              </button>
            )}
          </div>

          {/* Scrubber track */}
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#b9cacb]">
            <span>{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-2 bg-[#0e0e12] rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const newT = ratio * song.durationSec;
                if (setCurrentTime) setCurrentTime(newT);
                masterAudioPlayer.seek(newT);
                hapticEngine.playTactilePulse(70, 80, hapticIntensity);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#00f2fe] to-[#ff4b89] rounded-full"
                style={{ width: `${Math.min(100, (currentTime / (song.durationSec || 1)) * 100)}%` }}
              />
            </div>
            <span>{formatTime(song.durationSec)}</span>
          </div>
        </div>
      )}

      {/* BLUETOOTH STREAMING CONTROLLER CARD */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#1b1b1f] to-[#131317] border border-[#00f2fe]/30 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00f2fe]/15 flex items-center justify-center text-[#00f2fe]">
              <span className="material-symbols-outlined text-[18px]">bluetooth_audio</span>
            </div>
            <div>
              <h3 className="font-extrabold text-[14px] text-[#e0fdff]">
                Saída de Áudio Bluetooth
              </h3>
              <p className="text-[11px] text-[#b9cacb]">
                Conectado: <strong className="text-white">{connectedDeviceName}</strong>
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
              isStreamingBT
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe]/30 animate-pulse'
                : 'bg-[#2a292e] text-[#b9cacb] border-white/10'
            }`}
          >
            {isStreamingBT ? 'TRANSMITINDO' : 'DISPONÍVEL'}
          </span>
        </div>

        {/* Live Audio Visualizer Bar while Streaming */}
        {isStreamingBT && (
          <div className="p-2.5 rounded-lg bg-[#0e0e12] border border-[#00f2fe]/20 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#ff4b89] animate-ping shrink-0" />
              <span className="text-[11px] font-bold text-[#e0fdff] truncate">
                Enviando áudio: <strong>{activeStemLabel}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {[4, 10, 6, 12, 8, 14, 5, 11, 7, 13].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#00f2fe] rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Master Bluetooth Stream CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStreamStemToBluetooth(activeStemStreamed)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isStreamingBT
                ? 'bg-[#ff4b89] text-[#590026] shadow-[0_0_15px_rgba(255,75,137,0.4)]'
                : 'bg-[#00f2fe] text-[#00373a] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isStreamingBT ? 'pause_circle' : 'cast_connected'}
            </span>
            <span>
              {isStreamingBT
                ? 'Pausar Transmissão Bluetooth'
                : `Enviar ${activeStemLabel} para Bluetooth`}
            </span>
          </button>

          {onOpenBluetoothModal && (
            <button
              onClick={onOpenBluetoothModal}
              className="px-3 py-2.5 rounded-xl bg-[#2a292e] hover:bg-[#353439] text-[#e0fdff] text-[12px] font-bold flex items-center gap-1 border border-white/5"
              title="Gerenciar Dispositivos Bluetooth"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">settings_bluetooth</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-[#b9cacb] font-semibold shrink-0">
          Presets:
        </span>
        <button
          onClick={() => applyPreset('libras')}
          className="px-3 py-1.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] text-[#ffb1c3] text-[11px] font-bold whitespace-nowrap border border-white/5"
        >
          Foco Glosa / Voz
        </button>
        <button
          onClick={() => applyPreset('bass')}
          className="px-3 py-1.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] text-[#dbb8ff] text-[11px] font-bold whitespace-nowrap border border-white/5"
        >
          Sub-Grave Máximo
        </button>
        <button
          onClick={() => applyPreset('rhythm')}
          className="px-3 py-1.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] text-[#00f2fe] text-[11px] font-bold whitespace-nowrap border border-white/5"
        >
          Polirritmia
        </button>
      </div>

      {/* Stem Cards */}
      <div className="flex flex-col gap-3">
        {stems.map((stem) => {
          const isThisStreamed = isStreamingBT && activeStemStreamed === stem.id;

          return (
            <div
              key={stem.id}
              className={`p-4 rounded-xl bg-[#1f1f24] border transition-all flex flex-col gap-3 ${
                isThisStreamed
                  ? 'border-[#00f2fe]/50 shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-[#00f2fe]/40'
                  : 'border-white/5 shadow-md'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: stem.color }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-[14px] text-[#e4e1e7] leading-tight truncate">
                      {stem.name}
                    </h3>
                    <span className="text-[10px] text-[#b9cacb] block truncate">
                      {stem.frequencyRange} • Roteado para: <strong className="text-white">{stem.targetDevice}</strong>
                    </span>
                  </div>
                </div>

                {/* Mute & Solo buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleSolo(stem.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      stem.isSolo
                        ? 'bg-[#00f2fe] text-[#00373a]'
                        : 'bg-[#2a292e] text-[#b9cacb]'
                    }`}
                  >
                    SOLO
                  </button>
                  <button
                    onClick={() => toggleMute(stem.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      stem.isMuted
                        ? 'bg-[#ff4b89] text-[#590026]'
                        : 'bg-[#2a292e] text-[#b9cacb]'
                    }`}
                  >
                    MUTE
                  </button>
                </div>
              </div>

              {/* Quick Send to Bluetooth Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleStreamStemToBluetooth(stem.id)}
                  className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isThisStreamed
                      ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                      : 'bg-[#131317] hover:bg-[#25252c] text-[#e0fdff] border border-white/10'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isThisStreamed ? 'graphic_eq' : 'bluetooth_connected'}
                  </span>
                  <span>
                    {isThisStreamed
                      ? `Transmitindo ao Vivo via Bluetooth`
                      : `Enviar este Stem para o Dispositivo Bluetooth`}
                  </span>
                </button>
              </div>

              {/* Haptic Motor Intensity Slider */}
              <div className="flex flex-col gap-1 bg-[#131317] p-2.5 rounded-lg">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#b9cacb] font-medium">
                    Intensidade de Transdução
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: stem.color }}
                  >
                    {stem.hapticIntensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={stem.hapticIntensity}
                  onChange={(e) => updateHaptic(stem.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-[#2a292e] rounded-lg appearance-none cursor-pointer accent-[#00f2fe]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
