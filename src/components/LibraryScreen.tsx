import React, { useState } from 'react';
import { Song } from '../types';
import { hapticEngine } from '../utils/haptics';

interface LibraryScreenProps {
  songs: Song[];
  currentSongId: string;
  onSelectSong: (song: Song) => void;
  onOpenLibras: () => void;
  onOpenExtractor: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  songs,
  currentSongId,
  onSelectSong,
  onOpenLibras,
  onOpenExtractor,
}) => {
  const [bpmFilter, setBpmFilter] = useState<'all' | 'slow' | 'mid' | 'fast'>('all');
  const [search, setSearch] = useState('');

  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (bpmFilter === 'slow') return s.bpm < 100;
    if (bpmFilter === 'mid') return s.bpm >= 100 && s.bpm <= 128;
    if (bpmFilter === 'fast') return s.bpm > 128;
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pb-28 gap-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1b1b1f] border border-white/5">
        <div>
          <h2 className="text-[17px] font-bold text-[#e0fdff]">
            Biblioteca de Faixas
          </h2>
          <p className="text-[12px] text-[#b9cacb]">
            Músicas certificadas e áudios extraídos do aparelho
          </p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4b89]/15 text-[#ff4b89] text-[11px] font-bold">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>{songs.length} Faixas</span>
        </div>
      </div>

      {/* EXTRACT AUDIO FROM LOCAL DEVICE CTA CARD */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1f1f24] via-[#2a292e] to-[#1f1f24] border border-[#00f2fe]/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center shrink-0 border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
            <span className="material-symbols-outlined text-[22px]">audio_file</span>
          </div>
          <div>
            <h3 className="font-extrabold text-[14px] text-[#e0fdff]">
              Extrair Áudio do Seu Dispositivo
            </h3>
            <p className="text-[11px] text-[#b9cacb]">
              Faça upload de qualquer MP3, WAV, gravação ou vídeo do aparelho
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onOpenExtractor();
            hapticEngine.triggerClickFeedback();
          }}
          className="px-4 py-2.5 rounded-xl bg-[#00f2fe] hover:bg-[#6ff6ff] text-[#00373a] font-extrabold text-[12px] flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.3)] active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[17px]">upload_file</span>
          <span>Extrair do Aparelho</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-[#b9cacb]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por faixa ou artista..."
          className="w-full bg-[#1f1f24] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#e4e1e7] placeholder-[#b9cacb] focus:outline-none focus:border-[#00f2fe]"
        />
      </div>

      {/* BPM Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setBpmFilter('all');
            hapticEngine.triggerClickFeedback();
          }}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            bpmFilter === 'all'
              ? 'bg-[#00f2fe] text-[#00373a]'
              : 'bg-[#1b1b1f] text-[#b9cacb] hover:text-white'
          }`}
        >
          Todos os BPMs
        </button>
        <button
          onClick={() => {
            setBpmFilter('slow');
            hapticEngine.triggerClickFeedback();
          }}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            bpmFilter === 'slow'
              ? 'bg-[#00f2fe] text-[#00373a]'
              : 'bg-[#1b1b1f] text-[#b9cacb] hover:text-white'
          }`}
        >
          Lento (&lt;100 BPM)
        </button>
        <button
          onClick={() => {
            setBpmFilter('mid');
            hapticEngine.triggerClickFeedback();
          }}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            bpmFilter === 'mid'
              ? 'bg-[#00f2fe] text-[#00373a]'
              : 'bg-[#1b1b1f] text-[#b9cacb] hover:text-white'
          }`}
        >
          Moderado (100-128 BPM)
        </button>
        <button
          onClick={() => {
            setBpmFilter('fast');
            hapticEngine.triggerClickFeedback();
          }}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            bpmFilter === 'fast'
              ? 'bg-[#00f2fe] text-[#00373a]'
              : 'bg-[#1b1b1f] text-[#b9cacb] hover:text-white'
          }`}
        >
          Rápido (&gt;128 BPM)
        </button>
      </div>

      {/* Song list */}
      <div className="flex flex-col gap-2.5">
        {filteredSongs.map((song) => {
          const isSelected = song.id === currentSongId;
          const isLocal = song.id.startsWith('local_');

          return (
            <div
              key={song.id}
              onClick={() => {
                onSelectSong(song);
                hapticEngine.playTactilePulse(song.bpm > 120 ? 80 : 60, 150, 8);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#2a292e] border-[#00f2fe]/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-[#00f2fe]/30'
                  : 'bg-[#1b1b1f] border-white/5 hover:bg-[#1f1f24]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img
                    alt={song.title}
                    src={song.coverUrl}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px] text-[#00f2fe] animate-pulse">
                        graphic_eq
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[14px] text-[#e4e1e7] truncate">
                      {song.title}
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#00f2fe]/10 text-[#00f2fe] shrink-0">
                      {song.bpm} BPM
                    </span>
                  </div>

                  <span className="text-[12px] text-[#b9cacb] truncate">
                    {song.artist}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] mt-0.5">
                    <span
                      className={`material-symbols-outlined text-[13px] ${isLocal ? 'text-[#00f2fe]' : 'text-[#ff4b89]'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isLocal ? 'smartphone' : 'verified'}
                    </span>
                    <span className={`truncate ${isLocal ? 'text-[#00f2fe]' : 'text-[#ffb1c3]'}`}>
                      {isLocal ? 'Áudio Extraído do Aparelho' : `Intérprete: ${song.interpreterName}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSelected ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLibras();
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#00f2fe] text-[#00373a] text-[11px] font-bold shadow-md hover:opacity-90"
                  >
                    Ver Libras
                  </button>
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-[#b9cacb]">
                    chevron_right
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
