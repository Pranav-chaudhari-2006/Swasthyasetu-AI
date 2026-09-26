import React, { useState, useEffect } from 'react';
import { ClinicalModule } from '../../types/clinical';

interface ReferralsAndFacilitiesProps {
  onNavigate: (module: ClinicalModule) => void;
  onOpenEmergency: () => void;
  onOpenTeleConsult: () => void;
  onOpenAuditDocket: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const ReferralsAndFacilities: React.FC<ReferralsAndFacilitiesProps> = ({
  onNavigate: _onNavigate,
  onOpenEmergency,
  onOpenTeleConsult,
  onOpenAuditDocket,
  onShowToast,
}) => {
  const [timeLeft, setTimeLeft] = useState(260); // 04:20
  const [backupArmed, setBackupArmed] = useState(false);
  const [ambulanceProgress, setAmbulanceProgress] = useState(55);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const move = setInterval(() => {
      setAmbulanceProgress((prev) => (prev >= 85 ? 40 : prev + 1));
    }, 1500);
    return () => clearInterval(move);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText('8f4b-99c1-aa02-e92a-c710');
    onShowToast(
      'FastPass HMAC Hash Copied',
      'Token 8f4b-99c1-aa02-e92a-c710 copied to clipboard for emergency entry desk.',
      'success'
    );
  };

  const handleRelayTelemetry = () => {
    onShowToast(
      'Telemetry Packet Pushed to Receiving CCU',
      'High-resolution DICOM waveform and vitals streamed to Nashik DH Central Cath-Lab.',
      'info'
    );
  };

  const handleArmBackup = () => {
    setBackupArmed(!backupArmed);
    if (!backupArmed) {
      onShowToast(
        'Secondary Route Armed: GMC Dhule',
        'Pre-allocation signal transmitted to Dhule Cath backup unit in case Nashik saturates.',
        'warning'
      );
    } else {
      onShowToast('Secondary Route Disarmed', 'Routing reset to primary District Civil Hospital.', 'info');
    }
  };

  return (
    <div className="flex flex-col w-full gap-3 pb-6">
      {/* TOP PATIENT & TRANSIT SUMMARY */}
      <section className="w-full neu-flat rounded-xl p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl neu-inset p-0.5 flex items-center justify-center relative">
              <img
                alt="Patient Sunita Devi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtvFomKWydQ3tGuXToR8S4rm_OKDP3E2Xk_w0e1sIwk9VmHMQvhbHgsUuPf2_vycPm6muGi3mfw5YDCg7NVqJNbmR5CzZ-jLw7MopRp9RlCxyrk_MugvS3pIH8cmajKJW0JOa0euFd80fUz1MLucMzfBHfVRemRQkcf7v3Kq-MWH3JQ5RE_ApP3z2M9M1KjJ3DgcnOrN69GrtFRTpJsFEXcK4dBmHYyqaqX-6U8KKrq9BTDYybzg"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-tertiary shadow-[0_0_6px_rgba(182,23,34,0.6)]"></span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-on-surface tracking-tight font-headline-md">
                Sunita Devi
              </h1>
              <span className="neu-inset px-2 py-0.2 rounded-full font-label-md text-[10.5px] text-on-surface-variant font-medium">
                42Y · Female
              </span>
              <span className="neu-crimson-pill px-2.5 py-0.2 rounded-full font-label-sm text-[9.5px] font-bold text-on-tertiary uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-[13px]">warning</span>
                SUSPECTED ACS / NSTEMI
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-on-surface-variant font-label-sm text-[10.5px]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary">fingerprint</span>
                ABHA: <strong className="text-on-surface font-semibold">91-4201-9982-1029</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">tag</span>
                Ref ID: <strong className="text-on-surface font-semibold">#SS-2025-0891</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="neu-inset px-1.5 py-0.2 rounded font-label-sm text-primary font-bold">
                CRITICAL CCU ROUTE
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-on-surface text-xs flex-wrap">
              <span className="material-symbols-outlined text-[16px] text-secondary">alt_route</span>
              <span className="font-medium">SDH Manmad (OPD-3)</span>
              <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
              <span className="font-semibold text-primary">
                District Civil Hospital, Nashik (ICU-Cath)
              </span>
              <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-on-surface-variant font-semibold text-[10px]">
                38 km · ~42 min
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Trays */}
        <div className="flex items-center gap-2 shrink-0 self-start xl:self-center">
          <button
            onClick={handleRelayTelemetry}
            className="neu-flat hover:neu-inset active:neu-inset px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">satellite_alt</span>
            Relay Telemetry
          </button>
          <button
            onClick={onOpenAuditDocket}
            className="neu-flat hover:neu-inset active:neu-inset px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            Audit Docket
          </button>
        </div>
      </section>

