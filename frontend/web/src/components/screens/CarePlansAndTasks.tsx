import React, { useState } from 'react';
import { ClinicalModule } from '../../types/clinical';

interface CarePlansAndTasksProps {
  onNavigate: (module: ClinicalModule) => void;
  onOpenCarePlanExport: () => void;
  onOpenSosModal: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const CarePlansAndTasks: React.FC<CarePlansAndTasksProps> = ({
  onNavigate: _onNavigate,
  onOpenCarePlanExport,
  onOpenSosModal,
  onShowToast,
}) => {
  const [reordered, setReordered] = useState(false);
  const [sorbitrateStock, setSorbitrateStock] = useState('Low: 3 Left');

  const [tasks, setTasks] = useState({
    bpMeasurement: true,
    pedalEdema: false,
    blisterCount: false,
  });

  const [inspectEcg, setInspectEcg] = useState(false);
  const [inspectTrop, setInspectTrop] = useState(false);

  const toggleTask = (key: keyof typeof tasks) => {
    setTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMarkTasksCompleted = () => {
    setTasks({
      bpMeasurement: true,
      pedalEdema: true,
      blisterCount: true,
    });
    onShowToast(
      'Day 3 Clinical Tasks Marked Complete',
      'Data signed with ASHA Anita Bai biometric credential and synced to EHR.',
      'success'
    );
  };

  const handleReorder = () => {
    setReordered(true);
    setSorbitrateStock('Ordered (10 Tabs)');
    onShowToast(
      'Sorbitrate 5mg Auto-Reordered',
      'Central Depot requisition #ORD-2026-891 queued for drone/courier field delivery.',
      'success'
    );
  };

  const handleForceP2P = () => {
    onShowToast(
      'P2P Offline Vault Synchronized',
      '14-day protocol cryptographic bundle verified across Sub-Center mesh relays.',
      'info'
    );
  };

  return (
    <div className="flex flex-col w-full gap-3 pb-6">
      {/* Top Patient & Protocol Header */}
      <section className="w-full neu-flat rounded-xl p-3.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Patient Identity & Baseline Info */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl neu-flat p-0.5 overflow-hidden">
                <img
                  alt="Patient Sunita Devi avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WF-sehcUw6akjeHrvgu1X37OJxv0Km2XF8WP26S08-WRudXtdqdyRbgQllm_wt6yK86hJCETLrFn7OKANXJ9eZTlIoORPHtiQouLXnN6bHObo3e-UVo_e3IT6ep_HwZ0a93lR1Unq9Ug0eoa_99vxyWmWjTCaBBNWuRB95saer7mz1NTsImNYYWkfwplndOwCiczQ1y_2JP5AMv-zDb3MclXfwCF73qeJhZ_TGRpBWWWJuLsEqV5w"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[10px] text-on-primary">verified</span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold text-on-surface tracking-tight font-headline-md">
                  Sunita Devi
                </h1>
                <div className="neu-inset px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-sm text-[9.5px] text-primary font-semibold tracking-wide">
                    POST-NSTEMI · DAY 2 OF 14
                  </span>
                </div>
                <span className="neu-flat px-1.5 py-0.2 rounded font-label-sm text-[9.5px] text-on-surface-variant font-medium">
                  BED-DISC-09B
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-xs text-on-surface-variant">
                <span className="font-label-sm text-[10px] text-on-surface tracking-wider bg-surface-container/60 px-1.5 py-0.2 rounded">
                  ABHA: 91-4402-1829-0193
                </span>
                <span>58 yrs • Female</span>
                <span className="hidden sm:inline text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    medical_services
                  </span>
                  Attending:{' '}
                  <strong className="text-on-surface font-semibold">Dr. Rajesh Varma</strong>{' '}
                  (Cardiology)
                </span>
              </div>
            </div>
          </div>

          {/* Diagnosis Banner & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 justify-start xl:justify-end">
            <div className="neu-concave-deep px-3 py-1.5 rounded-xl flex items-center gap-3">
              <div>
                <span className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider block">
                  Clinical Indication
                </span>
                <span className="text-xs font-bold text-on-surface flex items-center gap-1 font-headline-sm">
                  Post-NSTEMI ACS
                  <span className="font-label-sm text-[9px] text-primary font-semibold px-1.5 py-0.2 rounded-full bg-primary/10">
                    In-Remission
                  </span>
                </span>
              </div>
              <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
              <button
                onClick={onOpenSosModal}
                className="neu-crimson-pill px-3 py-1 rounded-full flex items-center gap-1 text-on-tertiary shadow-xs transition-transform active:scale-95 cursor-pointer hover:brightness-105"
                type="button"
              >
                <span className="material-symbols-outlined text-[13px]">crisis_alert</span>
                <span className="font-label-sm text-[9.5px] font-bold tracking-wide">
                  SOS PROTOCOL
                </span>
              </button>
            </div>

            <button
              onClick={onOpenCarePlanExport}
              className="neu-primary-glow px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-on-primary font-headline-sm text-xs font-bold tracking-wide transition-transform active:scale-95 cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">ios_share</span>
              <span>Export Care Plan</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3-Column Tactical Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* COLUMN 1: Verified Stock & Rx (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <section className="neu-flat rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-0.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">medication</span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-on-surface font-headline-sm">
                    Verified Stock &amp; Rx
                  </h2>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase tracking-wider">
                    PHC Deolali Mesh Live
                  </span>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-[16px] text-primary"
                title="Inventory Sync Healthy"
              >
                cloud_done
              </span>
            </div>

            {/* Dispensary Live Sync Badge */}
            <div className="neu-concave-deep p-1.5 rounded-lg flex items-center justify-between text-on-surface-variant text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="font-label-sm text-[9.5px] font-semibold text-on-surface">
                  Deolali Sub-Center Regimen Sync
                </span>
              </div>
              <span className="font-label-sm text-[9.5px] text-primary font-bold">TODAY 09:30</span>
            </div>

            {/* Active Prescriptions */}
            <div className="flex flex-col gap-2">
              {/* Rx 1: Ecosprin 75mg */}
              <div className="neu-flat rounded-xl p-2.5 transition-all">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                        Ecosprin 75mg
                      </h3>
                      <span className="neu-inset px-1.5 py-0.2 rounded-full font-label-sm text-[9px] text-primary font-semibold">
                        In Stock
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">Aspirin • Antiplatelet</p>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                </div>
                <div className="mt-1 neu-concave-deep px-2 py-1 rounded-lg flex items-center justify-between font-label-md text-[10.5px]">
                  <span className="text-on-surface font-semibold">1 Tab • OD (After Breakfast)</span>
                  <span className="text-on-surface-variant text-[9.5px]">Sub-Center 14/14</span>
                </div>
              </div>

              {/* Rx 2: Atorvastatin 20mg */}
              <div className="neu-flat rounded-xl p-2.5 transition-all">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                        Atorvastatin 20mg
                      </h3>
                      <span className="neu-inset px-1.5 py-0.2 rounded-full font-label-sm text-[9px] text-primary font-semibold">
                        In Stock
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">Statin • Plaque Stabilization</p>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                </div>
                <div className="mt-1 neu-concave-deep px-2 py-1 rounded-lg flex items-center justify-between font-label-md text-[10.5px]">
                  <span className="text-on-surface font-semibold">1 Tab • HS (Bedtime w/ Water)</span>
                  <span className="text-on-surface-variant text-[9.5px]">30-Day Armed</span>
                </div>
              </div>

              {/* Rx 3: Sorbitrate 5mg */}
              <div className="neu-flat rounded-xl p-2.5 transition-all">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                        Sorbitrate 5mg
                      </h3>
                      <span
                        className={`px-1.5 py-0.2 rounded-full font-label-sm text-[9px] font-semibold ${
                          reordered ? 'neu-inset text-primary' : 'neu-inset text-secondary'
                        }`}
                      >
                        {sorbitrateStock}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant">SOS Sublingual • Vasodilator</p>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[16px] ${
                      reordered ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    {reordered ? 'check_circle' : 'warning'}
                  </span>
                </div>
                <p className="text-[10.5px] text-on-surface-variant mt-0.5">
                  Take 1 under tongue on retrosternal heaviness.
                </p>
                <div className="mt-1.5">
                  <button
                    onClick={handleReorder}
                    disabled={reordered}
                    className={`w-full py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-headline-sm text-xs font-semibold transition-all cursor-pointer ${
                      reordered
                        ? 'neu-inset text-primary cursor-default'
                        : 'neu-flat hover:neu-inset active:scale-95 text-secondary'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                    <span>
                      {reordered
                        ? 'Order Transmitted to Depot (#891)'
                        : 'Auto-Reorder District Central Depot'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ASHA Handover Note */}
            <div className="neu-concave-deep p-2.5 rounded-xl flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                handshake
              </span>
              <div>
                <span className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                  ASHA Physical Handover Completed
                </span>
                <p className="text-[11px] text-on-surface mt-0.5 leading-snug">
                  Anita Bai handed over first 7-day strip pack with bilingual iconography markers.
                </p>
              </div>
            </div>

            {/* Discharge Vitals Baseline Tile */}
            <div className="neu-flat rounded-xl p-2.5">
              <span className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Cardiology Discharge Target Benchmarks
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="neu-inset p-2 rounded-lg">
                  <span className="font-label-sm text-[9px] text-on-surface-variant block">
                    BP Target &lt;130/80
                  </span>
                  <span className="text-sm font-bold text-primary font-mono block">
                    124/78
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block">
                    mmHg (Discharge)
                  </span>
                </div>
                <div className="neu-inset p-2 rounded-lg">
                  <span className="font-label-sm text-[9px] text-on-surface-variant block">
                    Target Pulse 60-75
                  </span>
                  <span className="text-sm font-bold text-primary font-mono block">
                    68
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block">
                    BPM Resting Sinus
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLUMN 2: Care Protocol & Escalation Safeguards (xl:col-span-5) */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          <section className="neu-flat rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-0.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-on-surface font-headline-sm">
                    Care Protocol &amp; Escalation
                  </h2>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase tracking-wider">
                    Nashik District Cardiology Pathway
                  </span>
                </div>
              </div>
              <div className="neu-flat px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-sm text-[9px] text-primary font-bold uppercase">
                  Active Path
                </span>
              </div>
            </div>

            {/* Escalation Safeguard Warning Banner */}
            <div className="neu-concave-deep p-2.5 rounded-xl flex items-start gap-2 border-l-4 border-l-secondary bg-surface-container/60">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                shield_with_heart
              </span>
              <div>
                <span className="font-label-sm text-[9.5px] text-secondary uppercase font-bold tracking-wider block">
                  AI Escalation Safeguard Matrix Armed
                </span>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  If Day 3 BP check is missed by &gt;48 hrs, SwasthyaSetu AI auto-triggers an automated alert to ANM Sunita Rawat and queues a 108 tele-triage dispatch.
                </p>
              </div>
            </div>

            {/* Continuity Protocol Timeline */}
            <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:neu-inset before:rounded-full">
              {/* Day 1 */}
              <div className="relative flex flex-col gap-0.5">
                <div className="absolute -left-5 top-0.5 w-4.5 h-4.5 rounded-full neu-flat flex items-center justify-center bg-primary text-on-primary shadow-xs">
                  <span className="material-symbols-outlined text-[11px]">check</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9.5px] text-primary font-bold uppercase">
                    DAY 1 · COMPLETED
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant">
                    Yesterday 16:45
                  </span>
                </div>
                <div className="neu-flat rounded-xl p-2.5">
                  <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                    Discharge Handshake &amp; ABHA Linkage
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    ABDM EHR synced with Nashik Civil Hospital. 108 transit safe drop verified.
                  </p>
                </div>
              </div>

              {/* Day 3 */}
              <div className="relative flex flex-col gap-0.5">
                <div className="absolute -left-5 top-0.5 w-4.5 h-4.5 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary shadow-xs animate-bounce">
                  <span className="material-symbols-outlined text-[11px]">priority_high</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9.5px] text-secondary font-bold uppercase">
                    DAY 3 · ACTION REQUIRED TOMORROW
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant font-semibold">
                    08:30 AM IST
                  </span>
                </div>

                <div className="neu-flat rounded-xl p-2.5 border border-primary/20 space-y-2 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                        In-Home Post-ACS Assessment
                      </h3>
                      <span className="font-label-sm text-[9.5px] text-on-surface-variant">
                        Assigned: <strong className="text-on-surface">ASHA Anita Bai</strong>
                      </span>
                    </div>
                    <span className="neu-inset px-2 py-0.5 rounded-full font-label-sm text-[9px] text-primary font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">location_on</span> Deolali GPS
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="neu-concave-deep p-2 rounded-xl space-y-1.5">
                    <span className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider block font-bold">
                      Standardized Clinical Tasks
                    </span>

                    <label
                      onClick={() => toggleTask('bpMeasurement')}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div className="w-4 h-4 rounded neu-flat flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[13px]">
                          {tasks.bpMeasurement ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] leading-tight transition-all ${
                          tasks.bpMeasurement
                            ? 'text-on-surface line-through opacity-75'
                            : 'text-on-surface font-medium'
                        }`}
                      >
                        Omron Digital BP measurement (3 readings averaged)
                      </span>
                    </label>

                    <label
                      onClick={() => toggleTask('pedalEdema')}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div className="w-4 h-4 rounded neu-inset flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[13px]">
                          {tasks.pedalEdema ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] leading-tight transition-all ${
                          tasks.pedalEdema
                            ? 'text-on-surface line-through opacity-75'
                            : 'text-on-surface font-medium'
                        }`}
                      >
                        Screen for pedal edema &amp; nocturnal dyspnea
                      </span>
                    </label>

                    <label
                      onClick={() => toggleTask('blisterCount')}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div className="w-4 h-4 rounded neu-inset flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[13px]">
                          {tasks.blisterCount ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] leading-tight transition-all ${
                          tasks.blisterCount
                            ? 'text-on-surface line-through opacity-75'
                            : 'text-on-surface font-medium'
                        }`}
                      >
                        Verify Ecosprin &amp; Atorvastatin blister count (12/14)
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-0.5 flex-wrap gap-1.5">
                    <span className="font-label-sm text-[9.5px] text-on-surface-variant">
                      Marathi IVR Dispatched
                    </span>
                    <button
                      onClick={handleMarkTasksCompleted}
                      className="neu-primary-glow px-2.5 py-1 rounded-lg text-xs font-semibold text-on-primary transition-transform active:scale-95 cursor-pointer shadow-xs"
                      type="button"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              </div>

              {/* Day 7 */}
              <div className="relative flex flex-col gap-0.5">
                <div className="absolute -left-5 top-0.5 w-4.5 h-4.5 rounded-full neu-flat flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[11px]">calendar_clock</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9.5px] text-on-surface-variant font-bold uppercase">
                    DAY 7 · TELE-CARDIOLOGY REVIEW
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant">In 4 Days</span>
                </div>
                <div className="neu-flat rounded-xl p-2.5">
                  <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                    Repeat 12-Lead ECG at Niphad CHC Tele-Room
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Video uplink with Dr. Rajesh Varma. Village shared e-rickshaw transit pre-coordinated.
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9px] text-primary font-semibold">
                      Slot: 11:15 AM
                    </span>
                    <span className="font-label-sm text-[9px] text-on-surface-variant">
                      #NPH-CARD-44
                    </span>
                  </div>
                </div>
              </div>

