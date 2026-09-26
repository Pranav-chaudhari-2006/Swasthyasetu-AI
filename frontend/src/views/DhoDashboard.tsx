import React, { useState, useEffect } from 'react';
import { 
  Building2, Activity, AlertOctagon, TrendingUp, 
  MapPin, ShieldAlert, PhoneCall, Bed, HeartPulse, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { Facility, EmergencyDispatch } from '../types';

export const DhoDashboard: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [ambulances, setAmbulances] = useState<EmergencyDispatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDhoData();
    const interval = setInterval(loadDhoData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDhoData = async () => {
    setIsLoading(true);
    try {
      const facs = await api.getDistrictFacilities();
      const emgs = await api.getActiveAmbulances();
      setFacilities(facs);
      setAmbulances(emgs);
    } finally {
      setIsLoading(false);
    }
  };

  const totalBeds = facilities.reduce((acc, f) => acc + f.beds_total, 0);
  const availableBeds = facilities.reduce((acc, f) => acc + f.beds_available, 0);
  const totalIcuAvailable = facilities.reduce((acc, f) => acc + f.icu_available, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top DHO Command Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Pune District Health Command Center</h2>
              <span className="badge badge-routine" style={{ fontSize: '0.7rem' }}>LIVE GOVERNANCE</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Jurisdiction: Pune District (14 Talukas) • Supervised by District Health Officer & Collectorate
            </p>
          </div>
        </div>

        <button 
          className="btn-secondary" 
          onClick={loadDhoData}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={15} className={isLoading ? 'pulse-emergency' : ''} />
          {isLoading ? 'Updating Telemetry...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Top 4 Key Indicator Cards */}
      <div className="grid-4">
        <div className="stat-card">
          <span className="stat-label">Referral Conversion Rate</span>
          <span className="stat-val" style={{ color: '#10b981' }}>98.4%</span>
          <span className="stat-sub">2,481 completed transitions</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Emergency 108 Avg ETA</span>
          <span className="stat-val" style={{ color: '#38bdf8' }}>11.8 min</span>
          <span className="stat-sub">Zero-Click Facility Bypass active</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">District Bed Occupancy</span>
          <span className="stat-val">
            {totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0}%
          </span>
          <span className="stat-sub">{availableBeds} / {totalBeds} general beds open</span>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(225, 29, 72, 0.4)' }}>
          <span className="stat-label" style={{ color: '#ff6b8b' }}>Critical L3 Escalations</span>
          <span className="stat-val" style={{ color: '#e11d48' }}>3 Active</span>
          <span className="stat-sub">Requiring immediate DHO intervention</span>
        </div>
      </div>

      {/* Live 108 Emergency Telemetry & Ambulance Tracking */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#e11d48" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live 108 Emergency Telemetry Stream</h3>
          </div>
          <span className="badge badge-emergency" style={{ fontSize: '0.7rem' }}>
            {ambulances.length} Active Dispatches
          </span>
        </div>

        <div className="grid-2">
          {ambulances.map(amb => (
            <div 
              key={amb.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-emergency">{amb.severity} SEVERITY</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                  Call Sign: {amb.ambulance_call_sign}
                </span>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>Origin:</strong> {amb.source_location}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>Destination:</strong> {amb.target_facility_name}
                </p>
              </div>

              {/* Patient Vitals Stream in Ambulance */}
              <div style={{ display: 'flex', justifyContent: 'space-around', background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>HEART RATE</span>
                  <strong style={{ fontSize: '1.1rem', color: amb.vitals_stream.heart_rate > 100 ? '#ff6b8b' : '#34d399' }}>
                    {amb.vitals_stream.heart_rate} bpm
                  </strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>SPO2</span>
                  <strong style={{ fontSize: '1.1rem', color: amb.vitals_stream.spo2 < 94 ? '#ff6b8b' : '#34d399' }}>
                    {amb.vitals_stream.spo2}%
                  </strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>BP</span>
                  <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>
                    {amb.vitals_stream.blood_pressure}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>ETA: ~{amb.eta_minutes} Minutes</span>
                <span className="badge badge-sameday">{amb.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District Facility Registry & Capability Matrix */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bed size={20} color="#14b8a6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Facility Real-Time Capability Matrix</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total Open ICU Beds: <strong style={{ color: '#10b981' }}>{totalIcuAvailable}</strong>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>FACILITY NAME</th>
                <th style={{ padding: '12px 14px' }}>TIER</th>
                <th style={{ padding: '12px 14px' }}>BED CAPACITY</th>
                <th style={{ padding: '12px 14px' }}>ICU BEDS</th>
                <th style={{ padding: '12px 14px' }}>OXYGEN (CYL)</th>
                <th style={{ padding: '12px 14px' }}>BLOOD UNITS</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map(fac => {
                const occupancyPct = Math.round(((fac.beds_total - fac.beds_available) / fac.beds_total) * 100);
                return (
                  <tr key={fac.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {fac.name}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className="badge badge-routine" style={{ fontSize: '0.65rem' }}>
                        {fac.facility_tier}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{fac.beds_available} / {fac.beds_total}</span>
                        <div style={{ width: '60px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${occupancyPct}%`, height: '100%', background: occupancyPct > 85 ? '#e11d48' : '#14b8a6' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: fac.icu_available > 0 ? '#10b981' : '#ff6b8b', fontWeight: 600 }}>
                      {fac.icu_available}
                    </td>
                    <td style={{ padding: '14px' }}>{fac.oxygen_cylinders}</td>
                    <td style={{ padding: '14px' }}>{fac.blood_units}</td>
                    <td style={{ padding: '14px' }}>
                      <span className="badge badge-routine" style={{ fontSize: '0.65rem' }}>OPERATIONAL</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
