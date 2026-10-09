import React, { useState, useEffect } from 'react';
import { HapticDevice } from '../types';
import { hapticEngine } from '../utils/haptics';
import { masterAudioPlayer } from '../utils/audioPlayer';

interface HapticDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  hapticIntensity: number;
  setHapticIntensity: (val: number) => void;
}

const DEFAULT_DEVICES: HapticDevice[] = [
  {
    id: 'woojer-1',
    name: 'Woojer Vest 3 Pro',
    type: 'Colete de Transdução Corporal (8 Motores)',
    battery: 92,
    connected: true,
    latencyMs: 0.2,
    hapticFrequency: '15 Hz – 250 Hz',
  },
  {
    id: 'ring-1',
    name: 'FeelBeat Pulse Ring X1',
    type: 'Anel Tátil de Falanges (Micro-LRA)',
    battery: 84,
    connected: true,
    latencyMs: 0.0,
    hapticFrequency: '40 Hz – 300 Hz',
  },
  {
    id: 'subpac-1',
    name: 'SubPac M2X Tactile Back',
    type: 'Assento Ressonante Háptico',
    battery: 100,
    connected: false,
    latencyMs: 1.1,
    hapticFrequency: '5 Hz – 130 Hz',
  },
];

export const HapticDeviceModal: React.FC<HapticDeviceModalProps> = ({
  isOpen,
  onClose,
  hapticIntensity,
  setHapticIntensity,
}) => {
  const [devices, setDevices] = useState<HapticDevice[]>(DEFAULT_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<string>('woojer-1');
  const [selectedStem, setSelectedStem] = useState<string>('bass'); // 'bass' | 'vocals' | 'drums' | 'synths'
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [pairingStatus, setPairingStatus] = useState<string | null>(null);

  useEffect(() => {
    setIsStreaming(hapticEngine.getIsStreaming());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleStream = () => {
    if (isStreaming) {
      hapticEngine.stopExtractedStemStream();
      setIsStreaming(false);
    } else {
      const activeDev = devices.find((d) => d.id === selectedDevice);
      if (activeDev) {
        hapticEngine.routeToAudioSink(activeDev.id);
        masterAudioPlayer.setSinkId(activeDev.id);
      }
      hapticEngine.startExtractedStemStream(selectedStem, 68, hapticIntensity);
      setIsStreaming(true);
    }
  };

  const handleStemChange = (stem: string) => {
    setSelectedStem(stem);
    if (isStreaming) {
      hapticEngine.startExtractedStemStream(stem, 68, hapticIntensity);
    }
    hapticEngine.triggerClickFeedback();
  };

  const handleScanBluetooth = async () => {
    setPairingStatus('Buscando dispositivos Bluetooth próximos...');
    hapticEngine.triggerClickFeedback();
    const result = await hapticEngine.requestBluetoothPairing();
    if (result.success && result.name) {
      const newDev: HapticDevice = {
        id: 'bt_' + Date.now(),
        name: result.name,
        type: 'Dispositivo de Áudio / Háptico Bluetooth',
        battery: 100,
        connected: true,
        latencyMs: 0.1,
        hapticFrequency: '20 Hz – 20.000 Hz',
      };
      setDevices((prev) => [newDev, ...prev]);
      setSelectedDevice(newDev.id);
      setPairingStatus(`Conectado com sucesso a: ${result.name}`);
    } else {
      setPairingStatus(result.error || 'Nenhum dispositivo selecionado.');
    }
    setTimeout(() => {
      setPairingStatus(null);
    }, 4000);
  };

  const toggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
    hapticEngine.triggerClickFeedback();
  };

  const activeTargetName =
    devices.find((d) => d.id === selectedDevice)?.name || 'Dispositivo Bluetooth';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1f1f24] border border-white/10 shadow-2xl p-5 flex flex-col gap-4 text-[#e4e1e7] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00f2fe]/15 flex items-center justify-center text-[#00f2fe]">
              <span className="material-symbols-outlined text-[20px]">
                bluetooth_audio
              </span>
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#e0fdff]">
                Enviar Áudio Extraído para Bluetooth
              </h3>
              <p className="text-[12px] text-[#b9cacb]">
                Transmissão direta de Stems para coletes táteis e fones
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

        {/* Pairing notification */}
        {pairingStatus && (
          <div className="p-2.5 rounded-xl bg-[#00f2fe]/15 border border-[#00f2fe]/30 text-[12px] text-[#e0fdff] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#00f2fe]">info</span>
            <span>{pairingStatus}</span>
          </div>
        )}

        {/* Transmit to Bluetooth Panel */}
        <div className="bg-[#131317] p-4 rounded-xl border border-white/10 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-[#00f2fe] animate-ping' : 'bg-white/20'}`} />
              <span className="text-[13px] font-extrabold text-[#e0fdff]">
                Status da Transmissão de Áudio
              </span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isStreaming ? 'bg-[#00f2fe]/20 text-[#00f2fe]' : 'bg-[#2a292e] text-[#b9cacb]'}`}>
              {isStreaming ? 'STREAMING ATIVO' : 'PAUSADO'}
            </span>
          </div>

          {/* Stem Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#b9cacb] uppercase tracking-wider">
              Áudio Extraído a Enviar:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-bold">
              {[
                { id: 'bass', label: 'Baixo / Sub (68Hz)', color: '#dbb8ff' },
                { id: 'vocals', label: 'Vocais / Libras', color: '#ff4b89' },
                { id: 'drums', label: 'Bateria / Transientes', color: '#00f2fe' },
                { id: 'synths', label: 'Harmonia / Synths', color: '#ffd9e0' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStemChange(s.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedStem === s.id
                      ? 'bg-[#2a292e] border-[#00f2fe] text-white shadow-[0_0_12px_rgba(0,242,254,0.3)] scale-[1.02]'
                      : 'bg-[#1b1b1f] border-white/5 text-[#b9cacb] hover:text-white'
                  }`}
                >
                  <span className="block text-[10px] truncate" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Target device selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#b9cacb] uppercase tracking-wider">
              Dispositivo Bluetooth de Destino:
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => {
                setSelectedDevice(e.target.value);
                hapticEngine.routeToAudioSink(e.target.value);
              }}
              className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#e4e1e7] focus:outline-none focus:border-[#00f2fe]"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.connected ? '(Conectado • 0.0ms)' : '(Desconectado)'}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Master CTA */}
          <button
            onClick={handleToggleStream}
            className={`w-full py-3 rounded-xl font-extrabold text-[13px] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              isStreaming
                ? 'bg-[#ff4b89] text-[#590026] shadow-[0_0_20px_rgba(255,75,137,0.5)]'
                : 'bg-gradient-to-r from-[#00f2fe] to-[#ff4b89] text-[#0e0e12] hover:opacity-95'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isStreaming ? 'stop_circle' : 'cast_connected'}
            </span>
            <span>
              {isStreaming
                ? `Pausar Envio para ${activeTargetName}`
                : `Enviar Áudio Extraído para ${activeTargetName}`}
            </span>
          </button>
        </div>

        {/* Intensity calibration */}
        <div className="bg-[#131317] p-3.5 rounded-xl border border-white/5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-bold text-[#e0fdff]">
              Ganho do Transdutor & Sensibilidade Tátil
            </span>
            <span className="font-mono font-bold text-[#ff4b89]">
              Nível {hapticIntensity} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={hapticIntensity}
            onChange={(e) => {
              const val = Number(e.target.value);
              setHapticIntensity(val);
              if (isStreaming) {
                hapticEngine.startExtractedStemStream(selectedStem, 68, val);
              }
            }}
            className="w-full h-2 bg-[#2a292e] rounded-lg appearance-none cursor-pointer accent-[#ff4b89]"
          />
        </div>

        {/* SMARTPHONE VIBRATION & SPEAKER CONE RESONANCE (Physical feedback when no Bluetooth is connected) */}
        <div className="bg-[#131317] p-4 rounded-xl border border-[#ff4b89]/30 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff4b89] text-[20px] animate-pulse">
                vibration
              </span>
              <h4 className="font-extrabold text-[13px] text-[#e0fdff]">
                Vibração do Celular & Caixa de Som
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff4b89]/20 text-[#ff4b89] uppercase">
              RITMO EM TEMPO REAL
            </span>
          </div>

          {/* Phone Physical Vibration Switch */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1f1f24] border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[#00f2fe] text-[18px]">
                smartphone
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-[#e4e1e7] truncate">
                  Vibrador Físico do Celular (Sem Bluetooth)
                </span>
                <span className="text-[10px] text-[#b9cacb] truncate">
                  Vibra no compasso do ritmo do áudio extraído
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#00f2fe] shrink-0">
              ATIVADO
            </span>
          </div>

          {/* Loudspeaker Cone Resonance Switch */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1f1f24] border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[#dbb8ff] text-[18px]">
                speaker
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-[#e4e1e7] truncate">
                  Ressonância Física na Caixa de Som
                </span>
                <span className="text-[10px] text-[#b9cacb] truncate">
                  +16dB de sub-harmônicos que tremem o alto-falante na mão
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#dbb8ff] shrink-0">
              ATIVADO
            </span>
          </div>

          {/* Test Button */}
          <button
            onClick={() => {
              // Trigger a 3-beat rhythmic vibration and speaker resonance burst
              hapticEngine.playTactilePulse(55, 120, hapticIntensity);
              setTimeout(() => hapticEngine.playTactilePulse(68, 90, hapticIntensity), 240);
              setTimeout(() => hapticEngine.playTactilePulse(50, 160, hapticIntensity), 480);
            }}
            className="w-full py-2.5 rounded-xl bg-[#2a292e] hover:bg-[#353439] text-[#e0fdff] font-bold text-[12px] flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00f2fe]">
              sensors
            </span>
            <span>Testar Vibração Rítmica do Celular & Caixa de Som</span>
          </button>
        </div>

        {/* Devices list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#b9cacb] uppercase tracking-wider">
              Dispositivos Pareados & Detectados
            </span>
            <button
              onClick={handleScanBluetooth}
              className="flex items-center gap-1 text-[11px] text-[#00f2fe] font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">bluetooth_searching</span>
              <span>Parear Novo Bluetooth</span>
            </button>
          </div>

          {devices.map((device) => {
            const isTarget = selectedDevice === device.id;
            return (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isTarget
                    ? 'bg-[#2a292e] border-[#00f2fe]/40 ring-1 ring-[#00f2fe]/30'
                    : 'bg-[#1b1b1f] border-white/5 hover:bg-[#25252a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      device.connected
                        ? 'bg-[#00f2fe]/20 text-[#00f2fe]'
                        : 'bg-white/5 text-[#b9cacb]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {device.connected ? 'bluetooth_connected' : 'bluetooth_disabled'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#e4e1e7] leading-tight">
                      {device.name}
                    </h4>
                    <p className="text-[11px] text-[#b9cacb]">{device.type}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#b9cacb] mt-0.5">
                      <span>Bateria: {device.battery}%</span>
                      <span>•</span>
                      <span className="text-[#00f2fe]">Latência: {device.latencyMs}ms</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isTarget && (
                    <span className="text-[10px] font-bold text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded-md">
                      Destino Ativo
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDevice(device.id);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      device.connected
                        ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30'
                        : 'bg-[#2a292e] text-[#b9cacb]'
                    }`}
                  >
                    {device.connected ? 'Ativo' : 'Conectar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-[#b9cacb]">
          <span>Protocolo MIDI Tátil LE & Web Audio Sink</span>
          <span className="text-[#00f2fe] font-bold">Taxa de Amostragem 48 kHz</span>
        </div>
      </div>
    </div>
  );
};