      {/* URGENT CARDIAC TRANSPORT LIFECYCLE */}
      <section className="w-full neu-flat rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-[9.5px] uppercase tracking-wider font-bold text-on-surface-variant">
              TRANSIT LIFECYCLE MONITOR
            </span>
            <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-primary font-bold text-[9.5px]">
              STEP 3 OF 5
            </span>
          </div>
          <div className="flex items-center gap-1 font-label-sm text-[9.5px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[13px] text-primary">satellite_alt</span>
            <span>
              CAD Realtime Link: <strong className="text-on-surface font-semibold font-mono">MH-108-LIVE</strong>
            </span>
          </div>
        </div>

        {/* Stepper Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-0.5">
          <div className="neu-inset p-2 rounded-xl flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                1. ISSUED
              </span>
              <span className="font-label-sm text-[9px] text-on-surface-variant font-mono">14:10</span>
            </div>
            <p className="text-xs font-medium text-on-surface leading-tight">SDH Manmad OPD-3</p>
            <span className="font-label-sm text-[9px] text-on-surface-variant">Dr. S. Bhalerao</span>
          </div>

          <div className="neu-inset p-2 rounded-xl flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                2. ACCEPTED
              </span>
              <span className="font-label-sm text-[9px] text-on-surface-variant font-mono">14:14</span>
            </div>
            <p className="text-xs font-medium text-on-surface leading-tight">Nashik CCU</p>
            <span className="font-label-sm text-[9px] text-on-surface-variant">Bed #04 Locked</span>
          </div>

          <div className="neu-primary-glow p-2 rounded-xl flex flex-col gap-0.5 text-on-primary shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] font-bold text-on-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                3. EN ROUTE
              </span>
              <span className="font-label-sm text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-on-primary font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs font-bold text-on-primary leading-tight font-headline-sm">
              MH-15-TC-402 (ALS)
            </p>
            <span className="font-label-sm text-[9px] text-white/90 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">speed</span> 68 km/h · NH-60
            </span>
          </div>

          <div className="neu-flat p-2 rounded-xl flex flex-col gap-0.5 opacity-85">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">radio_button_unchecked</span>
                4. ARRIVAL
              </span>
              <span className="font-label-sm text-[9px] text-secondary font-bold font-mono">ETA 14:58</span>
            </div>
            <p className="text-xs font-medium text-on-surface leading-tight">Civil Hospital Bay 01</p>
            <span className="font-label-sm text-[9px] text-on-surface-variant">Triage Prep Team A</span>
          </div>

          <div className="neu-flat p-2 rounded-xl flex flex-col gap-0.5 opacity-70">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">pending</span>
                5. STAT CATH
              </span>
              <span className="font-label-sm text-[9px] text-on-surface-variant">ICU Handoff</span>
            </div>
            <p className="text-xs font-medium text-on-surface leading-tight">Troponin STAT Retest</p>
            <span className="font-label-sm text-[9px] text-on-surface-variant">Direct Cath Bridge</span>
          </div>
        </div>
      </section>

      {/* MAIN SPLIT WORKSPACE: 5 Cols Left / 7 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full items-start">
        {/* LEFT COLUMN (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* 1. AYUSH-HMAC FASTPASS CRADLE */}
          <div className="neu-flat rounded-xl p-3.5 flex flex-col gap-2.5 relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9.5px] text-primary font-bold">
                    ZERO-WAIT DESK SCAN
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                </div>
                <h2 className="text-sm font-bold text-on-surface tracking-tight font-headline-sm">
                  Ayush-HMAC FastPass™
                </h2>
              </div>
              <div className="neu-flat p-1.5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">contactless</span>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-snug">
              Cryptographically signed transit clearance guaranteeing priority emergency entry, bed lock,
              and registrar queue bypass.
            </p>

