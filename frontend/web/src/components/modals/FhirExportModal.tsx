import React, { useState } from 'react';

interface FhirExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'warning' | 'emergency' | 'info') => void;
}

export const FhirExportModal: React.FC<FhirExportModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fhirBundle = {
    resourceType: 'Bundle',
    id: 'bundle-swasthyasetu-2026-0926',
    meta: {
      lastUpdated: '2026-09-26T14:14:00+05:30',
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifactBundle'],
    },
    identifier: {
      system: 'https://healthid.ndhm.gov.in',
      value: '91-4201-9982-1029',
    },
    type: 'document',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'pat-sunita-devi',
          identifier: [{ system: 'https://healthid.ndhm.gov.in', value: '91-4201-9982-1029' }],
          name: [{ text: 'Sunita Devi' }],
          gender: 'female',
          birthDate: '1984',
          address: [{ state: 'Maharashtra', district: 'Nashik', city: 'Niphad' }],
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-vitals-lead-ii',
          status: 'final',
          code: {
            coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
          },
          valueQuantity: { value: 106, unit: 'beats/minute', system: 'http://unitsofmeasure.org' },
          interpretation: [{ text: 'Tachycardia with exertion' }],
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-spo2',
          status: 'final',
          code: {
            coding: [{ system: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation' }],
          },
          valueQuantity: { value: 94, unit: '%', system: 'http://unitsofmeasure.org' },
        },
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'cond-acute-coronary',
          clinicalStatus: { coding: [{ code: 'active' }] },
          verificationStatus: { coding: [{ code: 'provisional' }] },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '399211009',
                display: 'Acute Coronary Syndrome (Suspected)',
              },
            ],
          },
        },
      },
    ],
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopied(true);
    onShowToast('FHIR Bundle Copied', 'ABDM R4 Document Bundle JSON copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="neu-flat rounded-3xl p-space-lg max-w-2xl w-full space-y-space-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">data_object</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                ABDM FHIR Bundle v4.0.1
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                HL7 FHIR R4 COMPLIANT • AYUSHMAN BHARAT GATEWAY
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

        {/* Code display */}
        <div className="neu-concave-deep p-space-md rounded-2xl overflow-auto flex-1 font-mono text-xs bg-slate-950 text-emerald-400 max-h-[50vh]">
          <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between shrink-0 pt-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Hash: 7f4a-92b1-cc04-e39a
          </span>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={handleCopy}
              className="neu-flat px-space-md py-2 rounded-xl font-headline-sm text-body-sm font-semibold text-primary active:neu-inset transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
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
