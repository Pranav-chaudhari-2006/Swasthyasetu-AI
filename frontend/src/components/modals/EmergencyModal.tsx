import React, { useState } from 'react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'confirmed'>('idle');

  if (!isOpen) return null;

  const handleConfirmDispatch = () => {
    setDispatchStatus('transmitting');
    setTimeout(() => {
      setDispatchStatus('confirmed');
      onShowToast(
        '108 MEMS ALS Ambulance Dispatched',
        'Unit MH-12-AX-8910 assigned to Sunita Devi. ETA: 8 minutes with Police Green Wave active.',
        'emergency'
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="neu-flat rounded-3xl p-space-lg max-w-xl w-full space-y-space-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px] animate-pulse">e911_emergency</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                108 MEMS Emergency Bridge
              </h2>
              <span className="font-label-sm text-label-sm text-tertiary font-bold uppercase tracking-wider">
                MAHARASHTRA STATE CAD INTEGRATED
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

        {/* Patient Emergency Triage Specimen */}
        <div className="neu-concave-deep p-space-md rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
              TRIAGE INCIDENT BRIEF
            </span>
            <span className="neu-crimson-pill px-2.5 py-0.5 rounded-full font-label-sm text-label-sm text-on-tertiary font-bold">
              CODE AMBER-HIGH
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-body-sm font-medium text-on-surface">
            <div>
              <span className="font-label-sm text-on-surface-variant block">Patient</span>
              <strong>Sunita Devi (42y / F)</strong>
            </div>
            <div>
              <span className="font-label-sm text-on-surface-variant block">ABHA ID</span>
              <strong className="font-mono">91-4201-9982-1029</strong>
            </div>
            <div>
              <span className="font-label-sm text-on-surface-variant block">Sector Sub-Center</span>
              <strong>Niphad Rural Block, Nashik</strong>
            </div>
            <div>
              <span className="font-label-sm text-on-surface-variant block">Field Worker</span>
              <strong>ASHA Anita Bai (#MH-401)</strong>
            </div>
          </div>
        </div>

        {/* Assigned Ambulance details */}
        <div className="neu-inset p-space-md rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl neu-flat flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-[26px]">ambulance</span>
            </div>
            <div>
              <span className="font-headline-sm text-body-md font-bold text-on-surface block">
                ALS Unit: MH-12-AX-8910
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                Pilot: S. Kulkarni · Stationed at Pimpalgaon Bypass (8m away)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-label-sm text-[10px] text-primary uppercase font-bold block">
              STATUS
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              {dispatchStatus === 'confirmed' ? 'EN ROUTE' : 'HOT STANDBY'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-space-sm pt-2">
          {dispatchStatus !== 'confirmed' ? (
            <button
              onClick={handleConfirmDispatch}
              disabled={dispatchStatus === 'transmitting'}
              className="neu-crimson-pill w-full py-3.5 px-space-md rounded-2xl text-on-tertiary font-headline-sm text-body-md font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">
                {dispatchStatus === 'transmitting' ? 'sync' : 'notification_important'}
              </span>
              <span>
                {dispatchStatus === 'transmitting'
                  ? 'Transmitting CAD Dispatch Order...'
                  : 'Transmit Mandatory ALS Ambulance Dispatch'}
              </span>
            </button>
          ) : (
            <div className="neu-inset p-space-md rounded-2xl flex items-center gap-2 text-primary font-bold justify-center">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>Dispatch Acknowledged by State 108 CAD • GPS Live</span>
            </div>
          )}

          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
            <span>Intercom Relay: #8812</span>
            <span>Emergency Toll-Free: 108 / 112</span>
          </div>
        </div>
      </div>
    </div>
  );
};
