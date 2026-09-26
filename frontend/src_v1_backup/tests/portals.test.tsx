import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { QRCodeModal } from '../components/QRCodeModal';
import { api } from '../services/api';

describe('MS-12: Unified Frontend Applications Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. App Shell: renders top navigation and default Patient PWA portal', () => {
    render(<App />);

    // Brand and platform title
    expect(screen.getByText('SwasthyaSetu AI')).toBeDefined();
    expect(screen.getByText('NATIONAL CLINICAL CONTINUITY PLATFORM')).toBeDefined();

    // Role switcher buttons
    expect(screen.getByText('Patient PWA')).toBeDefined();
    expect(screen.getByText('Frontline ASHA')).toBeDefined();
    expect(screen.getByText('Doctor & Facility')).toBeDefined();
    expect(screen.getByText('DHO Command')).toBeDefined();

    // Default patient profile
    expect(screen.getByText('Ramesh Kulkarni')).toBeDefined();
    expect(screen.getByText('AI Symptom Intake Assistant')).toBeDefined();
  });

  it('2. Patient PWA: allows opening cryptographic arrival QR modal', () => {
    render(<App />);

    const qrBtns = screen.getAllByText(/View Arrival QR|Open Hospital Check-in QR/);
    expect(qrBtns.length).toBeGreaterThan(0);
    fireEvent.click(qrBtns[0]);

    // QR Modal should be open
    expect(screen.getByText('Cryptographic Arrival QR')).toBeDefined();
    expect(screen.getByText(/HMAC-SHA256 Anti-Tamper Sealed/)).toBeDefined();
  });

  it('3. Frontline ASHA Portal: renders assisted intake, offline rules, and follow-up queue', () => {
    render(<App />);

    // Switch to Frontline ASHA role
    fireEvent.click(screen.getByText('Frontline ASHA'));

    expect(screen.getByText('Sunita Pawar (ASHA)')).toBeDefined();
    expect(screen.getByText('v1.2.0-deterministic-pilot')).toBeDefined();
    expect(screen.getByText('Frontline Assisted Intake')).toBeDefined();
    expect(screen.getByText('Assigned Follow-Up Queue')).toBeDefined();
    expect(screen.getByText('Batch Sync')).toBeDefined();
  });

  it('4. Doctor & Facility Portal: renders inbound triage inbox, e-prescriptions, and discharge actions', async () => {
    render(<App />);

    // Switch to Doctor role
    fireEvent.click(screen.getByText('Doctor & Facility'));

    expect(screen.getByText('Dr. Rajesh Mehta, MD')).toBeDefined();
    expect(screen.getByText('Inbound Triage Inbox')).toBeDefined();
    expect(await screen.findByText('E-Prescription & Pharmacy Dispense')).toBeDefined();
    expect(screen.getByText('Sign & Lock Assessment')).toBeDefined();
    expect(screen.getByText('Generate Discharge Summary')).toBeDefined();
  });

  it('5. DHO Command Dashboard: renders facility capability matrix and 108 ambulance telemetry', () => {
    render(<App />);

    // Switch to DHO role
    fireEvent.click(screen.getByText('DHO Command'));

    expect(screen.getByText('Pune District Health Command Center')).toBeDefined();
    expect(screen.getByText('Referral Conversion Rate')).toBeDefined();
    expect(screen.getByText('Emergency 108 Avg ETA')).toBeDefined();
    expect(screen.getByText('Live 108 Emergency Telemetry Stream')).toBeDefined();
    expect(screen.getByText('Facility Real-Time Capability Matrix')).toBeDefined();
  });

  it('6. Offline Queue & Cryptographic Reconcile: manages mutations correctly', () => {
    api.clearOfflineQueue();
    expect(api.getOfflineMutations().length).toBe(0);

    api.queueOfflineMutation({
      entity_type: 'INTAKE',
      action: 'CREATE',
      payload: { patient: 'Test Patient', vitals: { spo2: 98 } },
      client_timestamp: new Date().toISOString(),
    });

    expect(api.getOfflineMutations().length).toBe(1);
    expect(api.getOfflineMutations()[0].status).toBe('QUEUED');

    api.clearOfflineQueue();
    expect(api.getOfflineMutations().length).toBe(0);
  });
});