              {/* Day 14 */}
              <div className="relative flex flex-col gap-0.5">
                <div className="absolute -left-5 top-0.5 w-4.5 h-4.5 rounded-full neu-flat flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[11px]">favorite</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9.5px] text-on-surface-variant font-bold uppercase">
                    DAY 14 · PHASE-1 REHAB
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant">Scheduled</span>
                </div>
                <div className="neu-flat rounded-xl p-2.5">
                  <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                    Secondary Lipid Panel &amp; Exercise Tolerance
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Post-ACS treadmill safety assessment &amp; graduation to community walk program.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COLUMN 3: Diagnostic Tray & Offline Shield (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          {/* Diagnostic Tray Card */}
          <section className="neu-flat rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-on-surface font-headline-sm">
                    Diagnostic Tray
                  </h2>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase tracking-wider">
                    Discharge Artifacts
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-[9px] text-on-surface-variant font-semibold">
                2 Vault Records
              </span>
            </div>

            {/* Diagnostic Record 1: 12-Lead ECG */}
            <div className="neu-flat rounded-lg p-2 space-y-1.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[17px]">
                    monitor_heart
                  </span>
                  <div>
                    <h3 className="text-[11px] font-bold text-on-surface">12-Lead_ECG_Discharge.pdf</h3>
                    <span className="font-label-sm text-[9px] text-on-surface-variant">1.4 MB • Dr. R. Sharma</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectEcg(true)}
                  className="neu-flat px-2 py-0.5 rounded font-label-sm text-[9.5px] font-semibold text-primary active:neu-inset cursor-pointer"
                  type="button"
                >
                  Inspect
                </button>
              </div>

              <div className="neu-concave-deep p-1.5 rounded-lg bg-inverse-surface flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-20 h-4 text-inverse-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 100 24"
                  >
                    <path d="M0 12 L20 12 L25 8 L30 16 L35 2 L40 22 L45 12 L60 12 L65 9 L70 12 L100 12"></path>
                  </svg>
                  <span className="font-label-sm text-[8.5px] text-inverse-primary font-mono">
                    SINUS NSR
                  </span>
                </div>
                <span className="font-label-sm text-[8.5px] text-surface-dim">T-wave Resolved</span>
              </div>
            </div>

            {/* Diagnostic Record 2: Cardiac Troponin-I */}
            <div className="neu-flat rounded-lg p-2 space-y-1.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[17px]">biotech</span>
                  <div>
                    <h3 className="text-[11px] font-bold text-on-surface">Cardiac Troponin-I</h3>
                    <span className="font-label-sm text-[9px] text-on-surface-variant">Nashik Central Lab</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectTrop(true)}
                  className="neu-flat px-2 py-0.5 rounded font-label-sm text-[9.5px] font-semibold text-primary active:neu-inset cursor-pointer"
                  type="button"
                >
                  Report
                </button>
              </div>

              <div className="neu-inset p-1.5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block">Measured</span>
                  <span className="text-xs font-bold text-primary font-mono">0.02 ng/mL</span>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-[9px] text-on-surface-variant block">Cut-off</span>
                  <span className="font-label-md text-xs text-on-surface font-semibold">&lt; 0.04</span>
                </div>
              </div>
            </div>
          </section>

          {/* Offline Shield */}
          <section className="neu-flat rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">offline_bolt</span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-on-surface font-headline-sm">Offline Shield</h2>
                  <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase tracking-wider">
                    Zero Cellular Fallback
                  </span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </div>

            <p className="text-[10.5px] text-on-surface-variant leading-snug">
              Full 14-day protocol and Marathi dialect engine cached in local hardware.
            </p>

            <div className="neu-concave-deep p-2 rounded-lg space-y-0.5 font-label-sm text-[9.5px] text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Vault Status</span>
                <span className="font-semibold text-primary">100% ARMED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cryptographic Sig</span>
                <span className="font-mono text-on-surface">SHA256:7f4a...</span>
              </div>
            </div>

            <button
              onClick={handleForceP2P}
              className="w-full neu-flat py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold text-on-surface active:neu-inset transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">sync</span>
              <span>Force P2P Reconciliation</span>
            </button>
          </section>

          {/* Care Team Quick Relays */}
          <section className="neu-flat rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-on-surface font-headline-sm">Care Team Contacts</h2>
              <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9px] text-primary font-bold">
                DIRECT 24x7
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="neu-flat rounded-xl p-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    AB
                  </div>
                  <div className="min-w-0 leading-tight">
                    <span className="text-xs font-bold text-on-surface block truncate">Anita Bai</span>
                    <span className="font-label-sm text-[9px] text-on-surface-variant block">ASHA Facilitator</span>
                  </div>
                </div>
                <a
                  className="w-7 h-7 rounded-lg neu-flat flex items-center justify-center text-primary active:neu-inset transition-all shrink-0 cursor-pointer"
                  href="tel:+919845011204"
                  title="Call ASHA Anita Bai"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                </a>
              </div>

              <div className="neu-flat rounded-xl p-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-xs font-bold text-secondary shrink-0">
                    SR
                  </div>
                  <div className="min-w-0 leading-tight">
                    <span className="text-xs font-bold text-on-surface block truncate">Sunita Rawat</span>
                    <span className="font-label-sm text-[9px] text-on-surface-variant block">ANM Clinical Lead</span>
                  </div>
                </div>
                <a
                  className="w-7 h-7 rounded-lg neu-flat flex items-center justify-center text-primary active:neu-inset transition-all shrink-0 cursor-pointer"
                  href="tel:+919822390432"
                  title="Call ANM Sunita Rawat"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Inspect ECG Modal */}
      {inspectEcg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="neu-flat rounded-2xl p-4 max-w-lg w-full space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">monitor_heart</span>
                <h3 className="text-sm font-bold text-on-surface">12-Lead ECG Discharge Report</h3>
              </div>
              <button
                onClick={() => setInspectEcg(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-inverse-surface rounded-xl text-inverse-primary space-y-1.5">
              <div className="flex justify-between font-label-sm text-[9.5px] border-b border-outline-variant/30 pb-1">
                <span>PATIENT: SUNITA DEVI (42Y / F)</span>
                <span>INTERPRETATION: NORMAL SINUS RHYTHM</span>
              </div>
              <div className="h-20 flex items-center justify-center">
                <svg
                  className="w-full h-full text-inverse-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 400 100"
                >
                  <path d="M 0,50 L 30,50 L 35,46 L 40,50 L 50,50 L 55,56 L 60,10 L 68,90 L 72,50 L 80,50 L 90,44 L 100,50 L 130,50 L 135,46 L 140,50 L 150,50 L 155,56 L 160,10 L 168,90 L 172,50 L 180,50 L 190,44 L 200,50 L 230,50 L 235,46 L 240,50 L 250,50 L 255,56 L 260,10 L 268,90 L 272,50 L 280,50 L 290,44 L 300,50 L 400,50"></path>
                </svg>
              </div>
              <div className="flex justify-between font-label-sm text-[9px] text-surface-dim">
                <span>PR: 148ms • QRS: 84ms • QTc: 412ms</span>
                <span>Sign: Dr. R. K. Sharma</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setInspectEcg(false)}
                className="neu-primary-glow px-3 py-1.5 rounded-lg text-xs font-bold text-on-primary cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Troponin Modal */}
      {inspectTrop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="neu-flat rounded-2xl p-4 max-w-sm w-full space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">biotech</span>
                <h3 className="text-sm font-bold text-on-surface">Cardiac Troponin-I Lab</h3>
              </div>
              <button
                onClick={() => setInspectTrop(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="neu-concave-deep p-2.5 rounded-xl space-y-1.5 font-label-md text-xs">
              <div className="flex justify-between pb-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Methodology</span>
                <span className="font-semibold text-on-surface">Chemiluminescent Assay</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Result Value</span>
                <span className="font-bold text-primary font-mono">0.02 ng/mL (Normal)</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Cut-off</span>
                <span className="font-mono text-on-surface">0.04 ng/mL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Verification</span>
                <span className="font-mono text-primary text-[10px]">HMAC: lab-99c4-02</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setInspectTrop(false)}
                className="neu-primary-glow px-3 py-1.5 rounded-lg text-xs font-bold text-on-primary cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
