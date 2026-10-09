import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { extractAudioFromFile, generateDemoAudioFile } from '../utils/audioExtractor';
import { hapticEngine, formatTime } from '../utils/haptics';

interface AudioExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSongExtracted: (song: Song) => void;
}

export const AudioExtractorModal: React.FC<AudioExtractorModalProps> = ({
  isOpen,
  onClose,
  onSongExtracted,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'mic'>('file');

  // File extraction state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [extractedSong, setExtractedSong] = useState<Song | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio preview state
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio preview when modal closes
  useEffect(() => {
    if (!isOpen && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPreviewPlaying(false);
    }
  }, [isOpen]);

  // Clean up recording interval on unmount
  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Process a selected or generated file directly
  const processFileDirectly = async (file: File) => {
    setSelectedFile(file);
    setExtractedSong(null);
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStep(1);
    hapticEngine.playTactilePulse(70, 150, 7);

    try {
      // Step 1: Decode
      const step1Timer = setTimeout(() => setProcessingStep(2), 400);
      // Step 2: BPM & Spectrum
      const step2Timer = setTimeout(() => setProcessingStep(3), 900);
      // Step 3: Stem Isolation
      const step3Timer = setTimeout(() => setProcessingStep(4), 1400);

      const result = await extractAudioFromFile(file);

      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setProcessingStep(4);

      setTimeout(() => {
        setExtractedSong(result.song);
        setIsProcessing(false);
        hapticEngine.playTactilePulse(80, 250, 9);
      }, 700);
    } catch (err: unknown) {
      console.warn('Process file notice:', err);
      setIsProcessing(false);
      setErrorMessage('Não foi possível ler este arquivo específico. Tente outro formato ou use os áudios de teste abaixo.');
    }
  };

  // Handle file selection from local device storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      hapticEngine.triggerClickFeedback();
      processFileDirectly(file);
    }
  };

  // Process one of the built-in device test clips
  const handleLoadDemoAudio = (genre: 'electronic' | 'rhythm' | 'acoustic') => {
    hapticEngine.triggerClickFeedback();
    const demoFile = generateDemoAudioFile(genre);
    processFileDirectly(demoFile);
  };

  // Start live microphone / device audio capture
  const handleStartRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detect best supported MIME type
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          mimeType = 'audio/aac';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const type = mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type });
        const ext = type.includes('mp4') ? 'mp4' : type.includes('aac') ? 'aac' : 'webm';
        const recordedFile = new File(
          [audioBlob],
          `Audio_Gravado_${new Date().toLocaleTimeString().replace(/:/g, '-')}.${ext}`,
          { type }
        );
        setSelectedFile(recordedFile);
        setActiveTab('file');

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Immediately start processing the recorded audio
        processFileDirectly(recordedFile);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      hapticEngine.playTactilePulse(80, 120, 8);

      recordIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('Permissão de microfone/áudio negada ou recurso não disponível neste navegador.');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      hapticEngine.triggerClickFeedback();
    }
  };

  // Confirm loading the extracted song into the app
  const handleLoadIntoFeelBeat = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (extractedSong) {
      onSongExtracted(extractedSong);
      hapticEngine.playTactilePulse(85, 200, 10);
      onClose();
    }
  };

  // Toggle preview playback
  const togglePreview = () => {
    if (!extractedSong?.audioUrl) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(extractedSong.audioUrl);
      previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
    }
    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => {
          setIsPreviewPlaying(true);
        })
        .catch((e) => {
          console.warn('Preview play notice:', e);
        });
    }
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
                audio_file
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-[17px] text-[#e0fdff] tracking-tight">
                Extrair Qualquer Áudio do Aparelho
              </h3>
              <p className="text-[12px] text-[#b9cacb]">
                Importe músicas locais, vídeos, gravações ou teste áudios com Stems & Libras
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

        {/* Source Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#131317] rounded-xl border border-white/5">
          <button
            onClick={() => {
              setActiveTab('file');
              hapticEngine.triggerClickFeedback();
            }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'file'
                ? 'bg-[#00f2fe] text-[#00373a] shadow-sm'
                : 'text-[#b9cacb] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            <span>Arquivo do Meu Aparelho</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mic');
              hapticEngine.triggerClickFeedback();
            }}
            className={`flex-1 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'mic'
                ? 'bg-[#ff4b89] text-[#590026] shadow-sm'
                : 'text-[#b9cacb] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Capturar Áudio ao Vivo</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#93000a]/30 border border-[#ffb4ab]/30 text-[#ffdad6] text-[12px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: FILE PICKER & DEMOS */}
        {activeTab === 'file' && (
          <div className="flex flex-col gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.mp4,.webm"
              className="hidden"
            />

            {/* Drop / Select zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-white/15 hover:border-[#00f2fe]/60 bg-[#131317]/80 hover:bg-[#1f1f24] cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#2a292e] group-hover:bg-[#00f2fe]/20 text-[#b9cacb] group-hover:text-[#00f2fe] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[26px]">
                  cloud_upload
                </span>
              </div>
              <div>
                <p className="font-bold text-[14px] text-[#e0fdff]">
                  {selectedFile ? selectedFile.name : 'Toque para selecionar qualquer áudio ou vídeo do aparelho'}
                </p>
                <p className="text-[11px] text-[#b9cacb] mt-0.5">
                  Suporta MP3, WAV, AAC, M4A, OGG, FLAC ou vídeos MP4 salvos no celular/computador
                </p>
              </div>

              {selectedFile && !isProcessing && (
                <div className="px-3 py-1 rounded-full bg-[#00f2fe]/10 text-[#00f2fe] text-[11px] font-bold border border-[#00f2fe]/30">
                  Arquivo: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>

            {/* Instant Test Clips Section */}
            <div className="p-3.5 rounded-xl bg-[#131317] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#b9cacb] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#00f2fe]">
                    bolt
                  </span>
                  <span>Ou extraia um áudio de demonstração com 1 toque:</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadDemoAudio('electronic')}
                  disabled={isProcessing}
                  className="p-2.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] border border-white/5 hover:border-[#00f2fe]/40 text-left transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-[12px] font-extrabold text-[#00f2fe] block">
                    🎧 Batida Sub-Grave
                  </span>
                  <span className="text-[10px] text-[#b9cacb] block">
                    128 BPM • Graves 55Hz
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadDemoAudio('rhythm')}
                  disabled={isProcessing}
                  className="p-2.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] border border-white/5 hover:border-[#ff4b89]/40 text-left transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-[12px] font-extrabold text-[#ff4b89] block">
                    🥁 Ritmo & Funk
                  </span>
                  <span className="text-[10px] text-[#b9cacb] block">
                    120 BPM • Percussão
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadDemoAudio('acoustic')}
                  disabled={isProcessing}
                  className="p-2.5 rounded-lg bg-[#2a292e] hover:bg-[#353439] border border-white/5 hover:border-[#dbb8ff]/40 text-left transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-[12px] font-extrabold text-[#dbb8ff] block">
                    🎸 Melodia Acústica
                  </span>
                  <span className="text-[10px] text-[#b9cacb] block">
                    96 BPM • Harmonia
                  </span>
                </button>
              </div>
            </div>

            {selectedFile && !isProcessing && !extractedSong && (
              <button
                onClick={() => processFileDirectly(selectedFile)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#ff4b89] text-[#131317] font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  psychology
                </span>
                <span>Iniciar Extração Neural & Separação de Stems</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: LIVE RECORDING */}
        {activeTab === 'mic' && (
          <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 flex flex-col items-center justify-center text-center gap-3">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-[#ff4b89] text-[#590026] shadow-[0_0_24px_rgba(255,75,137,0.7)] scale-110 animate-pulse'
                  : 'bg-[#2a292e] text-[#e0fdff]'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">
                {isRecording ? 'mic' : 'mic_none'}
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-[15px] text-[#e0fdff]">
                {isRecording ? 'Gravando Áudio do Aparelho...' : 'Capturar Som do Ambiente ou Dispositivo'}
              </h4>
              <p className="text-[12px] text-[#b9cacb]">
                {isRecording
                  ? `Tempo de gravação: ${formatTime(recordingSeconds)} (toque para finalizar e extrair)`
                  : 'Grave qualquer som, música ambiente ou reprodução do celular'}
              </p>
            </div>

            {/* Pulsing VU meter while recording */}
            {isRecording && (
              <div className="flex items-center gap-1.5 py-2">
                {[6, 14, 22, 10, 26, 16, 20, 8, 24, 12, 18].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-[#ff4b89] rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
                  />
                ))}
              </div>
            )}

            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`px-6 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 ${
                isRecording
                  ? 'bg-[#ff4b89] text-[#590026] shadow-md'
                  : 'bg-[#00f2fe] text-[#00373a] shadow-md'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRecording ? 'stop_circle' : 'fiber_manual_record'}
              </span>
              <span>{isRecording ? 'Parar e Extrair Automaticamente' : 'Começar a Gravar'}</span>
            </button>
          </div>
        )}

        {/* PROCESSING PROGRESS ANIMATION */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-[#131317] border border-[#00f2fe]/30 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#00f2fe] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-ping" />
                <span>Processando Áudio do Dispositivo...</span>
              </span>
              <span className="text-[11px] font-mono text-[#b9cacb]">Passo {processingStep} de 4</span>
            </div>

            {/* Stepper */}
            <div className="flex flex-col gap-2 text-[12px]">
              <div className={`flex items-center gap-2 ${processingStep >= 1 ? 'text-[#00f2fe] font-bold' : 'text-[#849495]'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {processingStep > 1 ? 'check_circle' : 'radio_button_checked'}
                </span>
                <span>1. Decodificação PCM e leitura do fluxo de áudio</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStep >= 2 ? 'text-[#00f2fe] font-bold' : 'text-[#849495]'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {processingStep > 2 ? 'check_circle' : 'radio_button_checked'}
                </span>
                <span>2. Detecção de BPM e análise espectral de frequências</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStep >= 3 ? 'text-[#00f2fe] font-bold' : 'text-[#849495]'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {processingStep > 3 ? 'check_circle' : 'radio_button_checked'}
                </span>
                <span>3. Separação neural de Stems (Baixo, Vocais, Bateria, Harmonia)</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStep >= 4 ? 'text-[#00f2fe] font-bold' : 'text-[#849495]'}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {processingStep === 4 ? 'sync' : 'radio_button_unchecked'}
                </span>
                <span>4. Mapeamento de Glosa em Libras e Calibração Háptica</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#2a292e] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f2fe] to-[#ff4b89] transition-all duration-300 rounded-full"
                style={{ width: `${processingStep * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* EXTRACTION RESULT CARD */}
        {extractedSong && !isProcessing && (
          <div className="p-4 rounded-xl bg-[#2a292e] border border-[#00f2fe]/40 shadow-xl flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#00f2fe] font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Áudio Extraído com Sucesso!</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4b89]/20 text-[#ff4b89]">
                {extractedSong.bpm} BPM
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-[16px] text-white">
                {extractedSong.title}
              </h4>
              <p className="text-[12px] text-[#b9cacb]">
                Duração: {formatTime(extractedSong.durationSec)} • {extractedSong.key}
              </p>
            </div>

            {/* Generated Stems Preview */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#1b1b1f] border border-white/5">
                <span className="text-[#dbb8ff] font-bold block">Baixo / Sub-Grave</span>
                <span className="text-[#b9cacb]">62Hz calibrado</span>
              </div>
              <div className="p-2 rounded-lg bg-[#1b1b1f] border border-white/5">
                <span className="text-[#ff4b89] font-bold block">Vocais & Libras</span>
                <span className="text-[#b9cacb]">Glosa sincronizada</span>
              </div>
              <div className="p-2 rounded-lg bg-[#1b1b1f] border border-white/5">
                <span className="text-[#00f2fe] font-bold block">Bateria Rítmica</span>
                <span className="text-[#b9cacb]">Transientes detectados</span>
              </div>
              <div className="p-2 rounded-lg bg-[#1b1b1f] border border-white/5">
                <span className="text-[#ffd9e0] font-bold block">Harmonia Stereo</span>
                <span className="text-[#b9cacb]">Pronto para Bluetooth</span>
              </div>
            </div>

            {/* Preview Audio Player Bar */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131317] border border-white/10">
              <button
                type="button"
                onClick={togglePreview}
                className="w-9 h-9 rounded-full bg-[#00f2fe] text-[#00373a] flex items-center justify-center shrink-0 hover:bg-[#6ff6ff] transition-all"
                title={isPreviewPlaying ? 'Pausar Prévia' : 'Ouvir Prévia'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isPreviewPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">
                  {isPreviewPlaying ? 'Reproduzindo Prévia do Áudio...' : 'Testar Reprodução de Áudio'}
                </p>
                <p className="text-[10px] text-[#b9cacb]">
                  {isPreviewPlaying ? 'Áudio tocando no aparelho' : 'Toque no play para ouvir o arquivo extraído'}
                </p>
              </div>
              {isPreviewPlaying && (
                <div className="flex items-center gap-1">
                  {[6, 14, 20, 10, 16].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-[#00f2fe] rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Final Action CTA */}
            <button
              onClick={handleLoadIntoFeelBeat}
              className="w-full py-3 rounded-xl bg-[#00f2fe] hover:bg-[#6ff6ff] text-[#00373a] font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,242,254,0.4)] active:scale-95 transition-all mt-1"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Tocar no FeelBeat & Enviar para Bluetooth</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-[#b9cacb]">
          <span>Formatos: MP3, WAV, AAC, M4A, OGG, FLAC, MP4</span>
          <span className="text-[#00f2fe] font-bold">100% Processamento Local</span>
        </div>
      </div>
    </div>
  );
};
