import React from 'react';

interface CarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const CarePlanModal: React.FC<CarePlanModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    onShowToast('Care Plan Export Ready', '14-Day Post-NSTEMI clinical pathway formatted for export/print.', 'success');
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="neu-flat rounded-3xl p-space-lg max-w-2xl w-full space-y-space-md shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                14-Day Post-NSTEMI Clinical Pathway
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                PATIENT CARE DOCKET • NASHIK DISTRICT CARDIOLOGY
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

        {/* Printable preview content */}
        <div className="neu-concave-deep p-space-lg rounded-2xl overflow-y-auto space-y-4 text-on-surface font-body-sm flex-1">
          <div className="flex justify-between border-b border-outline-variant/20 pb-2">
            <div>
              <h3 className="font-headline-sm text-body-lg font-bold">Sunita Devi (42y / F)</h3>
              <p className="text-on-surface-variant">ABHA: 91-4201-9982-1029 • Bed: BED-DISC-09B</p>
            </div>
            <div className="text-right">
              <span className="font-label-sm text-primary font-bold block">PROTOCOL LOCKED</span>
              <span className="text-on-surface-variant text-xs">Attending: Dr. Rajesh Varma</span>
            </div>
          </div>

          <div>
            <h4 className="font-headline-sm text-body-sm font-bold text-primary mb-1 uppercase tracking-wider">
              1. Pharmacotherapy Regimen
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li><strong>Ecosprin 75mg:</strong> 1 Tab daily after breakfast (Antiplatelet).</li>
              <li><strong>Atorvastatin 20mg:</strong> 1 Tab daily at bedtime with water (Plaque stabilization).</li>
              <li><strong>Sorbitrate 5mg:</strong> Sublingually SOS on chest pain.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline-sm text-body-sm font-bold text-primary mb-1 uppercase tracking-wider">
              2. Frontline Surveillance Schedule
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li><strong>Day 3:</strong> ASHA Anita Bai in-home BP check, edema screen, tablet count verification.</li>
              <li><strong>Day 7:</strong> Niphad CHC Tele-Cardiology review & repeat 12-lead ECG.</li>
              <li><strong>Day 14:</strong> Phase-1 Cardiac Rehab evaluation & secondary lipid profiling.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline-sm text-body-sm font-bold text-secondary mb-1 uppercase tracking-wider">
              3. Red-Flag Escalation Parameters
            </h4>
            <p className="text-on-surface-variant">
              Any recurrent retrosternal heaviness lasting &gt;15 minutes unresponsive to Sorbitrate triggers automated 108 ALS dispatch and direct bypass to District Civil Hospital CCU.
            </p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between shrink-0 pt-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Digitally Signed: SHA256:7f4a...92b1
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="neu-flat px-space-md py-2 rounded-xl font-headline-sm text-body-sm font-semibold text-primary flex items-center gap-1 active:neu-inset cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="neu-primary-glow px-space-md py-2 rounded-xl font-headline-sm text-body-sm font-bold text-on-primary active:scale-95 transition-transform cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