            {/* Debossed QR Cradle */}
            <div className="neu-concave-deep p-2.5 rounded-xl flex flex-col items-center justify-center gap-2 relative">
              <div className="neu-flat p-2 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-md">
                <svg className="w-28 h-28 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                  <rect fill="#171c20" height="24" rx="3" width="24" x="6" y="6"></rect>
                  <rect fill="#ffffff" height="16" rx="2" width="16" x="10" y="10"></rect>
                  <rect fill="#006948" height="8" rx="1" width="8" x="14" y="14"></rect>
                  <rect fill="#171c20" height="24" rx="3" width="24" x="70" y="6"></rect>
                  <rect fill="#ffffff" height="16" rx="2" width="16" x="74" y="10"></rect>
                  <rect fill="#006948" height="8" rx="1" width="8" x="78" y="14"></rect>
                  <rect fill="#171c20" height="24" rx="3" width="24" x="6" y="70"></rect>
                  <rect fill="#ffffff" height="16" rx="2" width="16" x="10" y="74"></rect>
                  <rect fill="#006948" height="8" rx="1" width="8" x="14" y="78"></rect>
                  <rect fill="#171c20" height="6" width="6" x="36" y="8"></rect>
                  <rect fill="#171c20" height="4" width="10" x="46" y="8"></rect>
                  <rect fill="#171c20" height="8" width="4" x="60" y="8"></rect>
                  <rect fill="#171c20" height="12" width="4" x="36" y="18"></rect>
                  <rect fill="#171c20" height="4" width="16" x="44" y="16"></rect>
                  <rect fill="#171c20" height="6" width="8" x="54" y="24"></rect>
                  <rect fill="#171c20" height="6" width="6" x="8" y="36"></rect>
                  <rect fill="#171c20" height="4" width="8" x="18" y="40"></rect>
                  <rect fill="#171c20" height="12" width="4" x="28" y="36"></rect>
                  <rect fill="#171c20" height="6" width="12" x="70" y="36"></rect>
                  <rect fill="#171c20" height="6" width="8" x="86" y="40"></rect>
                  <rect fill="#171c20" height="4" width="14" x="8" y="48"></rect>
                  <rect fill="#171c20" height="10" width="6" x="26" y="52"></rect>
                  <rect fill="#171c20" height="14" width="6" x="70" y="46"></rect>
                  <rect fill="#171c20" height="4" width="12" x="82" y="50"></rect>
                  <rect fill="#171c20" height="6" width="10" x="36" y="68"></rect>
                  <rect fill="#171c20" height="12" width="6" x="50" y="64"></rect>
                  <rect fill="#171c20" height="4" width="8" x="60" y="70"></rect>
                  <rect fill="#171c20" height="6" width="6" x="74" y="68"></rect>
                  <rect fill="#171c20" height="14" width="8" x="84" y="74"></rect>
                  <rect fill="#171c20" height="10" width="6" x="36" y="82"></rect>
                  <rect fill="#171c20" height="6" width="14" x="46" y="80"></rect>
                  <rect fill="#171c20" height="8" width="6" x="64" y="82"></rect>
                  <circle cx="50" cy="50" fill="#ffffff" r="14"></circle>
                  <circle cx="50" cy="50" fill="#006948" r="11"></circle>
                  <path
                    d="M50 44 v12 M44 50 h12"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <span className="font-label-sm text-[9px] text-on-surface font-bold uppercase tracking-wider text-center">
                SCAN UPON ARRIVAL AT GATE 1 EMERGENCY
              </span>
            </div>

