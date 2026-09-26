/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicalModule, ToastMessage } from './types/clinical';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TriageAndIntake } from './components/screens/TriageAndIntake';
import { VitalsAndTelemetry } from './components/screens/VitalsAndTelemetry';
import { ReferralsAndFacilities } from './components/screens/ReferralsAndFacilities';
import { CarePlansAndTasks } from './components/screens/CarePlansAndTasks';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { TeleConsultModal } from './components/modals/TeleConsultModal';
import { FhirExportModal } from './components/modals/FhirExportModal';
import { CarePlanModal } from './components/modals/CarePlanModal';
import { EhrTimelineModal } from './components/modals/EhrTimelineModal';
import { Toast } from './components/Toast';

export default function App() {
  const [activeModule, setActiveModule] = useState<ClinicalModule>('triage-and-intake');
  const [currentHospital, setCurrentHospital] = useState('District Civil Hospital, Nashik');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal states
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isTeleConsultModalOpen, setIsTeleConsultModalOpen] = useState(false);
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [isCarePlanModalOpen, setIsCarePlanModalOpen] = useState(false);
  const [isEhrTimelineOpen, setIsEhrTimelineOpen] = useState(false);

  // Toast stack
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'emergency' | 'info' = 'info'
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSearchQuery = (q: string) => {
    if (!q) return;
    const lower = q.toLowerCase();
    if (lower.includes('vital') || lower.includes('ecg') || lower.includes('bp') || lower.includes('telemetry')) {
      setActiveModule('vitals-and-telemetry');
      addToast('Search Query Matched', 'Routed to Vitals & Telemetry module.', 'info');
    } else if (lower.includes('referral') || lower.includes('ambulance') || lower.includes('108') || lower.includes('facility') || lower.includes('bed')) {
      setActiveModule('referrals-and-facilities');
      addToast('Search Query Matched', 'Routed to Referrals & Facilities module.', 'info');
    } else if (lower.includes('care') || lower.includes('task') || lower.includes('rx') || lower.includes('medicine') || lower.includes('ecosprin')) {
      setActiveModule('care-plans-and-tasks');
      addToast('Search Query Matched', 'Routed to Care Plans & Tasks module.', 'info');
    } else if (lower.includes('sunita') || lower.includes('triage') || lower.includes('intake') || lower.includes('bhashini')) {
      setActiveModule('triage-and-intake');
      addToast('Patient Record Found', 'Opening Sunita Devi (#MH-PUN-2024-8841) Triage & Intake.', 'success');
    }
  };

  return (
    <div className="bg-surface-container-low font-body-md text-on-surface antialiased min-h-screen text-[13px]">
      {/* Top Navigation Bar */}
      <Header
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onSearchQuery={handleSearchQuery}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        currentHospital={currentHospital}
        onSelectHospital={(h) => {
          setCurrentHospital(h);
          addToast('Command Hub Changed', `Switched active clinical node to ${h}`, 'info');
        }}
      />

      {/* Persistent Left Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Clinical Viewport */}
      <div className="lg:pl-52">
        <main className="relative w-full pt-14 min-h-screen bg-surface-container-low px-3 md:px-4 py-3">
          {activeModule === 'triage-and-intake' && (
            <TriageAndIntake
              onNavigate={(mod) => {
                setActiveModule(mod);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              onShowToast={addToast}
            />
          )}

          {activeModule === 'vitals-and-telemetry' && (
            <VitalsAndTelemetry
              onNavigate={(mod) => {
                setActiveModule(mod);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenTeleConsult={() => setIsTeleConsultModalOpen(true)}
              onOpenFhirExport={() => setIsFhirModalOpen(true)}
              onOpenEhrTimeline={() => setIsEhrTimelineOpen(true)}
              onShowToast={addToast}
            />
          )}

          {activeModule === 'referrals-and-facilities' && (
            <ReferralsAndFacilities
              onNavigate={(mod) => {
                setActiveModule(mod);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenEmergency={() => setIsEmergencyModalOpen(true)}
              onOpenTeleConsult={() => setIsTeleConsultModalOpen(true)}
              onOpenAuditDocket={() => setIsEhrTimelineOpen(true)}
              onShowToast={addToast}
            />
          )}

          {activeModule === 'care-plans-and-tasks' && (
            <CarePlansAndTasks
              onNavigate={(mod) => {
                setActiveModule(mod);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCarePlanExport={() => setIsCarePlanModalOpen(true)}
              onOpenSosModal={() => setIsEmergencyModalOpen(true)}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onShowToast={addToast}
      />

      <TeleConsultModal
        isOpen={isTeleConsultModalOpen}
        onClose={() => setIsTeleConsultModalOpen(false)}
        onShowToast={addToast}
      />

      <FhirExportModal
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
        onShowToast={addToast}
      />

      <CarePlanModal
        isOpen={isCarePlanModalOpen}
        onClose={() => setIsCarePlanModalOpen(false)}
        onShowToast={addToast}
      />

      <EhrTimelineModal
        isOpen={isEhrTimelineOpen}
        onClose={() => setIsEhrTimelineOpen(false)}
      />

      {/* Tactile Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
