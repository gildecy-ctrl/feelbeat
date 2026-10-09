import React from 'react';
import { Song } from '../types';
import { hapticEngine, formatTime } from '../utils/haptics';
import { masterAudioPlayer } from '../utils/audioPlayer';

interface LyricsScreenProps {
  song: Song;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  hapticIntensity: number;
}

export const LyricsScreen: React.FC<LyricsScreenProps> = ({
  song,
  currentTime,
  setCurrentTime,
  isPlaying,
  hapticIntensity,
}) => {
  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 gap-4 pt-2">
      {/* Header Info */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1b1b1f] border border-white/5">
        <div>
          <h2 className="text-[17px] font-bold text-[#e0fdff]">{song.title}</h2>
          <p className="text-[12px] text-[#b9cacb]">
            Letras em Português & Glosa Libras Sincronizada
          </p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4b89]/15 text-[#ff4b89] text-[11px] font-bold">
          <span className="material-symbols-outlined text-[14px]">vibration</span>
          <span>Karaokê Tátil</span>
        </div>
      </div>

      {/* Lyrics Stream List */}
      <div className="flex flex-col gap-3">
        {song.lyrics.map((line) => {
          const isActive =
            currentTime >= line.timeSec &&
            currentTime < line.timeSec + line.durationSec;

          return (
            <div
              key={line.id}
              onClick={() => {
                setCurrentTime(line.timeSec);
                masterAudioPlayer.seek(line.timeSec);
                hapticEngine.playTactilePulse(line.frequencyHz, 150, hapticIntensity);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2a292e] border-[#ff4b89]/50 shadow-[0_0_20px_rgba(255,75,137,0.15)] scale-[1.01]'
                  : 'bg-[#1b1b1f]/70 border-white/5 hover:bg-[#1f1f24] opacity-75'
              }`}
            >
              {/* Section tag & timestamp */}
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span
                  className={`font-bold tracking-wider uppercase ${
                    isActive ? 'text-[#ff4b89]' : 'text-[#b9cacb]'
                  }`}
                >
                  {line.section}
                </span>
                <span className="font-mono text-[#b9cacb]">
                  {formatTime(line.timeSec)}
                </span>
              </div>

              {/* Portuguese line */}
              <p
                className={`text-[16px] font-bold leading-snug transition-colors ${
                  isActive ? 'text-white' : 'text-[#b9cacb]'
                }`}
              >
                {line.textPt}
              </p>

              {/* Libras Glosa Tokens */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-[#00f2fe] uppercase tracking-wider mr-1">
                  Glosa:
                </span>
                {line.glosa.map((token, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isActive && i === line.activeGlosaIndex
                        ? 'bg-[#ff4b89] text-[#590026] shadow-sm'
                        : 'bg-[#131317] text-[#e0fdff]'
                    }`}
                  >
                    {token}
                  </span>
                ))}
              </div>

              {/* Tactile transmission cue */}
              {isActive && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-[#0e0e12]/80 text-[11px] text-[#dbb8ff]">
                  <span className="material-symbols-outlined text-[15px] text-[#ff4b89]">
                    sensors
                  </span>
                  <span>{line.tactileDescription}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