            {/* Token Hash Inset Tray */}
            <div className="neu-inset p-2 rounded-lg flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-[8.5px] text-on-surface-variant uppercase font-semibold">
                  HMAC-SHA256 Token Signature
                </span>
                <span className="font-label-sm text-[10px] font-mono text-on-surface font-semibold truncate">
                  8f4b-99c1-aa02-e92a-c710
                </span>
              </div>
              <button
                onClick={handleCopyHash}
                className="neu-flat hover:neu-inset active:scale-95 px-2 py-0.5 rounded font-label-sm text-[9.5px] text-primary font-bold transition-all shrink-0 cursor-pointer"
                type="button"
              >
                COPY HASH
              </button>
            </div>

            {/* Validity & Crypto Seal */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="neu-inset px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-secondary">hourglass_top</span>
                <span className="font-label-sm text-[9.5px] text-on-surface font-semibold">
                  Valid for: <span className="text-primary font-bold font-mono">{formatTimer(timeLeft)}</span> min
                </span>
              </div>
              <div className="flex items-center gap-1 font-label-sm text-[9.5px] text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[13px] text-primary">verified</span>
                <span>Signed Offline</span>
              </div>
            </div>
          </div>

          {/* 2. 108 MEMS DIRECT DISPATCH BRIDGE */}
          <div className="neu-flat rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></div>
                <h2 className="text-xs font-bold text-on-surface font-headline-sm">
                  108 MEMS Bridge
                </h2>
              </div>
              <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-tertiary font-bold text-[9px]">
                STATE CAD LINKED
              </span>
            </div>

            <div className="neu-inset p-2 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full neu-flat flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-[17px]">directions_car</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-on-surface block leading-tight">
                    Pilot: S. Kulkarni
                  </span>
                  <span className="font-label-sm text-[9.5px] text-on-surface-variant font-mono">
                    +91 94220-44910
                  </span>
                </div>
              </div>
              <a
                className="neu-flat hover:neu-inset active:scale-95 p-1.5 rounded-lg text-primary transition-all flex items-center justify-center cursor-pointer"
                href="tel:+919422044910"
                title="Call 108 Pilot Directly"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
              </a>
            </div>

            <button
              onClick={onOpenEmergency}
              className="neu-crimson-pill py-2 px-3 rounded-xl text-on-tertiary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] shadow-md cursor-pointer hover:brightness-105"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] animate-bounce">fmd_good</span>
              Trigger 108 Emergency Coordination
            </button>
          </div>

          {/* 3. EN-ROUTE TELEMETRY PACKET */}
          <div className="neu-flat rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[15px]">monitor_heart</span>
                <span className="font-label-sm text-[9.5px] font-bold text-on-surface uppercase">
                  Live Ambulance Telemetry
                </span>
              </div>
              <span className="font-label-sm text-[9px] text-on-surface-variant">Synced 2m ago</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="neu-concave-deep p-1.5 rounded-lg flex flex-col">
                <span className="font-label-sm text-[8.5px] text-on-surface-variant font-semibold">
                  HR / RHYTHM
                </span>
                <span className="text-xs text-tertiary font-bold font-mono">
                  114 <span className="text-[9px] font-normal">BPM</span>
                </span>
                <span className="font-label-sm text-[8.5px] text-on-surface-variant truncate">
                  Sinus Tachy
                </span>
              </div>

              <div className="neu-concave-deep p-1.5 rounded-lg flex flex-col">
                <span className="font-label-sm text-[8.5px] text-on-surface-variant font-semibold">
                  BLOOD PRESS.
                </span>
                <span className="text-xs text-on-surface font-bold font-mono">
                  148/94
                </span>
                <span className="font-label-sm text-[8.5px] text-secondary font-semibold font-mono">
                  MAP 112
                </span>
              </div>

