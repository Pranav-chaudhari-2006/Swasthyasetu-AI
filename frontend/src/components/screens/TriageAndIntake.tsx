import React, { useState, useEffect } from 'react';
import { ClinicalModule } from '../../types/clinical';

interface TriageAndIntakeProps {
  onNavigate: (module: ClinicalModule) => void;
  onOpenEmergency: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const TriageAndIntake: React.FC<TriageAndIntakeProps> = ({
  onNavigate,
  onOpenEmergency: _onOpenEmergency,
  onShowToast,
}) => {
  const [selectedDialect, setSelectedDialect] = useState<'hindi' | 'marathi' | 'english'>('hindi');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [dictateText, setDictateText] = useState('');
  const [showDictateModal, setShowDictateModal] = useState(false);

  const [barHeights, setBarHeights] = useState<number[]>([
    25, 45, 75, 55, 85, 60, 35, 50, 70, 90, 65, 40, 80, 55, 30, 50, 80, 60, 35, 20,
  ]);

  const [checks, setChecks] = useState({
    sweating: true,
    radiating: true,
    tightness: true,
    dyspnea: true,
  });

  const [preAlertSent, setPreAlertSent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 60) + (isPlayingAudio ? 30 : 15))
      );
    }, 250);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const activeCheckCount = Object.values(checks).filter(Boolean).length;
  const calculatedProbability =
    activeCheckCount === 4
      ? 87.2
      : activeCheckCount === 3
      ? 74.8
      : activeCheckCount === 2
      ? 58.5
      : 34.0;

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreAlert = () => {
    setPreAlertSent(true);
    onShowToast(
      '108 MEMS Sector Pre-Alert Broadcasted',
      'Unit MH-12-AX-8910 queued on high standby with GPS tracking armed.',
      'emergency'
    );
  };

  const transcripts = {
    hindi: {
      aiSpeaker: 'SwasthyaSetu AI Clarifier',
      aiText: 'सुनीता जी, कितने समय से सीने में दर्द और सांस लेने में तकलीफ हो रही है?',
      aiSub: 'Context Translation: "Sunita ji, how long have you been experiencing this chest tightness and difficulty breathing?"',
      patientText: 'कल शाम से दर्द बढ़ गया है, चलने पर पसीना और घबराहट होती है।',
      patientParsed:
        'Intent Parsed: Onset ~18h prior • Continuous retrosternal discomfort • Diaphoresis & presyncope upon minimal ambulation',
    },
    marathi: {
      aiSpeaker: 'SwasthyaSetu AI स्पष्टीकरण',
      aiText: 'सुनीता ताई, किती वेळापासून छातीत दुखत आहे आणि श्वास घ्यायला त्रास होतोय?',
      aiSub: 'Context Translation: "Sunita tai, since when has your chest pain and breathlessness persisted?"',
      patientText: 'काल संध्याकाळपासून दुखणं वाढलंय, चालल्यावर खूप घाम येतो आणि चक्कर आल्यासारखं होतं.',
      patientParsed:
        'Intent Parsed: Acute retrosternal heaviness since yesterday evening • Exertional syncope & cold diaphoresis',
    },
    english: {
      aiSpeaker: 'SwasthyaSetu Clinical Speech Clarifier',
      aiText: '"Mrs. Sunita, how long has this chest tightness and dyspnea been present?"',
      aiSub: 'Native Audio: Stripped Hindi-Marathi Dialect Token Stream (V4.2)',
      patientText: '"The pain worsened yesterday evening; whenever I walk, I break into cold sweat and feel palpitations."',
      patientParsed:
        'Intent Parsed: Onset ~18h prior • Continuous retrosternal discomfort • Diaphoresis & presyncope upon minimal ambulation',
    },
  };

  return (
    <div className="flex flex-col w-full gap-3 pb-6">
      {/* TOP PATIENT HEADER */}
      <section className="w-full rounded-xl neu-flat p-3.5 transition-all relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
          {/* Patient Identity Specimen */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0 w-11 h-11 rounded-full neu-inset flex items-center justify-center">
              <span className="text-sm font-bold text-primary font-headline-sm">SD</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-surface-container-low animate-pulse"></span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-base font-bold text-on-surface tracking-tight truncate font-headline-md">
                  Sunita Devi
                </h1>
                <span className="text-xs text-on-surface-variant font-medium">
                  (42y • Female)
                </span>
                <div className="neu-crimson-pill px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <span className="material-symbols-outlined text-[13px] text-on-tertiary">
                    notification_important
                  </span>
                  <span className="font-label-sm text-[9.5px] text-on-tertiary font-bold tracking-wider uppercase">
                    ACUTE CARDIO-RESP ESCALATION
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-on-surface-variant font-label-md">
                <span>
                  UHID: <strong className="text-on-surface font-semibold">MH-PUN-2024-8841</strong>
                </span>
                <span>•</span>
                <span>
                  ABHA: <strong className="text-on-surface font-semibold">91-4201-9982-1029</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">badge</span>
                  ASHA Anita Bai{' '}
                  <span className="text-on-surface-variant/70 font-normal">(#MH-401)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Live Clinical Architecture Status Pills */}
          <div className="flex flex-wrap items-center gap-2 lg:self-center">
            <div
              className="neu-inset px-2.5 py-0.5 rounded-full flex items-center gap-1.5 cursor-help"
              title="Encrypted in-memory and local SQLite database cache synchronized"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-sm text-[10px] font-semibold text-on-surface">
                CACHE: ARMED &amp; SYNCING
              </span>
            </div>
            <div
              className="neu-inset px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-help"
              title="Point-of-service link verified with Sub-District hospital CCU"
            >
              <span className="material-symbols-outlined text-[12px] text-secondary">hub</span>
              <span className="font-label-sm text-[10px] font-semibold text-on-surface">
                SUB-DISTRICT LINK POS
              </span>
            </div>
            <div className="neu-flat px-2.5 py-0.5 rounded-full flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[12px]">translate</span>
              <span className="font-label-sm text-[10px] font-medium">
                Hindi / Marathi (Dialect V4)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN 2-COLUMN CLINICAL GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN (7 COLS) */}
        <div className="xl:col-span-7 flex flex-col gap-3 min-w-0">
          {/* 1. BHASHINI NEURAL LISTENER CARD */}
          <section className="rounded-xl neu-flat p-3.5 flex flex-col gap-2.5">
            {/* Module Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isPlayingAudio ? 'neu-inset text-tertiary' : 'neu-flat text-primary'
                  }`}
                  title={isPlayingAudio ? 'Pause Acoustic Stream' : 'Microphone Sensor Array Active'}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isPlayingAudio ? 'graphic_eq' : 'mic'}
                  </span>
                </button>
                <div>
                  <h2 className="text-sm font-bold text-on-surface tracking-tight font-headline-sm">
                    Bhashini Neural Listener
                  </h2>
                  <p className="font-label-sm text-[9.5px] text-on-surface-variant uppercase tracking-wider">
                    ADAPTIVE CLINICAL SPEECH-TO-INTENT V4.2
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-md neu-inset text-primary font-semibold">
                  98.4% Confidence
                </span>
                <div className="w-2 h-2 rounded-full bg-primary-container animate-ping"></div>
              </div>
            </div>

            {/* Debossed Audio Waveform Well */}
            <div className="w-full rounded-lg neu-concave-deep p-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-label-sm text-[9.5px] text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  TELEMETRY STREAM • 16 KHZ RAW PII-STRIPPED
                </span>
                <span>Buffer: 0.12s • Audio S/N: 42dB</span>
              </div>

              {/* Animated Audio Visualizer Bars */}
              <div
                className="h-10 flex items-end justify-between gap-1 px-1 py-0.5 overflow-hidden"
                id="audio-visualizer"
              >
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-full transition-all duration-200 ${
                      i % 4 === 0
                        ? 'bg-primary-container'
                        : i % 3 === 0
                        ? 'bg-primary'
                        : i % 2 === 0
                        ? 'bg-primary/80'
                        : 'bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Synchronized Transcript Feed */}
            <div className="flex flex-col gap-2">
              {/* AI Clarifier Speech Bubble */}
              <div className="rounded-lg neu-inset p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10.5px] font-semibold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    {transcripts[selectedDialect].aiSpeaker}{' '}
                    <span className="text-on-surface-variant font-normal">[NON-AUTHORITATIVE]</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">
                    14:02:18 IST
                  </span>
                </div>
                <blockquote className="text-xs text-on-surface font-medium italic pl-1">
                  "{transcripts[selectedDialect].aiText}"
                </blockquote>
                <p className="text-[11px] text-on-surface-variant">
                  {transcripts[selectedDialect].aiSub}
                </p>
              </div>

              {/* Patient Intake Bubble */}
              <div className="rounded-lg neu-flat p-2.5 flex flex-col gap-1 ml-3">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[10.5px] font-semibold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                    Patient Intake via ASHA Anita Bai
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">
                    14:02:44 IST
                  </span>
                </div>
                <blockquote className="text-xs text-on-surface font-medium italic pl-1">
                  "{transcripts[selectedDialect].patientText}"
                </blockquote>
                <div className="p-1 rounded neu-inset mt-0.5">
                  <p className="font-label-sm text-[10.5px] text-primary font-medium">
                    {transcripts[selectedDialect].patientParsed}
                  </p>
                </div>
              </div>
            </div>

            {/* Transcript Controls & Language Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                {(['hindi', 'marathi', 'english'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedDialect(lang)}
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-[10px] transition-all cursor-pointer ${
                      selectedDialect === lang
                        ? 'neu-inset text-primary font-bold'
                        : 'neu-flat text-on-surface-variant hover:text-on-surface font-medium'
                    }`}
                  >
                    {lang === 'hindi'
                      ? 'Hindi (Devanagari)'
                      : lang === 'marathi'
                      ? 'Marathi'
                      : 'English (Medical)'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsPlayingAudio(true);
                    onShowToast(
                      'Replaying Audio Log',
                      'Playing 16kHz original acoustic intake recording with ASHA Anita Bai.',
                      'info'
                    );
                    setTimeout(() => setIsPlayingAudio(false), 3000);
                  }}
                  className="neu-flat px-2.5 py-1 rounded-lg flex items-center gap-1 text-on-surface hover:text-primary transition-colors active:scale-95 cursor-pointer text-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">replay</span>
                  <span className="font-label-sm text-[10px] font-medium">Replay</span>
                </button>
                <button
                  onClick={() => setShowDictateModal(true)}
                  className="neu-primary-glow px-3 py-1 rounded-lg flex items-center gap-1 text-on-primary transition-transform active:scale-95 shadow-xs cursor-pointer text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-[15px]">add_comment</span>
                  <span className="font-label-sm text-[10px]">Dictate Clarification</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. PHYSICAL OBSERVATIONS CHECK CARD */}
          <section className="rounded-xl neu-flat p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-on-surface tracking-tight font-headline-sm">
                  Physical Observations Check
                </h2>
                <p className="font-label-sm text-[9.5px] text-on-surface-variant uppercase tracking-wider">
                  TACTILE RAPID EXAM MATRIX • FIELD-VALIDATED
                </p>
              </div>
              <span className="font-label-sm text-[10px] neu-inset px-2.5 py-0.5 rounded-full text-secondary font-semibold">
                {activeCheckCount} / 4 CRITICAL CHECKS
              </span>
            </div>

            {/* 2x2 Grid of Tactile Symptom Toggle Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                {
                  key: 'sweating',
                  title: 'Sweating Present (Diaphoresis)',
                  desc: 'Profuse cold clammyness documented during baseline vitals by field worker.',
                },
                {
                  key: 'radiating',
                  title: 'Radiating to Left Arm',
                  desc: 'Continuous radiating pain pattern along medial left brachial line.',
                },
                {
                  key: 'tightness',
                  title: 'Chest Tightness > 30 Mins',
                  desc: 'Continuous retrosternal constricting ache sustained overnight (~18h).',
                },
                {
                  key: 'dyspnea',
                  title: 'Resting Dyspnea',
                  desc: 'Shortness of breath observed while seated upright; worsened on movement.',
                },
              ].map((item) => {
                const isChecked = checks[item.key as keyof typeof checks];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCheck(item.key as keyof typeof checks)}
                    className={`p-2.5 rounded-xl cursor-pointer select-none flex items-start gap-2.5 transition-all ${
                      isChecked ? 'neu-flat hover:-translate-y-0.5' : 'neu-inset opacity-75'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'neu-inset text-primary' : 'neu-flat text-outline-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] font-bold">
                        {isChecked ? 'check' : 'remove'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-on-surface block leading-tight">
                        {item.title}
                      </span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (5 COLS) */}
        <div className="xl:col-span-5 flex flex-col gap-3 min-w-0">
          {/* 1. DETERMINISTIC SAFETY ENGINE CARD */}
          <section className="rounded-xl neu-flat p-3.5 flex flex-col gap-2.5">
            {/* Header & Lock Status */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full neu-inset flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-tight">
                    Deterministic Safety Engine
                  </span>
                  <span className="font-label-sm text-[9px] text-primary font-bold uppercase tracking-wider">
                    V2.4 PROTOCOL LOCKED
                  </span>
                </div>
              </div>
              <span className="font-label-sm text-[9.5px] px-2 py-0.5 rounded neu-inset text-on-surface-variant">
                ICMR ACS-2023
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-tight">
              LLM conversational outputs are strictly parsed and evaluated against hard-coded Indian
              Council of Medical Research (ICMR) emergency triage matrices.
            </p>

            {/* Activated Rule Trigger Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-full neu-flat font-label-sm text-[9.5px] text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">lock</span>
                R-CARDIAC-SUSPECT-04
              </span>
              <span className="px-2 py-0.5 rounded-full neu-flat font-label-sm text-[9.5px] text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">lock</span>
                R-RESP-02 (Exertional)
              </span>
              <span className="px-2 py-0.5 rounded-full neu-flat font-label-sm text-[9.5px] text-on-surface-variant font-medium">
                R-AGE-FEMALE-CARDIO
              </span>
            </div>

            {/* Computed Triage Vector Box */}
            <div className="rounded-xl neu-concave-deep p-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="neu-crimson-pill px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                  <span className="material-symbols-outlined text-[12px] text-on-tertiary">
                    emergency
                  </span>
                  <span className="font-label-sm text-[9.5px] font-bold text-on-tertiary uppercase">
                    CODE AMBER-HIGH
                  </span>
                </div>
                <span className="font-label-sm text-[10px] text-on-surface-variant font-medium font-mono">
                  ACS PROBABILITY: {calculatedProbability.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-xs font-bold text-on-surface font-headline-sm">
                Same-Day Emergency Routing Required
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-snug">
                Clinical high probability of Acute Coronary Syndrome (ACS) with non-exertional
                dyspnea and radiation. Immediate 12-lead ECG, loading doses (Aspirin 300mg +
                Clopidogrel 300mg as per protocol), and nearest secondary hub transfer mandatory.
              </p>
            </div>

            {/* Suggested Destination Hub Card */}
            <div className="rounded-xl neu-flat p-2.5 flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[15px]">local_hospital</span>
                  <span className="font-label-sm text-[9.5px] font-bold uppercase">
                    Designated Secondary Center
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface block truncate mt-0.5 font-headline-sm">
                  Sub-District Hospital, Baramati
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  CCU Available • 14 km (approx. 22 mins ETA)
                </span>
              </div>
              <button
                onClick={() => onNavigate('referrals-and-facilities')}
                className="w-8 h-8 rounded-full neu-flat flex items-center justify-center text-primary shrink-0 hover:neu-inset active:scale-95 transition-all cursor-pointer"
                title="View Facility Details"
              >
                <span className="material-symbols-outlined text-[16px]">near_me</span>
              </button>
            </div>

            {/* Primary Action Triggers */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              <button
                onClick={() => onNavigate('referrals-and-facilities')}
                className="neu-primary-glow w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-on-primary text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Proceed to Verified Facility Routing</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={() => onNavigate('vitals-and-telemetry')}
                className="neu-flat w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-on-surface hover:text-primary text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">ecg_heart</span>
                <span>Record Telemetry Vitals First</span>
              </button>
            </div>

            {/* Security & Audit Footnote */}
            <div className="pt-0.5 flex items-center justify-between font-label-sm text-[9.5px] text-on-surface-variant">
              <span className="truncate font-mono">HMAC-SHA256: 7f8c...9a0e</span>
              <span className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[12px]">encrypted</span>
                ABDM Safe-Harbor Tagged
              </span>
            </div>
          </section>

          {/* 2. 108 MEMS STANDBY / EMERGENCY LINK */}
          <section className="rounded-xl neu-flat p-3 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg neu-inset flex items-center justify-center text-tertiary shrink-0">
                <span className="material-symbols-outlined text-[20px]">ambulance</span>
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-on-surface block truncate">
                  108 MEMS Direct Standby
                </span>
                <p className="text-[11px] text-on-surface-variant truncate">
                  Unit MH-12-AX-8910 active in sector (8 mins away)
                </p>
              </div>
            </div>
            <button
              onClick={handlePreAlert}
              disabled={preAlertSent}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 shrink-0 transition-transform active:scale-95 font-label-sm text-[10px] font-bold cursor-pointer ${
                preAlertSent
                  ? 'neu-inset text-primary cursor-default'
                  : 'neu-flat text-tertiary hover:text-tertiary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {preAlertSent ? 'task_alt' : 'broadcast_on_personal'}
              </span>
              <span>{preAlertSent ? 'PRE-ALERTED' : 'PRE-ALERT'}</span>
            </button>
          </section>
        </div>
      </div>

      {/* Dictate Clarification Modal */}
      {showDictateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="neu-flat rounded-2xl p-4 max-w-md w-full space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">mic</span>
                <h3 className="text-sm font-bold text-on-surface">Dictate Clinical Clarification</h3>
              </div>
              <button
                onClick={() => setShowDictateModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Record doctor-to-field worker clinical interrogation with real-time dialect translation.
            </p>

            <div className="neu-concave-deep p-3 rounded-xl flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => {
                  setDictating(!dictating);
                  if (!dictating) {
                    setDictateText('Inquiring on history of diabetes and previous nitroglycerin use...');
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                  dictating ? 'bg-error animate-pulse' : 'neu-primary-glow'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {dictating ? 'stop' : 'mic'}
                </span>
              </button>
              <span className="font-label-sm text-[10px] font-semibold text-on-surface-variant">
                {dictating ? 'Recording speech stream (16 kHz)...' : 'Tap to start dictation'}
              </span>
            </div>

            <div className="neu-inset p-2 rounded-lg">
              <textarea
                value={dictateText}
                onChange={(e) => setDictateText(e.target.value)}
                placeholder="Transcribed physician query will appear here..."
                rows={2}
                className="w-full bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDictateModal(false)}
                className="neu-flat px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDictateModal(false);
                  onShowToast(
                    'Clarification Relayed to ASHA',
                    'Acoustic translation broadcasted to Anita Bai device with high dialect confidence.',
                    'success'
                  );
                }}
                className="neu-primary-glow px-3 py-1.5 rounded-lg text-xs font-bold text-on-primary cursor-pointer"
              >
                Broadcast to Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
