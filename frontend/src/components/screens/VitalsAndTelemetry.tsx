import React, { useState, useEffect } from 'react';
import { ClinicalModule } from '../../types/clinical';

interface VitalsAndTelemetryProps {
  onNavigate: (module: ClinicalModule) => void;
  onOpenTeleConsult: () => void;
  onOpenFhirExport: () => void;
  onOpenEhrTimeline: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const VitalsAndTelemetry: React.FC<VitalsAndTelemetryProps> = ({
  onNavigate,
  onOpenTeleConsult,
  onOpenFhirExport,
  onOpenEhrTimeline,
  onShowToast,
}) => {
  const [pulse, setPulse] = useState(106);
  const [spo2, setSpo2] = useState(94);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [laserX, setLaserX] = useState(65);
  const [calibrating, setCalibrating] = useState(false);
  const [showBaselineModal, setShowBaselineModal] = useState(false);

  useEffect(() => {
    const sweep = setInterval(() => {
      setLaserX((prev) => (prev >= 98 ? 2 : prev + 1.2));
    }, 50);
    return () => clearInterval(sweep);
  }, []);

  useEffect(() => {
    const pulseTick = setInterval(() => {
      setPulse((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const val = prev + delta;
        return val > 112 ? 106 : val < 102 ? 105 : val;
      });
    }, 2800);
    return () => clearInterval(pulseTick);
  }, []);

  const handleCalibrate = () => {
    setCalibrating(true);
    onShowToast('Sensors Calibrating', 'Re-zeroing Omron-NIBP and 25Hz SpO2 Photoplethysmograph...', 'info');
    setTimeout(() => {
      setCalibrating(false);
      setSpo2(95);
      onShowToast('Sensors Re-calibrated', 'Signal-to-noise ratio restored to 99.1%. Readings updated.', 'success');
    }, 1800);
  };

  const handleCommitVitals = () => {
    onShowToast(
      'Vitals Committed to ABDM FHIR Bundle',
      'Telemetry validated. Transitioning to facility referral and emergency logistics.',
      'success'
    );
    onNavigate('referrals-and-facilities');
  };

  return (
    <div className="flex flex-col w-full space-y-3 pb-6">
      {/* TOP PATIENT HEADER */}
      <section className="neu-flat rounded-xl p-3.5 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Patient Identity & Biomarkers */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="neu-inset p-0.5 rounded-xl">
                <img
                  alt="ASHA Health Attendant and verified patient identity avatar"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-lg object-cover"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WF-sehcUw6akjeHrvgu1X37OJxv0Km2XF8WP26S08-WRudXtdqdyRbgQllm_wt6yK86hJCETLrFn7OKANXJ9eZTlIoORPHtiQouLXnN6bHObo3e-UVo_e3IT6ep_HwZ0a93lR1Unq9Ug0eoa_99vxyWmWjTCaBBNWuRB95saer7mz1NTsImNYYWkfwplndOwCiczQ1y_2JP5AMv-zDb3MclXfwCF73qeJhZ_TGRpBWWWJuLsEqV5w"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-secondary-container neu-flat flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-base font-bold text-on-surface tracking-tight font-headline-md">
                  Sunita Devi
                </h1>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full neu-inset text-on-surface-variant font-medium">
                  42y • Female
                </span>
                <div className="neu-inset px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  <span className="font-label-sm text-[9.5px] text-tertiary font-bold tracking-wider">
                    PRIORITY 2 • URGENT
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">badge</span>
                  <span className="font-label-sm text-[10.5px] font-semibold text-on-surface">
                    ABHA: 91-4201-9982-1029
                  </span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span>Sub-Center Niphad · Nashik Rural Block</span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    support_agent
                  </span>
                  <span>
                    ASHA: <strong className="text-on-surface font-medium">Savitribai Phule</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Context Actions */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={() => setShowBaselineModal(true)}
              className="neu-inset px-3 py-1.5 rounded-lg font-label-md text-xs text-on-surface-variant font-semibold flex items-center gap-1.5 hover:text-on-surface transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>Baseline (Day 0)</span>
            </button>
            <button
              onClick={onOpenTeleConsult}
              className="neu-primary-glow px-3.5 py-1.5 rounded-lg text-xs font-bold text-on-primary flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">videocam</span>
              <span>Initiate Tele-Consult</span>
            </button>
          </div>
        </div>
      </section>

      {/* IOT HARDWARE SYNC DOCK */}
      <section className="neu-flat rounded-xl px-3.5 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="neu-inset p-1.5 rounded-lg text-primary">
              <span className="material-symbols-outlined text-[18px]">bluetooth_connected</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface">MedTech Field BLE Hub</span>
                <span className="font-label-sm text-[9px] neu-inset px-1.5 py-0.2 rounded text-primary font-bold">
                  v3.1 ACTIVE
                </span>
              </div>
              <p className="font-label-sm text-[9.5px] text-on-surface-variant">
                2.4GHz Gateway · Channel 11 Mesh Connected
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="neu-inset px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-sm text-[10px] text-on-surface font-semibold">
                Omron-NIBP
              </span>
              <span className="font-label-sm text-[10px] text-primary font-bold">SYNCED 100%</span>
            </div>
            <div className="neu-inset px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-[10px] text-on-surface font-semibold">
                SpO2 Sensor BT
              </span>
              <span className="font-label-sm text-[10px] text-primary font-bold">STREAMING 25Hz</span>
            </div>
            <div className="neu-inset px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              <span className="font-label-sm text-[10px] text-on-surface font-semibold">
                Thermometer-IR
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant font-medium">
                READY · CALIBRATED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CARDIAC WAVEFORM PANEL */}
      <section className="neu-flat rounded-xl p-3.5 space-y-2.5">
        {/* Waveform Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">ecg_heart</span>
              <h2 className="text-sm font-bold text-on-surface font-headline-sm">
                Lead II · Live PPG &amp; Cardiac Waveform
              </h2>
              <span className="font-label-sm text-[9.5px] px-2 py-0.2 rounded-full neu-primary-glow text-on-primary font-bold tracking-wider">
                LIVE PIPELINE
              </span>
            </div>
            <p className="font-label-sm text-[9.5px] text-on-surface-variant mt-0.5">
              Sweep: 25mm/s · Gain: 10mm/mV · Notch Filter: 50Hz ON · Baseline Wandering Filter Active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="neu-inset px-2.5 py-1 rounded-lg text-center">
              <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase">
                HRV
              </span>
              <span className="font-label-md text-xs font-bold text-tertiary">38 ms</span>
            </div>
            <div className="neu-inset px-2.5 py-1 rounded-lg text-center">
              <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase">
                Perfusion Index
              </span>
              <span className="font-label-md text-xs font-bold text-primary">3.8%</span>
            </div>
            <div className="neu-inset px-2.5 py-1 rounded-lg text-center">
              <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase">
                Signal Quality
              </span>
              <span className="font-label-md text-xs font-bold text-primary">98% (High SNR)</span>
            </div>
          </div>
        </div>

        {/* Soft Debossed Tachycardia Alert Well */}
        <div className="neu-concave-deep p-2.5 rounded-lg bg-error-container/30 flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="neu-flat p-1 rounded-md text-tertiary">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div>
              <span className="text-xs font-bold text-tertiary block leading-tight">
                Tachycardia Alert: Persistent rate &gt;100 bpm detected at rest.
              </span>
              <p className="text-[11px] text-on-surface-variant">
                Reduced beat-to-beat variability (38ms). Compensatory sympathetic tone flagged.
              </p>
            </div>
          </div>
          <div className="neu-inset px-2.5 py-0.5 rounded-full text-tertiary font-label-sm text-[9.5px] font-bold whitespace-nowrap">
            CONFIDENCE 96.4%
          </div>
        </div>

        {/* Carved Inset Telemetry Display */}
        <div className="rounded-xl p-2.5 bg-[#081511] shadow-[inset_4px_4px_10px_#040a08,inset_-3px_-3px_8px_rgba(255,255,255,0.05)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c231c_1px,transparent_1px),linear-gradient(to_bottom,#0c231c_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none"></div>

          <div className="relative z-10 flex items-center justify-between pb-1 text-[#5be3a8] font-label-sm text-[9.5px] opacity-90">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping"></span> LEAD II
                (CONTINUOUS)
              </span>
              <span>R-R: 566 ms</span>
              <span>CAL: 1.0 mV</span>
            </div>
            <div className="flex items-center gap-3">
              <span>WINDOW: 4.0s</span>
              <span className="text-white bg-[#0e3629] px-1.5 py-0.2 rounded font-bold">
                REGULAR SINUS RHYTHM
              </span>
            </div>
          </div>

          {/* Live Vector ECG SVG */}
          <div className="relative z-10 w-full h-24 flex items-center">
            <svg
              className="w-full h-full text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 1000 160"
            >
              <path
                d="
                  M 0,80 L 40,80 L 50,75 L 60,80 L 80,80 
                  L 90,88 L 100,5 L 112,145 L 120,80 L 135,80 
                  L 150,68 L 170,80 L 230,80 
                  L 240,75 L 250,80 L 270,80 
                  L 280,88 L 290,5 L 302,145 L 310,80 L 325,80 
                  L 340,68 L 360,80 L 420,80 
                  L 430,75 L 440,80 L 460,80 
                  L 470,88 L 480,5 L 492,145 L 500,80 L 515,80 
                  L 530,68 L 550,80 L 610,80 
                  L 620,75 L 630,80 L 650,80 
                  L 660,88 L 670,5 L 682,145 L 690,80 L 705,80 
                  L 720,68 L 740,80 L 800,80 
                  L 810,75 L 820,80 L 840,80 
                  L 850,88 L 860,5 L 872,145 L 880,80 L 895,80 
                  L 910,68 L 930,80 L 1000,80"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>

            {/* Dynamic Scanner Laser Head */}
            <div
              style={{ left: `${laserX}%` }}
              className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-[#10b981]/25 pointer-events-none border-r border-[#10b981] transition-all duration-75"
            />
          </div>

          <div className="relative z-10 pt-1 flex items-center justify-between text-[#388e6a] font-label-sm text-[9px]">
            <span>0.00s</span>
            <span>1.00s</span>
            <span>2.00s</span>
            <span>3.00s</span>
            <span>4.00s</span>
          </div>
        </div>
      </section>

      {/* 4-METRIC TELEMETRY GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* 1. Oxygen Saturation */}
        <div className="neu-flat rounded-xl p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[17px] text-secondary">bloodtype</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Oxygen Saturation
              </span>
            </div>
            <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9.5px] font-bold text-secondary bg-secondary-fixed/30">
              BORDERLINE
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-on-surface font-headline-xl">
              {spo2}
            </span>
            <span className="font-label-lg text-xs text-on-surface-variant font-bold">%</span>
            <span className="font-label-sm text-[9.5px] text-on-surface-variant ml-auto">
              Target: 95 - 100%
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full neu-inset overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-secondary-container transition-all duration-500"
                style={{ width: `${spo2}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[9.5px]">
              <span className="text-secondary font-medium">
                {spo2 < 95 ? `${spo2 - 95}% below normal` : 'Normalized'}
              </span>
              <span>Calibrated 1m ago</span>
            </div>
          </div>
        </div>

        {/* 2. Pulse Rate */}
        <div className="neu-flat rounded-xl p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[17px] text-tertiary">monitor_heart</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Pulse Rate
              </span>
            </div>
            <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9.5px] font-bold text-tertiary bg-tertiary-fixed/30">
              TACHYCARDIA
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-tertiary font-headline-xl">
              {pulse}
            </span>
            <span className="font-label-lg text-xs text-on-surface-variant font-bold">BPM</span>
            <span className="font-label-sm text-[9.5px] text-on-surface-variant ml-auto">
              Norm: 60 - 100
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full neu-inset overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-tertiary transition-all duration-500"
                style={{ width: '78%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[9.5px]">
              <span className="text-tertiary font-medium">+{pulse - 88} bpm baseline</span>
              <span>Sinus Rhythm</span>
            </div>
          </div>
        </div>

        {/* 3. Blood Pressure */}
        <div className="neu-flat rounded-xl p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[17px] text-secondary">speed</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Blood Pressure
              </span>
            </div>
            <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9.5px] font-bold text-secondary bg-secondary-fixed/30">
              STAGE 1 HTN
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-on-surface font-headline-xl">
              138/88
            </span>
            <span className="font-label-lg text-xs text-on-surface-variant font-bold">mmHg</span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full neu-inset overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-secondary-fixed-dim transition-all duration-500"
                style={{ width: '68%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[9.5px]">
              <span>Left Arm Cuff</span>
              <span className="text-primary font-medium">Dual-checked</span>
            </div>
          </div>
        </div>

        {/* 4. Body Temperature */}
        <div className="neu-flat rounded-xl p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[17px] text-primary">
                device_thermostat
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Body Temp
              </span>
            </div>
            <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9.5px] font-bold text-primary bg-primary-fixed/30">
              NORMAL
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-on-surface font-headline-xl">
              98.6
            </span>
            <span className="font-label-lg text-xs text-on-surface-variant font-bold">°F</span>
            <span className="font-label-sm text-[9.5px] text-on-surface-variant ml-auto">
              37.0 °C
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full neu-inset overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: '52%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[9.5px]">
              <span>Infrared Tympanic</span>
              <span className="text-primary font-medium">Apyrexial</span>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT: ASHA Frontline Field Log (7 cols) */}
        <div className="lg:col-span-7 neu-flat rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  record_voice_over
                </span>
                <div>
                  <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                    ASHA Frontline Field Log &amp; Dialect Intake
                  </h3>
                  <p className="font-label-sm text-[9.5px] text-on-surface-variant">
                    Community Health Worker S. Phule · Sub-Center Niphad (14m ago)
                  </p>
                </div>
              </div>
              <span className="neu-inset px-2.5 py-0.5 rounded-full font-label-sm text-[9.5px] text-primary font-bold">
                MARATHI-HINDI TRANSCRIBED
              </span>
            </div>

            {/* Audio Player Pill Strip */}
            <div className="neu-concave-deep p-1.5 rounded-lg flex items-center justify-between gap-2 mt-1.5">
              <button
                onClick={() => {
                  setIsPlayingAudio(!isPlayingAudio);
                  onShowToast(
                    isPlayingAudio ? 'Audio Paused' : 'Playing Field Log Audio',
                    'Acoustic stream from S. Phule Sub-Center Niphad audio intake.',
                    'info'
                  );
                }}
                className="neu-flat px-2.5 py-1 rounded-md flex items-center gap-1.5 text-on-surface active:scale-95 transition-transform cursor-pointer text-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">
                  {isPlayingAudio ? 'pause' : 'play_arrow'}
                </span>
                <span className="font-label-sm text-[10px] font-bold">
                  {isPlayingAudio ? 'Pause' : 'Play Audio'}
                </span>
                <span className="font-label-sm text-[9px] text-on-surface-variant">(0:48)</span>
              </button>

              <div className="flex-1 hidden sm:flex items-center gap-1 px-2">
                <div className={`w-0.5 h-2.5 rounded ${isPlayingAudio ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                <div className={`w-0.5 h-4 rounded ${isPlayingAudio ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                <div className={`w-0.5 h-2 rounded ${isPlayingAudio ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                <div className={`w-0.5 h-5 rounded ${isPlayingAudio ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                <div className="w-0.5 h-3 rounded bg-outline-variant" />
                <div className="w-0.5 h-5 rounded bg-outline-variant" />
                <div className="w-0.5 h-2.5 rounded bg-outline-variant" />
                <div className="w-0.5 h-4 rounded bg-outline-variant" />
              </div>

              <div className="font-label-sm text-[9.5px] text-on-surface-variant whitespace-nowrap">
                CONFIDENCE 98.2%
              </div>
            </div>

            {/* Narrative Quote */}
            <div className="neu-inset p-2.5 rounded-lg mt-2">
              <p className="text-xs text-on-surface italic leading-relaxed">
                "Patient reports mild exertional fatigue, breathless sensation when climbing steps,
                and dry persistent cough for 3 days. Complains of sudden palpitations while resting
                in afternoon. Cold clammy extremities noted during cuff placement. Traditional
                assessment notes aggravated Pitta-Vata symptoms with dehydration signs."
              </p>
            </div>

            {/* Clinical Flags */}
            <div className="mt-2">
              <span className="font-label-sm text-[9px] text-on-surface-variant uppercase block mb-1">
                EXTRACTED CLINICAL CORRELATIONS
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="neu-flat px-2 py-0.5 rounded-full font-label-sm text-[9.5px] text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">flag</span>
                  Tachycardia with exertion
                </span>
                <span className="neu-flat px-2 py-0.5 rounded-full font-label-sm text-[9.5px] text-secondary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">flag</span>
                  Peripheral Hypoperfusion
                </span>
                <span className="neu-flat px-2 py-0.5 rounded-full font-label-sm text-[9.5px] text-on-surface font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">help</span>
                  Post-viral fatigue?
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Officer Footer */}
          <div className="neu-inset px-2.5 py-1.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-on-surface-variant font-label-sm text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">clinical_notes</span>
              <span>
                Assigned Nodal Officer:{' '}
                <strong className="text-on-surface font-semibold">Dr. Priya Deshmukh</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Triage Score:</span>
              <span className="neu-flat px-2 py-0.2 rounded text-tertiary font-bold">
                MEWS 3 (Moderate)
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Clinical Boundary & Safety (5 cols) */}
        <div className="lg:col-span-5 neu-flat rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="neu-inset p-1.5 rounded-lg text-primary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                  Clinical Boundary &amp; Safety
                </h3>
                <p className="font-label-sm text-[9px] text-on-surface-variant">
                  Statutory Medical Boundary Guardrail
                </p>
              </div>
            </div>

            <div className="neu-concave-deep p-2.5 rounded-lg space-y-1">
              <div className="flex items-center gap-1 text-on-surface">
                <span className="material-symbols-outlined text-[15px] text-secondary">gavel</span>
                <span className="font-label-sm text-[9.5px] font-bold uppercase tracking-wider">
                  Advisory Notice
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-snug">
                Telemetry readings, AI interpretations, and frontline inputs are for triage and
                measurement only. They do not constitute formal medical diagnosis or prescription.
              </p>
            </div>

            <div className="neu-inset p-2.5 rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[9px] text-on-surface-variant uppercase">
                  ABHA CONSENT ARTIFACT
                </span>
                <span className="neu-flat px-1.5 py-0.2 rounded text-[9.5px] font-bold text-primary">
                  VALID 24H
                </span>
              </div>
              <div className="flex items-center justify-between font-label-md text-xs text-on-surface font-semibold">
                <span>P-Consent-2025-0982-A</span>
                <span className="material-symbols-outlined text-[15px] text-primary">lock</span>
              </div>
              <p className="font-label-sm text-[9.5px] text-on-surface-variant">
                Encrypted with ABDM Gateway. Electronic patient thumbprint verified.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEhrTimeline}
            className="neu-flat w-full py-2 px-3 rounded-lg text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 active:scale-98 transition-transform cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">history_edu</span>
            <span>View Full EHR Timeline</span>
          </button>
        </div>
      </section>

      {/* FOOTER ACTION BAR */}
      <section className="neu-flat rounded-xl p-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="neu-inset px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-sm text-[10px] text-on-surface font-semibold">
                Local SQLite Armed
              </span>
              <span className="text-outline-variant font-label-sm text-[10px]">•</span>
              <span className="font-label-sm text-[9.5px] text-on-surface-variant">
                ABDM FHIR Bundle v4.0.1 Ready
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className="neu-flat px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <span
                className={`material-symbols-outlined text-[15px] ${
                  calibrating ? 'animate-spin text-primary' : ''
                }`}
              >
                replay
              </span>
              <span>{calibrating ? 'Calibrating...' : 'Re-measure / Calibrate'}</span>
            </button>

            <button
              onClick={onOpenFhirExport}
              className="neu-flat px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">data_object</span>
              <span>Export FHIR JSON</span>
            </button>

            <button
              onClick={handleCommitVitals}
              className="neu-primary-glow px-4 py-1.5 rounded-lg text-xs font-bold text-on-primary flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer shadow-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">check_circle</span>
              <span>Commit Vitals &amp; Route Referral</span>
            </button>
          </div>
        </div>
      </section>

      {/* Baseline Day 0 Modal */}
      {showBaselineModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="neu-flat rounded-2xl p-4 max-w-sm w-full space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <h3 className="text-sm font-bold text-on-surface">Baseline (Day 0) Vitals</h3>
              </div>
              <button
                onClick={() => setShowBaselineModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="neu-concave-deep p-2.5 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                <span className="text-on-surface-variant">Baseline Pulse</span>
                <span className="font-bold text-on-surface">88 BPM (Resting)</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                <span className="text-on-surface-variant">Baseline SpO2</span>
                <span className="font-bold text-on-surface">97% (Room air)</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/20 pb-1">
                <span className="text-on-surface-variant">Baseline BP</span>
                <span className="font-bold text-on-surface">122/80 mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Intake Timestamp</span>
                <span className="font-mono text-primary">2026-09-24 10:14 IST</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowBaselineModal(false)}
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