              <div className="neu-concave-deep p-1.5 rounded-lg flex flex-col">
                <span className="font-label-sm text-[8.5px] text-on-surface-variant font-semibold">
                  SpO2 / FLOW
                </span>
                <span className="text-xs text-primary font-bold font-mono">
                  94%
                </span>
                <span className="font-label-sm text-[8.5px] text-on-surface-variant">O2 2L Mask</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* 1. OPTIMAL FACILITY MATCH (99.4%) */}
          <div className="neu-flat rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="neu-primary-glow text-on-primary font-label-sm text-[9.5px] font-bold px-2 py-0.2 rounded-full">
                    AI MATCH 99.4%
                  </span>
                  <span className="neu-inset font-label-sm text-[9.5px] text-primary font-bold px-2 py-0.2 rounded-full">
                    PRIMARY TARGET
                  </span>
                </div>
                <h2 className="text-sm font-bold text-on-surface mt-1 tracking-tight font-headline-md">
                  District Civil Hospital, Nashik
                </h2>
                <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                  Trimbak Road, Nashik · Tertiary Cardiac &amp; Cath Lab Center
                </p>
              </div>

              <div className="neu-inset px-3 py-1 rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="font-label-sm text-[9px] text-on-surface-variant font-semibold uppercase">
                  TRAVEL DELTA
                </span>
                <span className="text-sm font-bold text-primary font-mono leading-none mt-0.5">
                  38 <span className="text-xs">km</span>
                </span>
                <span className="font-label-sm text-[9.5px] text-on-surface font-medium">
                  ~42 min ETA
                </span>
              </div>
            </div>

            {/* Embedded Live Transit Route Map */}
            <div className="neu-concave-deep p-1 rounded-xl relative overflow-hidden">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[#0d1b1e] opacity-90">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#152e32_1px,transparent_1px),linear-gradient(to_bottom,#152e32_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 300">
                  <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#855300" />
                      <stop offset="50%" stopColor="#00855d" />
                      <stop offset="100%" stopColor="#006948" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 60,240 C 140,220 180,160 260,150 C 340,140 420,180 540,80"
                    stroke="#1a3f39"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 60,240 C 140,220 180,160 260,150 C 340,140 420,180 540,80"
                    stroke="url(#routeGrad)"
                    strokeWidth="4"
                    strokeDasharray="6 3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="240" r="7" fill="#fea619" />
                  <circle cx="60" cy="240" r="3" fill="#ffffff" />
                  <circle cx="540" cy="80" r="8" fill="#00855d" />
                  <circle cx="540" cy="80" r="4" fill="#ffffff" />
                  <circle
                    cx={60 + (480 * ambulanceProgress) / 100}
                    cy={240 - (160 * ambulanceProgress) / 100 + (Math.sin(ambulanceProgress / 10) * 12)}
                    r="6"
                    fill="#10b981"
                    className="animate-ping"
                  />
                  <circle
                    cx={60 + (480 * ambulanceProgress) / 100}
                    cy={240 - (160 * ambulanceProgress) / 100 + (Math.sin(ambulanceProgress / 10) * 12)}
                    r="4"
                    fill="#ffffff"
                  />
                </svg>

                <div className="absolute inset-0 p-2.5 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div className="neu-flat px-2.5 py-0.5 rounded-full flex items-center gap-1.5 pointer-events-auto shadow-xs text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-sm text-[9.5px] font-bold text-on-surface">
                        NH-60 CORRIDOR CLEAR
                      </span>
                    </div>
                    <div className="neu-flat px-2 py-0.5 rounded-full font-label-sm text-[9.5px] text-on-surface-variant pointer-events-auto">
                      Traffic: Light (+0 min)
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full px-2">
                    <div className="neu-flat px-2 py-0.5 rounded-lg text-left pointer-events-auto">
                      <span className="font-label-sm text-[8.5px] text-on-surface-variant block uppercase">
                        ORIGIN
                      </span>
                      <span className="font-label-sm text-[9.5px] font-bold text-on-surface">
                        SDH Manmad
                      </span>
                    </div>

                    <div className="neu-primary-glow px-2.5 py-0.5 rounded-lg text-center pointer-events-auto text-on-primary shadow-xs">
                      <span className="font-label-sm text-[8.5px] uppercase block tracking-wider font-semibold">
                        AMBULANCE
                      </span>
                      <span className="font-label-sm text-[9.5px] font-bold font-mono">
                        MH-15-TC-402
                      </span>
                    </div>

                    <div className="neu-flat px-2 py-0.5 rounded-lg text-right pointer-events-auto">
                      <span className="font-label-sm text-[8.5px] text-on-surface-variant block uppercase">
                        DESTINATION
                      </span>
                      <span className="font-label-sm text-[9.5px] font-bold text-primary">
                        Civil Hospital
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-on-surface font-label-sm text-[9.5px] neu-flat px-2.5 py-0.5 rounded-full pointer-events-auto">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary">
                        local_police
                      </span>
                      Nashik Traffic Police Green Wave Active
                    </span>
                    <span className="font-mono text-primary font-bold">Speed: 68 km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Tactile Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="neu-inset p-2 rounded-xl flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-semibold">
                    ICU STATUS
                  </span>
                  <span className="neu-flat px-1 py-0.2 rounded text-[8.5px] font-label-sm text-primary font-bold">
                    LIVE
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-primary block">3 Free Beds</span>
                  <p className="text-[10.5px] text-on-surface font-medium leading-tight">Bed #04 Locked</p>
                  <span className="font-label-sm text-[8.5px] text-on-surface-variant block">Ventilator-Ready CCU-B</span>
                </div>
              </div>

              <div className="neu-inset p-2 rounded-xl flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-semibold">
                    CATH/BIO LAB
                  </span>
                  <span className="neu-flat px-1 py-0.2 rounded text-[8.5px] font-label-sm text-on-surface-variant">
                    10m ago
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">Trop-I STAT</span>
                  <p className="text-[10.5px] text-on-surface font-medium leading-tight">Online 24/7 Desk</p>
                  <span className="font-label-sm text-[8.5px] text-primary font-semibold block">High-Sens Assay</span>
                </div>
              </div>

              <div className="neu-inset p-2 rounded-xl flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-semibold">
                    DIAGNOSTIC
                  </span>
                  <span className="neu-flat px-1 py-0.2 rounded text-[8.5px] font-label-sm text-primary font-bold">
                    ACK'D
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">ECG Sent</span>
                  <p className="text-[10.5px] text-on-surface font-medium leading-tight">12-Lead DICOM</p>
                  <span className="font-label-sm text-[8.5px] text-on-surface-variant block">Delivered 12m ago</span>
                </div>
              </div>
            </div>

            {/* Receiving Officer Box */}
            <div className="neu-inset p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="neu-flat p-0.5 rounded-xl w-10 h-10 shrink-0 overflow-hidden">
                  <img
                    alt="Dr. Rajesh Varma"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-lg"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6EIPtDhXbj0owZsrHvTZxFNgF6dFjy0VINN9z6PNqNQJNIswnxtTHxDQ8z8_lEDvO6ms07J-K1cbWjr6Fr1PbgKvW4aR1mTgAPpjTDBn1UlUFKzUUZ2t69kzbgboGcnt5mOOw5cXQdE-oPNoRJc3s_UIC5gcDPNDgaqA_H_ob1Rs48tlH0Nt8Ou1DywNtwdWcXJATTzsDHOmULvcjbJwnQ2rx-o-4lirNshUYv-aLTzeM_Lmjuw"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div>
                  <span className="font-label-sm text-[9px] text-primary uppercase font-bold tracking-wider block">
                    RECEIVING NODAL OFFICER
                  </span>
                  <span className="text-xs font-bold text-on-surface">
                    Dr. Rajesh Varma
                  </span>
                  <span className="text-[10.5px] text-on-surface-variant block leading-tight">
                    Cardiology Nodal Officer · On Shift Nashik DH · Intercom: <strong className="font-mono text-on-surface">#8812</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  className="neu-flat hover:neu-inset active:scale-95 px-2.5 py-1 rounded-lg font-label-sm text-[10px] font-bold text-on-surface flex items-center gap-1 transition-all cursor-pointer"
                  href="tel:+91253257000"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary">phone_in_talk</span>
                  Call
                </a>
                <button
                  onClick={onOpenTeleConsult}
                  className="neu-primary-glow active:scale-95 px-2.5 py-1 rounded-lg font-label-sm text-[10px] font-bold text-on-primary flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">videocam</span>
                  Tele-Consult
                </button>
              </div>
            </div>
          </div>

          {/* 2. ALTERNATIVE ROUTING FACILITIES */}
          <div className="neu-flat rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">alt_route</span>
                <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                  Network Alternative Routing Facilities
                </h3>
              </div>
              <span className="neu-inset px-2 py-0.2 rounded-full font-label-sm text-[9px] text-on-surface-variant">
                GEO-REDUNDANCY MATRIX
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="neu-concave-deep p-2 rounded-xl flex flex-col justify-between gap-1 opacity-80">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="neu-inset px-1.5 py-0.2 rounded font-label-sm text-[8.5px] text-on-surface-variant font-bold uppercase">
                      SUB-CENTER
                    </span>
                    <h4 className="text-xs font-bold text-on-surface mt-0.5">RH Dindori</h4>
                    <p className="text-[10px] text-on-surface-variant">21 km away (~26 min)</p>
                  </div>
                  <span className="neu-flat px-1.5 py-0.5 rounded-full font-label-sm text-[9px] text-error font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">block</span>
                    Exhausted
                  </span>
                </div>
                <div className="neu-flat p-1.5 rounded-lg text-on-surface-variant text-[10px] leading-tight">
                  <span className="font-semibold text-error block">No Ventilator Beds Available</span>
                  Basic stabilization only.
                </div>
                <button
                  className="neu-inset px-2 py-1 rounded-lg font-label-sm text-[9.5px] text-outline cursor-not-allowed"
                  disabled
                  type="button"
                >
                  Route Deprioritized
                </button>
              </div>

              <div
                className={`p-2 rounded-xl flex flex-col justify-between gap-1 transition-all ${
                  backupArmed ? 'neu-flat ring-1 ring-secondary' : 'neu-inset'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="neu-flat px-1.5 py-0.2 rounded font-label-sm text-[8.5px] text-secondary font-bold uppercase">
                      TERTIARY ESCALATION
                    </span>
                    <h4 className="text-xs font-bold text-on-surface mt-0.5">Govt Medical College, Dhule</h4>
                    <p className="text-[10px] text-on-surface-variant">86 km away (~1h 24m)</p>
                  </div>
                  <span className="neu-flat px-1.5 py-0.5 rounded-full font-label-sm text-[9px] text-primary font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">check</span>
                    Available
                  </span>
                </div>

                <div className="neu-flat p-1.5 rounded-lg text-on-surface-variant text-[10px] leading-tight">
                  <span className="font-semibold text-primary block">Full Surgical Cath Backup (8 CCU)</span>
                  Secondary fallback protocol.
                </div>

                <button
                  onClick={handleArmBackup}
                  className={`px-2 py-1 rounded-lg font-label-sm text-[9.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    backupArmed
                      ? 'neu-inset text-primary font-bold'
                      : 'neu-flat hover:neu-inset active:scale-95 text-secondary'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {backupArmed ? 'check_circle' : 'turn_right'}
                  </span>
                  {backupArmed ? 'Backup Active' : 'Arm Backup Route'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
