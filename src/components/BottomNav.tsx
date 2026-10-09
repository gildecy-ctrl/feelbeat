import React from 'react';

export type TabType = 'player' | 'letras' | 'stems-ia' | 'libras' | 'biblioteca';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: TabType; label: string; icon: string; badge?: string }[] = [
    { id: 'player', label: 'Player', icon: 'album' },
    { id: 'letras', label: 'Letras', icon: 'subtitles' },
    { id: 'stems-ia', label: 'Stems IA', icon: 'tune' },
    { id: 'libras', label: 'Libras', icon: 'sign_language' },
    { id: 'biblioteca', label: 'Biblioteca', icon: 'folder_special', badge: 'BPM' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#0e0e12]/92 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-14 relative transition-all active:scale-90 ${
                isActive
                  ? 'text-[#00f2fe] font-bold'
                  : 'text-[#b9cacb] hover:text-[#e4e1e7]'
              }`}
              type="button"
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[23px] transition-transform"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {tab.icon}
                </span>

                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full bg-[#ff4b89] text-[#590026] text-[8px] font-extrabold leading-tight uppercase shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight truncate">
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
