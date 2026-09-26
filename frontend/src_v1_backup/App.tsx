import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { PatientPortal } from './views/PatientPortal';
import { FrontlinePortal } from './views/FrontlinePortal';
import { DoctorPortal } from './views/DoctorPortal';
import { DhoDashboard } from './views/DhoDashboard';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('PATIENT');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [gatewayStatus, setGatewayStatus] = useState<string>('HEALTHY');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Gateway health ping
    api.checkHealth().then(res => {
      setGatewayStatus(res.status);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-container">
      <Navbar 
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isOnline={isOnline}
        gatewayStatus={gatewayStatus}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      <main className="main-content">
        {currentRole === 'PATIENT' && <PatientPortal />}
        {currentRole === 'ASHA' && <FrontlinePortal />}
        {currentRole === 'DOCTOR' && <DoctorPortal />}
        {currentRole === 'DHO' && <DhoDashboard />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px 24px',
        color: 'var(--text-subtle)',
        fontSize: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: '40px',
        background: 'rgba(15, 23, 42, 0.6)'
      }}>
        <p style={{ marginBottom: '4px', fontWeight: 600 }}>
          SwasthyaSetu AI • National Clinical Continuity Platform
        </p>
        <p>
          ABDM (Ayushman Bharat Digital Mission) FHIR R4 Ready • Deterministic Clinical Safety Engine v1.2 • Zero Mock Grounded Architecture
        </p>
      </footer>
    </div>
  );
};

export default App;
