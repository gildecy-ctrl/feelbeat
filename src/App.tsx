/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { LibrasScreen } from './components/LibrasScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { LyricsScreen } from './components/LyricsScreen';
import { StemsScreen } from './components/StemsScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { HapticDeviceModal } from './components/HapticDeviceModal';
import { ProfileModal } from './components/ProfileModal';
import { ContactsCRUDModal } from './components/ContactsCRUDModal';
import { AudioExtractorModal } from './components/AudioExtractorModal';
import { SONGS_DATA } from './data/songs';
import { Song } from './types';
import { hapticEngine } from './utils/haptics';
import { masterAudioPlayer } from './utils/audioPlayer';

export default function App() {
  // Navigation tabs (defaults to 'libras' matching the original FeelBeat view)
  const [activeTab, setActiveTab] = useState<TabType>('libras');

  // Dynamic songs list initialized with curated catalog
  const [songsList, setSongsList] = useState<Song[]>(SONGS_DATA);

  // Active track state (defaults to 'Solaris Pulse')
  const [currentSong, setCurrentSong] = useState<Song>(SONGS_DATA[0]);

  // Current playback time: 102 seconds = 01:42 matching the screenshot
  const [currentTime, setCurrentTime] = useState<number>(102);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Haptic intensity: level 8 matching the screenshot (Nível 8 / 10)
  const [hapticIntensity, setHapticIntensity] = useState<number>(8);

  // Modals
  const [hapticModalOpen, setHapticModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [contactsModalOpen, setContactsModalOpen] = useState<boolean>(false);
  const [extractorModalOpen, setExtractorModalOpen] = useState<boolean>(false);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Wire masterAudioPlayer callbacks on mount
  useEffect(() => {
    masterAudioPlayer.setCallbacks(
      (time) => {
        setCurrentTime(time);
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );
    masterAudioPlayer.setIntensity(hapticIntensity);
  }, []);

  // Update intensity whenever changed
  const handleSetHapticIntensity = (val: number) => {
    setHapticIntensity(val);
    masterAudioPlayer.setIntensity(val);
  };

  // Continuous rhythmic physical vibration & speaker cone resonance loop
  useEffect(() => {
    if (isPlaying) {
      hapticEngine.startPlaybackRhythm(currentSong.bpm, 68, hapticIntensity);
    } else {
      hapticEngine.stopPlaybackRhythm();
    }
    return () => {
      hapticEngine.stopPlaybackRhythm();
    };
  }, [isPlaying, currentSong.bpm, hapticIntensity]);

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setCurrentTime(0);
    masterAudioPlayer.loadSong(song, 0, isPlaying);
    showToast(`Faixa carregada: "${song.title}"`);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    masterAudioPlayer.seek(newTime);
  };

  const handleUpdateSongLyrics = (newLyrics: LyricLine[]) => {
    const updated = { ...currentSong, lyrics: newLyrics };
    setCurrentSong(updated);
    setSongsList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast('Letra e tradução em Libras sincronizadas com sucesso!');
  };

  // Called when audio is extracted from device (file or mic)
  const handleSongExtracted = (newSong: Song) => {
    setSongsList((prev) => [newSong, ...prev.filter((s) => s.id !== newSong.id)]);
    setCurrentSong(newSong);
    setCurrentTime(0);
    setIsPlaying(true);

    // Immediately load and play the extracted song via MasterAudioPlayer
    masterAudioPlayer.loadSong(newSong, 0, true);

    // Navigate to Libras view to see the 3D avatar synchronously translating the extracted audio
    setActiveTab('libras');
    showToast(`Áudio extraído em reprodução: "${newSong.title}" com Libras e Stems!`);
  };

  return (
    <div className="min-h-screen bg-[#131317] text-[#e4e1e7] flex flex-col font-sans relative antialiased selection:bg-[#ff4b89] selection:text-white">
      {/* Fixed Header */}
      <Header
        onOpenHaptics={() => setHapticModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenContacts={() => setContactsModalOpen(true)}
        onOpenExtractor={() => setExtractorModalOpen(true)}
        isPlaying={isPlaying}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 z-50 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md animate-fade-in">
          <div className="p-3 rounded-xl bg-[#1b1b1f] border border-[#00f2fe]/40 shadow-2xl flex items-center justify-between gap-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#00f2fe] text-[20px] shrink-0">
                graphic_eq
              </span>
              <p className="text-[12px] font-bold text-[#e0fdff] truncate">
                {toastMessage}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#b9cacb] hover:text-white shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 flex flex-col items-center">
        {/* Extracted Audio Active Player Badge */}
        {currentSong.audioUrl && (
          <div className="w-full max-w-md mx-auto px-4 mt-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe]/10 via-[#1b1b1f] to-[#ff4b89]/10 border border-[#00f2fe]/30 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isPlaying ? 'bg-[#00f2fe] text-[#00373a] shadow-[0_0_12px_rgba(0,242,254,0.5)]' : 'bg-[#2a292e] text-[#b9cacb]'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {isPlaying ? 'volume_up' : 'music_note'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-extrabold text-white truncate">
                      {currentSong.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-[#00f2fe] text-[#00373a] shrink-0">
                      ÁUDIO DO APARELHO
                    </span>
                  </div>
                  <p className="text-[10px] text-[#b9cacb] truncate">
                    Reproduzindo áudio real com todas as configurações do app
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isPlaying) {
                      setIsPlaying(false);
                      masterAudioPlayer.pause();
                    } else {
                      setIsPlaying(true);
                      masterAudioPlayer.play(currentSong, currentTime);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all active:scale-95 ${
                    isPlaying
                      ? 'bg-[#ff4b89] text-[#590026] shadow-sm'
                      : 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlaying ? 'Pausar' : 'Tocar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'libras' && (
          <LibrasScreen
            song={currentSong}
            currentTime={currentTime}
            setCurrentTime={handleSeek}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            hapticIntensity={hapticIntensity}
            setHapticIntensity={handleSetHapticIntensity}
            onUpdateSongLyrics={handleUpdateSongLyrics}
          />
        )}

        {activeTab === 'player' && (
          <PlayerScreen
            song={currentSong}
            currentTime={currentTime}
            setCurrentTime={handleSeek}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            hapticIntensity={hapticIntensity}
            setHapticIntensity={handleSetHapticIntensity}
            onGoToLibras={() => setActiveTab('libras')}
          />
        )}

        {activeTab === 'letras' && (
          <LyricsScreen
            song={currentSong}
            currentTime={currentTime}
            setCurrentTime={handleSeek}
            isPlaying={isPlaying}
            hapticIntensity={hapticIntensity}
          />
        )}

        {activeTab === 'stems-ia' && (
          <StemsScreen
            song={currentSong}
            currentTime={currentTime}
            setCurrentTime={handleSeek}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            hapticIntensity={hapticIntensity}
            onOpenBluetoothModal={() => setHapticModalOpen(true)}
            onOpenExtractor={() => setExtractorModalOpen(true)}
            onGoToLibras={() => setActiveTab('libras')}
          />
        )}

        {activeTab === 'biblioteca' && (
          <LibraryScreen
            songs={songsList}
            currentSongId={currentSong.id}
            onSelectSong={handleSelectSong}
            onOpenLibras={() => setActiveTab('libras')}
            onOpenExtractor={() => setExtractorModalOpen(true)}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Haptic & Bluetooth Devices Modal */}
      <HapticDeviceModal
        isOpen={hapticModalOpen}
        onClose={() => setHapticModalOpen(false)}
        hapticIntensity={hapticIntensity}
        setHapticIntensity={handleSetHapticIntensity}
      />

      {/* Accessibility Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenContacts={() => setContactsModalOpen(true)}
      />

      {/* Gestão de Contatos & Intérpretes (CRUD) */}
      <ContactsCRUDModal
        isOpen={contactsModalOpen}
        onClose={() => setContactsModalOpen(false)}
        currentSongTitle={currentSong.title}
      />

      {/* Extrator de Áudio Qualquer do Dispositivo */}
      <AudioExtractorModal
        isOpen={extractorModalOpen}
        onClose={() => setExtractorModalOpen(false)}
        onSongExtracted={handleSongExtracted}
      />
    </div>
  );
}
