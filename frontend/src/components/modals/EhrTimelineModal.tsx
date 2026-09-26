import React from 'react';

interface EhrTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EhrTimelineModal: React.FC<EhrTimelineModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const events = [
    {
      time: 'Today 14:14 IST',
      title: 'Facility Referral Linked: District Civil Hospital, Nashik',
      desc: 'Bed #04 Locked for CCU transfer. 108 ALS unit MH-15-TC-402 assigned.',
      officer: 'Dr. Priya Deshmukh',
      tag: 'REFERRAL',
    },
    {
      time: 'Today 14:02 IST',
      title: 'Acoustic Dialect Intake & Telemetry Synchronization',
      desc: 'Bhashini Neural Listener processed ASHA Anita Bai clinical speech. Tachycardia & diaphoresis confirmed.',
      officer: 'ASHA Anita Bai',
      tag: 'TRIAGE',
    },
    {
      time: 'Today 13:45 IST',
      title: 'Point-of-Care 12-Lead ECG Acquired',
      desc: 'Lead II sinus tachycardia flagged with rate >100 bpm at rest.',
      officer: 'Community Nurse S. Phule',
      tag: 'DIAGNOSTIC',
    },
    {
      time: '2026-09-24 10:14 IST',
      title: 'Baseline Health Profile Registered (Day 0)',
      desc: 'ABHA Card 91-4201-9982-1029 authenticated with OTP consent.',
      officer: 'Sub-Center Niphad Registry',
      tag: 'ENROLLMENT',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="neu-flat rounded-3xl p-space-lg max-w-xl w-full space-y-space-md shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">history_edu</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Full Patient EHR Timeline
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                ABDM GATEWAY VERIFIED AUDIT TRAIL
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

        {/* Timeline list */}
        <div className="neu-concave-deep p-space-md rounded-2xl overflow-y-auto space-y-3 flex-1">
          {events.map((ev, i) => (
            <div key={i} className="neu-flat p-space-md rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase">
                  {ev.tag}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                  {ev.time}
                </span>
              </div>
              <h4 className="font-headline-sm text-body-md font-bold text-on-surface">{ev.title}</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{ev.desc}</p>
              <div className="text-xs text-outline pt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person</span>
                <span>{ev.officer}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="neu-primary-glow px-space-md py-2 rounded-xl font-headline-sm text-body-sm font-bold text-on-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
