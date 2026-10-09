import React from 'react';

interface HeaderProps {
  onOpenHaptics: () => void;
  onOpenProfile: () => void;
  onOpenContacts: () => void;
  onOpenExtractor?: () => void;
  isPlaying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHaptics,
  onOpenProfile,
  onOpenContacts,
  onOpenExtractor,
  isPlaying,
}) => {
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#131317]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="h-16 max-w-5xl mx-auto px-4 flex items-center justify-between gap-2.5">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            alt="FeelBeat Logo"
            className="h-7 w-auto object-contain shrink-0"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XcJhhUuzOmbC36MRBpWnTeSYyfNmhRKkucLZaoy2_jMxn0sj28G8LRWcP96esXrkG4Ed065zOk7ErYVmLsUrjs6T0_UFkt6LWUrWPdtWt730TwEYOMi-WHBR4JMKX215UYIUiFZXZFIjSGhEYItrPzHsIWsn3kp7JxZF-iRwLWJD9kx64d2gvzlLQbWFOQRlSTKuW78gBwHrkqBYJunMCOlSBhZf7x4JTLrvuQoSYmeqdLF_m02nlBCm75"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[#e0fdff] font-extrabold text-[17px] tracking-tight truncate">
                FeelBeat
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full bg-[#00f2fe] shrink-0 ${
                  isPlaying ? 'animate-ping' : 'animate-pulse'
                }`}
              />
            </div>
            <h1 className="text-[#b9cacb] text-[10px] uppercase tracking-wider font-semibold truncate">
              Tradução Em Libras Com Vídeo Sincronizado
            </h1>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Extrair Audio Button */}
          {onOpenExtractor && (
            <button
              onClick={onOpenExtractor}
              className="flex items-center gap-1 bg-gradient-to-r from-[#00f2fe]/20 to-[#ff4b89]/20 hover:from-[#00f2fe]/30 hover:to-[#ff4b89]/30 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(0,242,254,0.3)] border border-[#00f2fe]/40 active:scale-95 transition-all text-[#e0fdff]"
              type="button"
              title="Extrair qualquer áudio ou vídeo do aparelho"
            >
              <span className="material-symbols-outlined text-[#00f2fe] text-[15px]">
                audio_file
              </span>
              <span className="text-[#00f2fe] text-[10px] font-extrabold tracking-wider hidden xs:inline">
                EXTRAIR
              </span>
            </button>
          )}

          {/* Contatos CRUD pill */}
          <button
            onClick={onOpenContacts}
            className="flex items-center gap-1 bg-[#2a292e]/90 hover:bg-[#353439] px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(219,184,255,0.2)] border border-[#dbb8ff]/30 active:scale-95 transition-all"
            type="button"
            title="Gerenciar Contatos & Intérpretes (CRUD)"
          >
            <span className="material-symbols-outlined text-[#dbb8ff] text-[15px]">
              contacts
            </span>
            <span className="text-[#efdbff] text-[10px] font-bold tracking-wider hidden xs:inline">
              CONTATOS
            </span>
          </button>

          {/* Haptic indicator pill */}
          <button
            onClick={onOpenHaptics}
            className="flex items-center gap-1 bg-[#2a292e]/90 hover:bg-[#353439] px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(0,242,254,0.2)] border border-[#00f2fe]/20 active:scale-95 transition-all"
            type="button"
            title="Calibração Háptica"
          >
            <span className="material-symbols-outlined text-[#00f2fe] text-[15px] animate-pulse">
              vibration
            </span>
            <span className="text-[#00f2fe] text-[10px] font-bold tracking-wider hidden sm:inline">
              HAPTIC ON
            </span>
          </button>

          {/* Bluetooth Sync pill */}
          <button
            onClick={onOpenHaptics}
            className="hidden md:flex items-center gap-1 bg-[#2a292e]/90 hover:bg-[#353439] px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(255,75,137,0.2)] border border-[#ff4b89]/20 active:scale-95 transition-all"
            type="button"
            title="Dispositivos Bluetooth"
          >
            <span className="material-symbols-outlined text-[#ff4b89] text-[15px]">
              bluetooth_connected
            </span>
            <span className="text-[#ffd9e0] text-[10px] font-bold tracking-wider">
              BT SYNC
            </span>
          </button>

          {/* Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 flex items-center justify-center shrink-0 rounded-full focus:outline-none hover:ring-2 hover:ring-[#00f2fe]/50 active:scale-95 transition-all"
            type="button"
            title="Perfil de Acessibilidade"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-[0_0_8px_rgba(219,184,255,0.4)] ring-1 ring-white/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-KxUI3eYBDIL5yWqkWrZWClsuY5iMejemgklU8_ZQTKDoYrLbnsvXbJzcCrinj9lSKO3j1wxQbMfOnFBV0IvdF0HI65vzyMvoydmZRKx272lCr66kCKI6EiQKc_JqcDaqn8LljWrlDFOq8rvHnPhRDGBnQ_tCRNfAbbWOnKLAyvHo0fLDdNNGza3FNnwnXkI5HCpNsUm0eCAsBojvX_cMugaP5Mk6bmS1Nn8Sg8a5qXiaGfYxVZk93g"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
