import React, { useState } from 'react';

interface TeleConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const TeleConsultModal: React.FC<TeleConsultModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [callActive, setCallActive] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [camMuted, setCamMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="neu-flat rounded-3xl p-space-lg max-w-2xl w-full space-y-space-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">videocam</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Encrypted Rural Tele-Cardiology Bridge
              </h2>
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                WEBRTC HD • E2EE ABDM CERTIFIED
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neu-flat p-2 rounded-xl text-on-surface-variant hover:text-on-surface transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center neu-concave-deep">
          {callActive ? (
            <div className="relative w-full h-full flex flex-col justify-between p-4">
              {/* Doctor Main Feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  alt="Dr. Rajesh Varma Tele-Consult feed"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6EIPtDhXbj0owZsrHvTZxFNgF6dFjy0VINN9z6PNqNQJNIswnxtTHxDQ8z8_lEDvO6ms07J-K1cbWjr6Fr1PbgKvW4aR1mTgAPpjTDBn1UlUFKzUUZ2t69kzbgboGcnt5mOOw5cXQdE-oPNoRJc3s_UIC5gcDPNDgaqA_H_ob1Rs48tlH0Nt8Ou1DywNtwdWcXJATTzsDHOmULvcjbJwnQ2rx-o-4lirNshUYv-aLTzeM_Lmjuw"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Top HUD */}
              <div className="relative z-10 flex items-center justify-between text-white font-label-sm text-label-sm bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Dr. Rajesh Varma (Cardiology Nodal Hub)
                </span>
                <span className="font-mono">BITRATE: 1.8 Mbps • 1080p</span>
              </div>

              {/* PiP View (Field Patient / ASHA) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden neu-flat border-2 border-primary shadow-xl z-20">
                <img
                  alt="Patient Sunita Devi with ASHA worker"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WF-sehcUw6akjeHrvgu1X37OJxv0Km2XF8WP26S08-WRudXtdqdyRbgQllm_wt6yK86hJCETLrFn7OKANXJ9eZTlIoORPHtiQouLXnN6bHObo3e-UVo_e3IT6ep_HwZ0a93lR1Unq9Ug0eoa_99vxyWmWjTCaBBNWuRB95saer7mz1NTsImNYYWkfwplndOwCiczQ1y_2JP5AMv-zDb3MclXfwCF73qeJhZ_TGRpBWWWJuLsEqV5w"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white px-1 font-mono text-center">
                  Sub-Center Niphad
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">call_end</span>
              <span>Tele-Consult session ended.</span>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-space-md pt-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              micMuted ? 'neu-inset text-tertiary' : 'neu-flat text-on-surface hover:text-primary'
            }`}
            title="Mute/Unmute Mic"
          >
            <span className="material-symbols-outlined text-[22px]">
              {micMuted ? 'mic_off' : 'mic'}
            </span>
          </button>

          <button
            onClick={() => setCamMuted(!camMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              camMuted ? 'neu-inset text-tertiary' : 'neu-flat text-on-surface hover:text-primary'
            }`}
            title="Toggle Video Camera"
          >
            <span className="material-symbols-outlined text-[22px]">
              {camMuted ? 'videocam_off' : 'videocam'}
            </span>
          </button>

          <button
            onClick={() => {
              setCallActive(false);
              onShowToast('Tele-Consult Terminated', 'Call record archived into ABDM encounter log.', 'info');
              setTimeout(onClose, 800);
            }}
            className="neu-crimson-pill px-6 py-3 rounded-full flex items-center gap-2 text-on-tertiary font-bold text-body-sm active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">call_end</span>
            <span>End Consult</span>
          </button>
        </div>
      </div>
    </div>
  );
};
