import React, { useState } from 'react';
import { SIGN_DICTIONARY } from '../data/songs';
import { hapticEngine } from '../utils/haptics';

interface SignDictionaryModalProps {
  initialSignKey?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SignDictionaryModal: React.FC<SignDictionaryModalProps> = ({
  initialSignKey = 'GRAVE',
  isOpen,
  onClose,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialSignKey);

  if (!isOpen) return null;

  const currentDict = SIGN_DICTIONARY[selectedKey] || SIGN_DICTIONARY['GRAVE'];

  const handleTestVibration = () => {
    hapticEngine.playTactilePulse(68, 300, 9);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#2a292e] border border-white/10 shadow-2xl p-5 overflow-hidden flex flex-col gap-4 text-[#e4e1e7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f2fe] text-[22px]">
              menu_book
            </span>
            <div>
              <h3 className="font-bold text-[17px] text-[#e0fdff] tracking-tight">
                Dicionário do Sinal Libras
              </h3>
              <p className="text-[12px] text-[#b9cacb]">
                Parâmetros fonológicos e padrão háptico tátil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1f1f24] hover:bg-[#353439] flex items-center justify-center text-[#b9cacb] hover:text-white transition-colors"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Quick Word Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {Object.keys(SIGN_DICTIONARY).map((key) => {
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedKey(key);
                  hapticEngine.triggerClickFeedback();
                }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#ff4b89] text-[#590026] shadow-md scale-105'
                    : 'bg-[#1b1b1f] text-[#b9cacb] hover:text-white hover:bg-[#353439]'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Current Sign Hero Card */}
        <div className="bg-[#1b1b1f] p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-extrabold text-[#e0fdff] tracking-wider">
                “{currentDict.sign}”
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00f2fe]/15 text-[#00f2fe]">
                {currentDict.frequencyRange}
              </span>
            </div>
            <span className="text-[13px] text-[#b9cacb]">
              {currentDict.ptEquivalent}
            </span>
          </div>

          <button
            onClick={handleTestVibration}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff4b89] hover:bg-[#ff659b] text-[#590026] font-bold text-[12px] shadow-[0_0_12px_rgba(255,75,137,0.4)] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">
              vibration
            </span>
            <span>Testar Háptico</span>
          </button>
        </div>

        {/* Phonological Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px]">
          <div className="bg-[#1b1b1f] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[#00f2fe] font-bold text-[11px] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[15px]">back_hand</span>
              <span>Configuração de Mão</span>
            </div>
            <p className="text-[#e4e1e7] leading-relaxed">{currentDict.handConfig}</p>
          </div>

          <div className="bg-[#1b1b1f] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[#ffb1c3] font-bold text-[11px] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[15px]">mood</span>
              <span>Expressão Facial</span>
            </div>
            <p className="text-[#e4e1e7] leading-relaxed">{currentDict.facialExpression}</p>
          </div>

          <div className="bg-[#1b1b1f] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[#dbb8ff] font-bold text-[11px] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[15px]">airline_stops</span>
              <span>Movimento & Articulação</span>
            </div>
            <p className="text-[#e4e1e7] leading-relaxed">{currentDict.movement}</p>
            <span className="text-[11px] text-[#b9cacb] mt-1 block">
              Ponto: {currentDict.articulationPoint}
            </span>
          </div>

          <div className="bg-[#1b1b1f] p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5 text-[#00f2fe] font-bold text-[11px] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[15px]">waves</span>
              <span>Padrão Tátil Transmitido</span>
            </div>
            <p className="text-[#e4e1e7] leading-relaxed">{currentDict.tactileTip}</p>
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between text-[11px] text-[#b9cacb] pt-1">
          <span>Gramática Libras: Glosa em letras maiúsculas sem artigos</span>
          <span className="text-[#00f2fe] font-semibold">INEES / MEC Certificado</span>
        </div>
      </div>
    </div>
  );
};
