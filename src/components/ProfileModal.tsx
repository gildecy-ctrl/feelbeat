import React from 'react';
import { hapticEngine } from '../utils/haptics';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContacts: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenContacts,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#1f1f24] border border-white/10 shadow-2xl p-5 flex flex-col gap-4 text-[#e4e1e7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile Card */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00f2fe]/40 shadow-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-KxUI3eYBDIL5yWqkWrZWClsuY5iMejemgklU8_ZQTKDoYrLbnsvXbJzcCrinj9lSKO3j1wxQbMfOnFBV0IvdF0HI65vzyMvoydmZRKx272lCr66kCKI6EiQKc_JqcDaqn8LljWrlDFOq8rvHnPhRDGBnQ_tCRNfAbbWOnKLAyvHo0fLDdNNGza3FNnwnXkI5HCpNsUm0eCAsBojvX_cMugaP5Mk6bmS1Nn8Sg8a5qXiaGfYxVZk93g"
            />
            <div>
              <h3 className="font-bold text-[16px] text-[#e0fdff]">
                Gildecy Santos
              </h3>
              <p className="text-[12px] text-[#00f2fe] font-semibold">
                Perfil Sensorial & Libras Ativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2a292e] hover:bg-[#353439] flex items-center justify-center text-[#b9cacb] hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Accessibility Preferences */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-[#b9cacb] uppercase tracking-wider">
            Preferências de Acessibilidade
          </span>

          <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#00f2fe]">
                sign_language
              </span>
              <div>
                <span className="text-[13px] font-bold block">
                  Exibição de Libras Padrão
                </span>
                <span className="text-[11px] text-[#b9cacb]">
                  Avatar 3D Neural MoCap em Tempo Real (Prioritário)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#00f2fe]">Ativado</span>
          </div>

          <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ff4b89]">
                vibration
              </span>
              <div>
                <span className="text-[13px] font-bold block">
                  Feedback Háptico do Dispositivo
                </span>
                <span className="text-[11px] text-[#b9cacb]">
                  Web Vibration API no navegador & celular
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#ff4b89]">Ligado</span>
          </div>

          <div className="p-3 rounded-xl bg-[#1b1b1f] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#dbb8ff]">
                subtitles
              </span>
              <div>
                <span className="text-[13px] font-bold block">
                  Glosa com Destaque Fonológico
                </span>
                <span className="text-[11px] text-[#b9cacb]">
                  Exibir parâmetros de mão e movimento
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#dbb8ff]">Ativo</span>
          </div>
        </div>

        {/* Manage Contacts Button */}
        <button
          onClick={() => {
            onClose();
            onOpenContacts();
          }}
          className="w-full py-2.5 rounded-xl bg-[#00f2fe]/15 hover:bg-[#00f2fe]/25 text-[#00f2fe] text-[12px] font-bold flex items-center justify-center gap-2 border border-[#00f2fe]/30 transition-colors"
        >
          <span className="material-symbols-outlined text-[17px]">
            contacts
          </span>
          <span>Gerenciar Contatos & Intérpretes (CRUD)</span>
        </button>

        {/* Quick Vibration Test */}
        <button
          onClick={() => hapticEngine.playTactilePulse(68, 400, 10)}
          className="w-full py-2.5 rounded-xl bg-[#2a292e] hover:bg-[#353439] text-[#e0fdff] text-[12px] font-bold flex items-center justify-center gap-2 border border-white/5"
        >
          <span className="material-symbols-outlined text-[16px] text-[#00f2fe]">
            touch_app
          </span>
          <span>Testar Vibração Háptica Agora</span>
        </button>

        {/* Footer */}
        <div className="text-center text-[11px] text-[#b9cacb] pt-1">
          FeelBeat v2.4 • Desenvolvido para a comunidade Surda
        </div>
      </div>
    </div>
  );
};
