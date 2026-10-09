import React from 'react';
import { Song, LyricLine } from '../types';
import { hapticEngine, formatTime } from '../utils/haptics';
import { masterAudioPlayer } from '../utils/audioPlayer';

interface PlayerScreenProps {
  song: Song;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  hapticIntensity: number;
  setHapticIntensity: (val: number) => void;
  onGoToLibras: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  song,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  hapticIntensity,
  setHapticIntensity,
  onGoToLibras,
}) => {
  const activeLyric: LyricLine =
    song.lyrics.slice().reverse().find((l) => currentTime >= l.timeSec) ||
    song.lyrics[0];

  const progressPercent = (currentTime / song.durationSec) * 100;

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      masterAudioPlayer.pause();
    } else {
      setIsPlaying(true);
      masterAudioPlayer.play(song, currentTime);
    }
    hapticEngine.playTactilePulse(68, 120, hapticIntensity);
  };

  const skipSeconds = (delta: number) => {
    const next = Math.max(0, Math.min(song.durationSec, currentTime + delta));
    setCurrentTime(next);
    masterAudioPlayer.seek(next);
    hapticEngine.playTactilePulse(75, 80, hapticIntensity);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 gap-4 pt-2">
      {/* Top Sensory Mode Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1b1b1f] border border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-pulse" />
          <span className="text-[12px] font-bold text-[#e0fdff] uppercase tracking-wider">
            Modo Sinestésico Auditivo-Tátil
          </span>
        </div>
        <button
          onClick={onGoToLibras}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] text-[11px] font-bold hover:bg-[#00f2fe]/25 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">sign_language</span>
          <span>Ver em Libras</span>
        </button>
      </div>

      {/* Hero Tactile Resonator Ring (Visualizes physical transducer resonance) */}
      <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-b from-[#1b1b1f] to-[#0e0e12] border border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
        {/* Pulsing Concentric Sensory Rings */}
        <div
          className={`absolute inset-0 m-auto rounded-full border border-[#00f2fe]/30 transition-all duration-300 ${
            isPlaying ? 'w-64 h-64 scale-105 animate-pulse' : 'w-56 h-56'
          }`}
        />
        <div
          className={`absolute inset-0 m-auto rounded-full border-2 border-[#ff4b89]/40 transition-all duration-300 ${
            isPlaying ? 'w-48 h-48 scale-110' : 'w-44 h-44'
          }`}
        />
        <div
          className={`absolute inset-0 m-auto rounded-full border border-[#dbb8ff]/40 transition-all duration-300 ${
            isPlaying ? 'w-36 h-36 scale-95' : 'w-32 h-32'
          }`}
        />

        {/* Center Album Art Core */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-[#00f2fe]/40 z-10">
          <img
            alt={song.title}
            src={song.coverUrl}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105 rotate-3' : 'scale-100'
            }`}
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-2">
            <span className="text-[11px] font-bold text-[#00f2fe] uppercase tracking-wider">
              {song.bpm} BPM
            </span>
            <span className="text-[13px] font-extrabold text-white leading-tight mt-0.5">
              {song.title}
            </span>
          </div>
        </div>

        {/* Bottom Floating Frequency Tag */}
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-10 text-[11px] font-mono text-[#b9cacb]">
          <span className="bg-black/60 px-2.5 py-1 rounded-full border border-white/10 text-[#00f2fe]">
            Sub-Bass: {activeLyric.frequencyHz}Hz
          </span>
          <span className="bg-black/60 px-2.5 py-1 rounded-full border border-white/10 text-[#ff4b89]">
            Haptic: Nível {hapticIntensity}
          </span>
        </div>
      </div>

      {/* Song Metadata */}
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-[22px] font-extrabold text-[#e0fdff] tracking-tight">
          {song.title}
        </h2>
        <p className="text-[14px] text-[#b9cacb] font-medium">
          {song.artist} • <span className="text-[#00f2fe]">{song.key}</span>
        </p>
      </div>

      {/* Live Active Lyric Bar */}
      <div className="bg-[#1f1f24] p-3.5 rounded-xl border border-white/5 flex flex-col gap-1 text-center">
        <span className="text-[10px] font-bold text-[#ff4b89] uppercase tracking-wider">
          Letra Sincronizada
        </span>
        <p className="text-[15px] font-bold text-[#e4e1e7] leading-tight">
          {activeLyric.textPt}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] text-[#00f2fe] font-bold">
          <span>Glosa:</span>
          <span>{activeLyric.glosa.join(' • ')}</span>
        </div>
      </div>

      {/* Scrubber Slider */}
      <div className="flex flex-col gap-1.5 bg-[#1b1b1f] p-3.5 rounded-xl border border-white/5">
        <div className="relative w-full h-3 bg-[#0e0e12] rounded-full overflow-hidden cursor-pointer"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const ratio = (e.clientX - rect.left) / rect.width;
               const newTime = ratio * song.durationSec;
               setCurrentTime(newTime);
               masterAudioPlayer.seek(newTime);
               hapticEngine.playTactilePulse(68, 100, hapticIntensity);
             }}>
          <div
            className="h-full bg-gradient-to-r from-[#00f2fe] via-[#ff4b89] to-[#dbb8ff] rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#b9cacb]">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#00f2fe] font-bold">{activeLyric.section}</span>
          <span>{formatTime(song.durationSec)}</span>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-5 py-2">
        <button
          onClick={() => skipSeconds(-10)}
          className="w-11 h-11 rounded-full bg-[#1f1f24] hover:bg-[#2a292e] text-[#e4e1e7] flex items-center justify-center active:scale-95 transition-all"
          title="-10 segundos"
        >
          <span className="material-symbols-outlined text-[20px]">replay_10</span>
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f2fe] to-[#ff4b89] text-[#00373a] flex items-center justify-center shadow-[0_0_24px_rgba(0,242,254,0.4)] active:scale-90 transition-all font-bold"
          title={isPlaying ? 'Pausar' : 'Tocar'}
        >
          <span className="material-symbols-outlined text-[36px] text-[#0e0e12]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <button
          onClick={() => skipSeconds(10)}
          className="w-11 h-11 rounded-full bg-[#1f1f24] hover:bg-[#2a292e] text-[#e4e1e7] flex items-center justify-center active:scale-95 transition-all"
          title="+10 segundos"
        >
          <span className="material-symbols-outlined text-[20px]">forward_10</span>
        </button>
      </div>

      {/* Multi-Frequency Spectrum Tactile Channels */}
      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        <div className="bg-[#1b1b1f] p-2.5 rounded-xl border border-white/5">
          <span className="text-[#dbb8ff] font-bold block mb-1">Grave (30-120Hz)</span>
          <span className="font-mono text-[#e4e1e7] font-bold text-[13px]">
            {isPlaying ? '84 dB' : '0 dB'}
          </span>
          <span className="text-[10px] text-[#b9cacb] block mt-0.5">Colete Háptico</span>
        </div>

        <div className="bg-[#1b1b1f] p-2.5 rounded-xl border border-white/5">
          <span className="text-[#ff4b89] font-bold block mb-1">Médios (250-4k)</span>
          <span className="font-mono text-[#e4e1e7] font-bold text-[13px]">
            {isPlaying ? '72 dB' : '0 dB'}
          </span>
          <span className="text-[10px] text-[#b9cacb] block mt-0.5">Letras & Libras</span>
        </div>

        <div className="bg-[#1b1b1f] p-2.5 rounded-xl border border-white/5">
          <span className="text-[#00f2fe] font-bold block mb-1">Agudos (5k-16k)</span>
          <span className="font-mono text-[#e4e1e7] font-bold text-[13px]">
            {isPlaying ? '68 dB' : '0 dB'}
          </span>
          <span className="text-[10px] text-[#b9cacb] block mt-0.5">Anel Tátil</span>
        </div>
      </div>
    </div>
  );
};
