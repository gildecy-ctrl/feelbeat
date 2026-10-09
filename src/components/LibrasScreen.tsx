import React, { useState, useEffect } from 'react';
import { Song, LyricLine } from '../types';
import { Avatar3DView, AvatarStyle } from './Avatar3DView';
import { SignDictionaryModal } from './SignDictionaryModal';
import { LyricsTranslatorModal } from './LyricsTranslatorModal';
import { hapticEngine, formatTime } from '../utils/haptics';
import { masterAudioPlayer } from '../utils/audioPlayer';

interface LibrasScreenProps {
  song: Song;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  hapticIntensity: number;
  setHapticIntensity: (val: number) => void;
  onUpdateSongLyrics?: (lyrics: LyricLine[]) => void;
}

export const LibrasScreen: React.FC<LibrasScreenProps> = ({
  song,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  hapticIntensity,
  setHapticIntensity,
  onUpdateSongLyrics,
}) => {
  // 3D Avatar Styles & View controls
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('realistic');
  const [speed, setSpeed] = useState<number>(1.0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(true);
  const [isPip, setIsPip] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sign Dictionary & Lyrics Translator Modals
  const [dictOpen, setDictOpen] = useState<boolean>(false);
  const [selectedDictSign, setSelectedDictSign] = useState<string>('GRAVE');
  const [lyricsModalOpen, setLyricsModalOpen] = useState<boolean>(false);

  // Active lyric line determined by currentTime
  const activeLyric: LyricLine =
    song.lyrics.slice().reverse().find((l) => currentTime >= l.timeSec) ||
    song.lyrics[0] || {
      id: 'fallback',
      timeSec: 0,
      durationSec: 6,
      textPt: 'Música do dispositivo',
      glosa: ['MÚSICA', 'RITMO', 'GRAVE'],
      activeGlosaIndex: 0,
      activeSign: 'MÚSICA',
      frequencyHz: 75,
      tactileDescription: 'Vibração rítmica.',
      section: 'MÚSICA',
    };

  // Dynamic real-time calculation of active glosa word and sign based on currentTime elapsed inside the active phrase!
  const lineElapsed = Math.max(0, currentTime - activeLyric.timeSec);
  const lineDuration = Math.max(0.5, activeLyric.durationSec || 6);
  const glosaTokens =
    activeLyric.glosa && activeLyric.glosa.length > 0 ? activeLyric.glosa : ['MÚSICA', 'RITMO'];
  const calculatedGlosaIndex = Math.min(
    glosaTokens.length - 1,
    Math.max(0, Math.floor((lineElapsed / lineDuration) * glosaTokens.length))
  );

  const currentActiveGlosaWord = glosaTokens[calculatedGlosaIndex] || glosaTokens[0] || 'MÚSICA';

  // Periodic subtle haptic impulse while playing
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round((60 / song.bpm) * 1000);
    const interval = setInterval(() => {
      hapticEngine.playTactilePulse(activeLyric.frequencyHz || 68, 80, hapticIntensity);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, song.bpm, activeLyric.frequencyHz, hapticIntensity]);

  // Handle waveform scrub click
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * song.durationSec;
    setCurrentTime(newTime);
    masterAudioPlayer.seek(newTime);
    hapticEngine.playTactilePulse(75, 120, hapticIntensity);
  };

  const progressPercent = (currentTime / song.durationSec) * 100;

  // Toggle Play
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      masterAudioPlayer.pause();
    } else {
      setIsPlaying(true);
      masterAudioPlayer.play(song, currentTime);
    }
    hapticEngine.triggerClickFeedback();
  };

  // Section quick jump
  const jumpToSection = (timeSec: number) => {
    setCurrentTime(timeSec);
    masterAudioPlayer.seek(timeSec);
    hapticEngine.playTactilePulse(70, 150, hapticIntensity);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 gap-4 pt-2">
      {/* Track Meta Header & Verification Stamp */}
      <div className="flex flex-col gap-2 bg-[#1b1b1f] p-4 rounded-xl border border-white/5 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full bg-[#00f2fe] shrink-0 ${
                isPlaying ? 'animate-ping' : 'animate-pulse'
              }`}
            />
            <h2 className="font-bold text-[17px] text-[#e4e1e7] truncate tracking-tight">
              {song.title}
            </h2>
            <span className="text-[#b9cacb] text-[13px] truncate">
              • {song.artist}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#353439] px-2.5 py-0.5 rounded-full shrink-0">
            <span className="material-symbols-outlined text-[#00f2fe] text-[14px]">
              speed
            </span>
            <span className="text-[11px] font-bold text-[#e0fdff] tracking-tight">
              {song.bpm} BPM
            </span>
          </div>
        </div>

        {/* Verified Badge & Latency */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2a292e] text-[#e0fdff] border border-white/5">
            <span
              className="material-symbols-outlined text-[15px] text-[#00f2fe]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#e4e1e7]">
              LIBRAS VERIFICADA: AVATAR 3D NEURAL IA
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1f1f24] text-[#b9cacb] border border-white/5">
            <span className="material-symbols-outlined text-[13px] text-[#dbb8ff]">
              sensors
            </span>
            <span className="text-[10px] font-semibold">MoCap 60 FPS • Latência 0.0ms</span>
          </div>
        </div>
      </div>

      {/* Main Video Player Section */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-[#0e0e12] border border-white/10 shadow-2xl flex flex-col group transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none max-w-none' : ''
        }`}
      >
        {/* Video Canvas Frame Container - Dedicated 3D Sign Language Avatar */}
        <div
          id="libras-video-box"
          className="relative w-full aspect-[16/10] bg-[#0e0e12] overflow-hidden flex items-center justify-center select-none"
        >
          <Avatar3DView
            activeSign={currentActiveGlosaWord}
            isPlaying={isPlaying}
            highContrast={highContrast}
            speed={speed}
            avatarStyle={avatarStyle}
            focusMode={isZoomed}
          />

          {/* Top Overlay Controls */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-2 pointer-events-auto z-10">
            {/* Live Sync Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0e12]/85 backdrop-blur-md text-[#00f2fe] border border-white/10 shadow-lg">
              <span
                className={`material-symbols-outlined text-[14px] text-[#00f2fe] ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              >
                graphic_eq
              </span>
              <span className="text-[10px] font-extrabold text-[#e4e1e7] tracking-wider uppercase">
                SINAL ATUAL: <span className="text-[#00f2fe]">{currentActiveGlosaWord}</span>
              </span>
            </div>

            {/* Floating Video Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsZoomed(!isZoomed);
                  hapticEngine.triggerClickFeedback();
                }}
                className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                  isZoomed
                    ? 'bg-[#00f2fe] text-[#00373a] shadow-[0_0_12px_#00f2fe]'
                    : 'bg-[#2a292e]/90 text-[#e4e1e7] hover:bg-[#353439]'
                }`}
                title="Foco Mãos & Expressão Facial (Avatar 3D)"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">
                  center_focus_strong
                </span>
              </button>

              <button
                onClick={() => {
                  setIsPip(!isPip);
                  hapticEngine.triggerClickFeedback();
                }}
                className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                  isPip
                    ? 'bg-[#ff4b89] text-[#590026]'
                    : 'bg-[#2a292e]/90 text-[#e4e1e7] hover:bg-[#353439]'
                }`}
                title="Picture-in-Picture"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">
                  picture_in_picture_alt
                </span>
              </button>

              <button
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  hapticEngine.triggerClickFeedback();
                }}
                className="w-8 h-8 rounded-full bg-[#2a292e]/90 backdrop-blur-md text-[#e4e1e7] hover:bg-[#353439] flex items-center justify-center active:scale-95 transition-all"
                title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>
          </div>

          {/* Central Play/Pause button on hover/tap */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            <span className="material-symbols-outlined text-[32px] text-[#00f2fe]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Live Tactile Cue Banner (Lower Overlay) */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0e0e12]/90 backdrop-blur-md border border-white/10 shadow-lg z-10">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e9d2ff] text-[#8132d2] shrink-0">
                <span className="material-symbols-outlined text-[16px] animate-pulse">
                  vibration
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#dbb8ff] uppercase tracking-wider">
                  Sinal Ativo em Libras
                </span>
                <span className="text-[14px] font-extrabold text-[#e4e1e7] leading-tight">
                  {activeLyric.activeSign}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-right">
              <span className="text-[11px] font-mono font-bold text-[#00dce6] bg-[#00f2fe]/10 px-2 py-0.5 rounded-md">
                Pulso: {activeLyric.frequencyHz}Hz
              </span>
            </div>
          </div>
        </div>

        {/* Video Sub-Bar: Avatar Style Presets & Speed Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#2a292e] border-t border-white/5">
          {/* Avatar 3D Style Switcher */}
          <div className="flex items-center bg-[#1f1f24] p-0.5 rounded-full border border-white/5">
            <button
              onClick={() => {
                setAvatarStyle('realistic');
                hapticEngine.triggerClickFeedback();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                avatarStyle === 'realistic'
                  ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                  : 'text-[#b9cacb] hover:text-[#e4e1e7]'
              }`}
              type="button"
              title="Avatar Humano Realista & Alta Visibilidade"
            >
              <span className="material-symbols-outlined text-[13px]">person</span>
              <span>Humano 3D</span>
            </button>

            <button
              onClick={() => {
                setAvatarStyle('contrast');
                hapticEngine.triggerClickFeedback();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                avatarStyle === 'contrast'
                  ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                  : 'text-[#b9cacb] hover:text-[#e4e1e7]'
              }`}
              type="button"
              title="Modo Contorno de Alto Contraste"
            >
              <span className="material-symbols-outlined text-[13px]">contrast</span>
              <span>Contraste Mãos</span>
            </button>

            <button
              onClick={() => {
                setAvatarStyle('holographic');
                hapticEngine.triggerClickFeedback();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                avatarStyle === 'holographic'
                  ? 'bg-[#ff4b89] text-[#590026] shadow-sm'
                  : 'text-[#b9cacb] hover:text-[#e4e1e7]'
              }`}
              type="button"
              title="Modo Holográfico 3D"
            >
              <span className="material-symbols-outlined text-[13px]">blur_on</span>
              <span>Holograma</span>
            </button>
          </div>

          {/* Speed Selector Pills */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-[#b9cacb] mr-0.5">
              Velocidade:
            </span>
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setSpeed(spd);
                  masterAudioPlayer.setSpeed(spd);
                  hapticEngine.triggerClickFeedback();
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                  speed === spd
                    ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                    : 'bg-[#1f1f24] text-[#b9cacb] hover:text-white'
                }`}
                type="button"
              >
                {spd.toFixed(spd % 1 === 0 ? 1 : 2)}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tactile Waveform Progress Bar */}
      <div className="flex flex-col gap-2 bg-[#1f1f24] p-4 rounded-xl border border-white/5 shadow-md">
        <div className="flex items-center justify-between text-[#b9cacb] text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff4b89] animate-ping" />
            <span className="text-[#ffb1c3] tracking-wider uppercase">
              {activeLyric.section}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlay}
              className="px-2 py-0.5 rounded-md bg-[#2a292e] text-[#00f2fe] hover:bg-[#353439] flex items-center gap-1 text-[11px]"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlaying ? 'PAUSAR' : 'TOCAR'}</span>
            </button>

            <span className="text-[#e4e1e7] font-mono">
              {formatTime(currentTime)}
            </span>
            <span>/</span>
            <span className="font-mono">{formatTime(song.durationSec)}</span>
          </div>
        </div>

        {/* Multi-frequency Waveform & Scrubber Track */}
        <div
          id="waveform-track"
          onClick={handleWaveformClick}
          className="relative w-full h-12 bg-[#0e0e12] rounded-lg p-1 flex items-center justify-between gap-0.5 overflow-hidden cursor-pointer border border-white/5 group"
        >
          {/* Simulated Dynamic Frequency Bars */}
          <div className="absolute inset-0 flex items-center justify-around px-2 opacity-85 pointer-events-none">
            {[
              { h: 'h-3', c: 'bg-[#dbb8ff]' },
              { h: 'h-5', c: 'bg-[#00dce6]' },
              { h: 'h-8', c: 'bg-[#ff4b89]', p: true },
              { h: 'h-4', c: 'bg-[#dbb8ff]' },
              { h: 'h-10', c: 'bg-[#00f2fe]' },
              { h: 'h-6', c: 'bg-[#ff4b89]' },
              { h: 'h-9', c: 'bg-[#00f2fe]', p: true },
              { h: 'h-3', c: 'bg-[#dbb8ff]' },
              { h: 'h-7', c: 'bg-[#00dce6]' },
              { h: 'h-11', c: 'bg-[#ff4b89]' },
              { h: 'h-5', c: 'bg-[#dbb8ff]' },
              { h: 'h-8', c: 'bg-[#00f2fe]' },
              { h: 'h-4', c: 'bg-[#dbb8ff]' },
              { h: 'h-10', c: 'bg-[#ff4b89]' },
              { h: 'h-6', c: 'bg-[#00f2fe]' },
              { h: 'h-3', c: 'bg-[#dbb8ff]' },
              { h: 'h-7', c: 'bg-[#00dce6]' },
              { h: 'h-9', c: 'bg-[#ff4b89]' },
              { h: 'h-4', c: 'bg-[#dbb8ff]' },
              { h: 'h-6', c: 'bg-[#00f2fe]' },
            ].map((bar, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${bar.h} ${bar.c} ${
                  isPlaying && bar.p ? 'animate-pulse scale-y-125' : ''
                }`}
              />
            ))}
          </div>

          {/* Scrubber Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#00f2fe] shadow-[0_0_12px_#00f2fe] flex items-center justify-center transition-all duration-75"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-[#e4e1e7] ring-2 ring-[#00f2fe] shadow-md transform -translate-x-[0.5px]" />
          </div>
        </div>

        {/* Haptic Section Markers */}
        <div className="flex items-center justify-between text-[#b9cacb] text-[10px] font-bold pt-0.5 px-1">
          <button
            onClick={() => jumpToSection(0)}
            className="hover:text-[#00f2fe] text-[#dbb8ff] transition-colors"
          >
            Intro [00:00]
          </button>
          <button
            onClick={() => jumpToSection(45)}
            className="hover:text-[#00f2fe] text-[#00f2fe] transition-colors"
          >
            Estrofe A [00:45]
          </button>
          <button
            onClick={() => jumpToSection(90)}
            className="hover:text-[#00f2fe] text-[#ffd9e0] transition-colors"
          >
            Refrão [01:30]
          </button>
          <button
            onClick={() => jumpToSection(140)}
            className="hover:text-[#00f2fe] text-[#b9cacb] transition-colors"
          >
            Ponte [02:20]
          </button>
        </div>
      </div>

      {/* Synchronized Libras Transcription Panel */}
      <div className="flex flex-col gap-3 bg-[#2a292e] p-4 rounded-xl border border-white/5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#00f2fe]">
              translate
            </span>
            <h3 className="font-bold text-[13px] text-[#00f2fe] tracking-wider uppercase">
              Glosa Sincronizada em Libras
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setLyricsModalOpen(true);
                hapticEngine.triggerClickFeedback();
              }}
              className="flex items-center gap-1 text-[#00f2fe] hover:text-white font-bold text-[11px] bg-[#00f2fe]/10 hover:bg-[#00f2fe]/20 px-2 py-0.5 rounded-full border border-[#00f2fe]/30 transition-colors"
              type="button"
              title="Personalizar Letra ou Gerar Tradução em Libras"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              <span>Letra & Tradutor IA</span>
            </button>

            <button
              onClick={() => {
                setSelectedDictSign(currentActiveGlosaWord || 'GRAVE');
                setDictOpen(true);
                hapticEngine.triggerClickFeedback();
              }}
              className="flex items-center gap-1 text-[#ffb1c3] hover:text-white font-bold text-[11px] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">menu_book</span>
              <span>Dicionário do Sinal</span>
            </button>
          </div>
        </div>

        {/* Active Sign Glosa Tokens */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#0e0e12] rounded-lg border border-white/5">
          {glosaTokens.map((token, idx) => {
            const isActiveToken = idx === calculatedGlosaIndex;
            return (
              <React.Fragment key={token + idx}>
                {idx > 0 && (
                  <span
                    className={`material-symbols-outlined text-[12px] ${
                      idx <= calculatedGlosaIndex ? 'text-[#00f2fe]' : 'text-white/20'
                    }`}
                  >
                    chevron_right
                  </span>
                )}
                <button
                  onClick={() => {
                    const tokenTime =
                      activeLyric.timeSec +
                      (idx / Math.max(1, glosaTokens.length)) * activeLyric.durationSec;
                    jumpToSection(tokenTime);
                    setSelectedDictSign(token);
                    hapticEngine.playTactilePulse(75, 200, hapticIntensity);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] transition-all font-bold flex items-center gap-1 ${
                    isActiveToken
                      ? 'bg-[#00f2fe] text-[#00373a] text-[13px] font-extrabold shadow-[0_0_12px_rgba(0,242,254,0.6)] scale-105 ring-2 ring-white/50'
                      : idx < calculatedGlosaIndex
                      ? 'bg-[#1b1b1f] text-[#00f2fe] border border-[#00f2fe]/30'
                      : 'bg-[#1b1b1f] text-[#b9cacb] hover:text-white hover:bg-[#353439] border border-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isActiveToken ? 'sign_language' : 'radio_button_checked'}
                  </span>
                  <span>{token}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Natural Portuguese Lyric Equivalent */}
        <div className="flex flex-col gap-1 pl-2 border-l-2 border-[#ff4b89]">
          <span className="text-[10px] uppercase font-bold text-[#b9cacb] tracking-wider">
            Letra em Português
          </span>
          <p className="font-bold text-[16px] text-[#e4e1e7] leading-snug">
            {activeLyric.textPt}
          </p>
        </div>

        {/* Haptic Tactile Description */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1f1f24] text-[#dbb8ff] border border-white/5">
          <span className="material-symbols-outlined text-[18px] text-[#e9d2ff] shrink-0 mt-0.5">
            touch_app
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold uppercase text-[#e4e1e7] tracking-wider">
              Padrão Tátil Transmitido
            </span>
            <span className="text-[12px] text-[#b9cacb] leading-relaxed mt-0.5">
              {activeLyric.tactileDescription}
            </span>
          </div>
        </div>
      </div>

      {/* Libras Accessibility & Sensory Controls */}
      <div className="flex flex-col gap-3 bg-[#1b1b1f] p-4 rounded-xl border border-white/5 shadow-md">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ffb1c3]">
              tune
            </span>
            <h4 className="font-bold text-[13px] text-[#e4e1e7]">
              Ajustes Visuais & Táteis
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#00f2fe]">
            Predefinição Otimizada
          </span>
        </div>

        {/* High Contrast Background Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#1f1f24] border border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#e0fdff]">
              contrast
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] text-[#e4e1e7]">
                Fundo Alto Contraste
              </span>
              <span className="text-[11px] text-[#b9cacb]">
                Fundo ultra-escuro com contorno luminoso no intérprete
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setHighContrast(!highContrast);
              hapticEngine.triggerClickFeedback();
            }}
            aria-pressed={highContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
              highContrast ? 'bg-[#00f2fe]' : 'bg-[#353439]'
            }`}
            type="button"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-[#00373a] transition-transform shadow ${
                highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Haptic Intensity on Sign Transition Slider */}
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#1f1f24] border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ffb1c3]">
                waves
              </span>
              <span className="font-bold text-[13px] text-[#e4e1e7]">
                Intensidade de Troca de Sinal
              </span>
            </div>
            <span className="text-[12px] font-bold font-mono text-[#ff4b89]">
              Nível {hapticIntensity} / 10
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="material-symbols-outlined text-[13px] text-[#b9cacb]">
              fiber_manual_record
            </span>
            <input
              className="w-full h-2 bg-[#0e0e12] rounded-lg appearance-none cursor-pointer accent-[#ff4b89]"
              type="range"
              min="1"
              max="10"
              value={hapticIntensity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setHapticIntensity(val);
                masterAudioPlayer.setIntensity(val);
                hapticEngine.playTactilePulse(68, 60, val);
              }}
            />
            <span className="material-symbols-outlined text-[16px] text-[#ff4b89]">
              bolt
            </span>
          </div>
        </div>

        {/* Live Device Speaker & Smartphone Vibration Active Cue */}
        <div className="p-3 rounded-lg bg-[#131317] border border-[#00f2fe]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`material-symbols-outlined text-[20px] ${isPlaying ? 'text-[#ff4b89] animate-bounce' : 'text-[#00f2fe]'}`}>
              vibration
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-[#e0fdff] truncate">
                Vibração Rítmica do Celular & Alto-Falante
              </span>
              <span className="text-[10px] text-[#b9cacb] truncate">
                {isPlaying
                  ? `Pulsando fisicamente a ${song.bpm} BPM no chassi do aparelho`
                  : 'Toque para testar vibração física rítmica'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              // Fire tactile test sequence
              hapticEngine.playTactilePulse(55, 120, hapticIntensity);
              setTimeout(() => hapticEngine.playTactilePulse(68, 90, hapticIntensity), 220);
              setTimeout(() => hapticEngine.playTactilePulse(50, 160, hapticIntensity), 440);
            }}
            className="px-2.5 py-1 rounded-md bg-[#2a292e] hover:bg-[#353439] text-[#00f2fe] text-[11px] font-bold border border-white/5 active:scale-95 transition-all shrink-0"
            type="button"
          >
            Testar Vibração
          </button>
        </div>
      </div>

      {/* Sign Dictionary Drawer Modal */}
      <SignDictionaryModal
        initialSignKey={selectedDictSign}
        isOpen={dictOpen}
        onClose={() => setDictOpen(false)}
      />

      {/* Lyrics & Libras Translator Modal */}
      {onUpdateSongLyrics && (
        <LyricsTranslatorModal
          isOpen={lyricsModalOpen}
          onClose={() => setLyricsModalOpen(false)}
          song={song}
          onSaveLyrics={onUpdateSongLyrics}
        />
      )}
    </div>
  );
};
