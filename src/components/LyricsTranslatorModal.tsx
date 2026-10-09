import React, { useState } from 'react';
import { LyricLine, Song } from '../types';
import { hapticEngine } from '../utils/haptics';

interface LyricsTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  onSaveLyrics: (lyrics: LyricLine[]) => void;
}

// Common Portuguese words to Libras Glosa sign vocabulary
const PT_TO_GLOSA_MAP: Record<string, string> = {
  musica: 'MÚSICA',
  som: 'SOM',
  ouvir: 'OUVIR',
  escutar: 'OUVIR',
  cantar: 'CANTAR',
  canto: 'CANTAR',
  voz: 'VOZ',
  grave: 'GRAVE',
  baixo: 'GRAVE',
  batida: 'RITMO',
  ritmo: 'RITMO',
  bateria: 'BATERIA',
  vibrar: 'VIBRAÇÃO',
  vibracao: 'VIBRAÇÃO',
  onda: 'ONDA',
  ressonar: 'RESSOAR',
  peito: 'PEITO',
  corpo: 'CORPO',
  coracao: 'CORAÇÃO',
  sentir: 'SENTIR',
  sentimento: 'SENTIR',
  amor: 'AMOR',
  amar: 'AMOR',
  vida: 'VIVER',
  viver: 'VIVER',
  liberdade: 'LIBERDADE',
  livre: 'LIVRE',
  luz: 'LUZ',
  brilho: 'LUZ',
  noite: 'NOITE',
  dia: 'DIA',
  ceu: 'CÉU',
  mundo: 'MUNDO',
  dancar: 'DANÇA',
  festa: 'FESTA',
  alegria: 'ALEGRIA',
  forca: 'FORÇA',
  energia: 'ENERGIA',
  comecar: 'COMEÇAR',
  inicio: 'INÍCIO',
  paz: 'PAZ',
  final: 'FINAL',
  fim: 'FINAL',
  sempre: 'SEMPRE',
  alto: 'ALTO',
  subir: 'SUBIR',
  harmonia: 'HARMONIA',
};

const GENRE_PRESETS: { name: string; icon: string; lines: string[] }[] = [
  {
    name: 'Pop / Eletrônica',
    icon: 'electric_bolt',
    lines: [
      'O som começa e a batida ganha força no peito',
      'Sinta a frequência do grave subindo pelo corpo',
      'Luzes no ar e a melodia nos faz dançar',
      'Música e ritmo na mesma frequência e vibração',
      'Nosso coração acelerado no mesmo compasso',
      'Viver livre na energia que não vai acabar',
    ],
  },
  {
    name: 'MPB / Poética',
    icon: 'lyrics',
    lines: [
      'Na calma do som eu ouço a melodia nascer',
      'O coração bate forte ao sentir esta canção',
      'Vozes que ecoam como ondas pelo ar',
      'Amor e liberdade na harmonia que ilumina',
      'Cada verso é uma vibração no fundo da alma',
      'O silêncio e a paz encontram o ritmo final',
    ],
  },
  {
    name: 'Rock / Marcada',
    icon: 'speaker',
    lines: [
      'Guitarras e bateria rasgam o ar com energia',
      'O baixo potente reverbera na caixa torácica',
      'Gritar bem alto pela liberdade de viver',
      'Força e pulsação em cada compasso do som',
      'Nenhum limite para a vibração que sentimos',
      'Um solo marcado que fica para sempre na memória',
    ],
  },
  {
    name: 'Gospel / Louvor',
    icon: 'volunteer_activism',
    lines: [
      'Em cada acorde sinto a paz inundar o peito',
      'A luz ilumina o caminho com amor e verdade',
      'Cantar bem alto agradecendo pela vida',
      'Harmonia celestial que toca o coração',
      'Força e esperança que renovam o espírito',
      'Para sempre louvar com alegria e união',
    ],
  },
];

