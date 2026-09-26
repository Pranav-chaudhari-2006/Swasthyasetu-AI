import React from 'react';
import { 
  HeartPulse, User, Users, Stethoscope, Building2, 
  Activity, PhoneCall, Globe, Wifi, WifiOff 
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isOnline: boolean;
  gatewayStatus: string;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  isOnline,
  gatewayStatus,
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <header className="navbar">
      <div className="brand">
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(13, 148, 136, 0.4)'
        }}>
          <HeartPulse size={22} color="#ffffff" />
        </div>
        <div>
          <span className="brand-title">SwasthyaSetu AI</span>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.05em' }}>
            NATIONAL CLINICAL CONTINUITY PLATFORM
          </span>
        </div>
      </div>

      <nav className="role-switcher">
        <button 
          className={`role-btn ${currentRole === 'PATIENT' ? 'active' : ''}`}
          onClick={() => onRoleChange('PATIENT')}
          title="Patient Mobile PWA Portal"
        >
          <User size={15} /> Patient PWA
        </button>
        <button 
          className={`role-btn ${currentRole === 'ASHA' ? 'active' : ''}`}
          onClick={() => onRoleChange('ASHA')}
          title="Frontline Health Worker (ASHA / ANM)"
        >
          <Users size={15} /> Frontline ASHA
        </button>
        <button 
          className={`role-btn ${currentRole === 'DOCTOR' ? 'active' : ''}`}
          onClick={() => onRoleChange('DOCTOR')}
          title="Facility Clinician & Medical Officer"
        >
          <Stethoscope size={15} /> Doctor & Facility
        </button>
        <button 
          className={`role-btn ${currentRole === 'DHO' ? 'active' : ''}`}
          onClick={() => onRoleChange('DHO')}
          title="District Health Officer Dashboard"
        >
          <Building2 size={15} /> DHO Command
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <Globe size={14} color="var(--text-muted)" />
          <select 
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-main)', 
              fontSize: '0.75rem', 
              padding: 0,
              cursor: 'pointer' 
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>

        {/* Connectivity Badge */}
        <div 
          className={`badge ${isOnline ? 'badge-routine' : 'badge-offline'}`}
          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
          title={isOnline ? 'Connected to National Gateway' : 'Running Offline Mode (Local Cryptographic Cache)'}
        >
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>

        {/* Emergency Hotline Button */}
        <a 
          href="tel:108"
          className="btn-emergency pulse-emergency"
          style={{ padding: '6px 14px', fontSize: '0.78rem', textDecoration: 'none' }}
          title="Direct Toll-Free Dispatch for Medical Emergencies"
        >
          <PhoneCall size={14} /> 108 EMERGENCY
        </a>
      </div>
    </header>
  );
};