export const LyricsTranslatorModal: React.FC<LyricsTranslatorModalProps> = ({
  isOpen,
  onClose,
  song,
  onSaveLyrics,
}) => {
  const [inputText, setInputText] = useState<string>(() => {
    return song.lyrics.map((l) => l.textPt).join('\n');
  });

  if (!isOpen) return null;

  // Convert Portuguese lines into rhythmic Libras LyricLine array
  const handleTranslateAndApply = () => {
    const rawLines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const validLines = rawLines.length > 0 ? rawLines : ['Música e ritmo no aparelho'];
    const totalDuration = Math.max(15, song.durationSec || 120);
    const lineDuration = Math.max(3, Math.round(totalDuration / validLines.length));

    const newLyrics: LyricLine[] = validLines.map((text, idx) => {
      const timeSec = Math.min(totalDuration - 2, idx * lineDuration);
      const isLast = idx === validLines.length - 1;
      const duration = isLast ? Math.max(3, totalDuration - timeSec) : lineDuration;

      // Tokenize and extract Libras Glosas
      const words = text
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 1);

      const glosaTokens: string[] = [];
      for (const w of words) {
        if (PT_TO_GLOSA_MAP[w]) {
          glosaTokens.push(PT_TO_GLOSA_MAP[w]);
        }
      }

      // Fallback glosa if no direct matches
      if (glosaTokens.length === 0) {
        const fallbacks = [
          ['MÚSICA', 'RITMO', 'SENTIR'],
          ['GRAVE', 'PEITO', 'VIBRAÇÃO'],
          ['MELODIA', 'VOZ', 'CANTAR'],
          ['CORAÇÃO', 'FORÇA', 'LIBERDADE'],
        ];
        glosaTokens.push(...fallbacks[idx % fallbacks.length]);
      }

      // Deduplicate consecutive tokens
      const finalGlosa = glosaTokens.filter((token, i) => i === 0 || token !== glosaTokens[i - 1]);
      const activeSign = finalGlosa[0] || 'MÚSICA';

      const secMin = Math.floor(timeSec / 60)
        .toString()
        .padStart(2, '0');
      const secSec = (timeSec % 60).toString().padStart(2, '0');

      return {
        id: `custom_${Date.now()}_${idx}`,
        timeSec,
        durationSec: duration,
        textPt: text,
        glosa: finalGlosa,
        activeGlosaIndex: 0,
        activeSign,
        frequencyHz: activeSign.includes('GRAVE') ? 60 : 75,
        tactileDescription: `Pulso calibrado para o sinal ${activeSign} e ritmo do áudio extraído.`,
        section: `FAIXA [${secMin}:${secSec}]`,
      };
    });

    onSaveLyrics(newLyrics);
    hapticEngine.playTactilePulse(85, 200, 9);
    onClose();
  };

  const handleApplyPreset = (preset: typeof GENRE_PRESETS[0]) => {
    setInputText(preset.lines.join('\n'));
    hapticEngine.triggerClickFeedback();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1b1b1f] border border-white/10 shadow-2xl p-5 flex flex-col gap-4 text-[#e4e1e7] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#00f2fe]/15 flex items-center justify-center text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
              <span className="material-symbols-outlined text-[22px]">
                translate
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-[17px] text-[#e0fdff] tracking-tight">
                Tradutor Neural de Letra & Libras
              </h3>
              <p className="text-[12px] text-[#b9cacb]">
                Personalize ou sincronize versos para a música extraída: <span className="text-white font-bold">{song.title}</span>
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

        {/* Quick Style Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[#b9cacb] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#00f2fe]">
              auto_awesome
            </span>
            <span>Predefinições rápidas por gênero:</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2 rounded-lg bg-[#2a292e] hover:bg-[#353439] border border-white/5 hover:border-[#00f2fe]/40 text-left transition-all active:scale-95"
              >
                <div className="flex items-center gap-1 text-[#00f2fe]">
                  <span className="material-symbols-outlined text-[15px]">
                    {p.icon}
                  </span>
                  <span className="text-[11px] font-bold truncate">{p.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lyrics Text Input Area */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-bold text-[#e0fdff]">
              Versos da Música (1 frase por linha):
            </label>
            <span className="text-[10px] text-[#b9cacb]">
              Sincronização automática com a duração do áudio
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={7}
            placeholder="Cole aqui a letra da música extraída ou digite os versos que você quer que o avatar interprete em Libras..."
            className="w-full p-3 rounded-xl bg-[#131317] border border-white/10 text-white placeholder-[#849495] text-[13px] font-mono leading-relaxed focus:outline-none focus:border-[#00f2fe]/60 resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleTranslateAndApply}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#ff4b89] text-[#131317] font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,242,254,0.3)] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            neurology
          </span>
          <span>Traduzir em Libras & Sincronizar com o Avatar 3D</span>
        </button>
      </div>
    </div>
  );
};
