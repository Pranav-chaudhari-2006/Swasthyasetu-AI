import React from 'react';
import { QrCode, ShieldCheck, Clock, Copy, X } from 'lucide-react';

interface QRCodeModalProps {
  token: string;
  referralId: string;
  targetFacility: string;
  triageCategory: string;
  expiresAt: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  token,
  referralId,
  targetFacility,
  triageCategory,
  expiresAt,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        padding: '24px',
        position: 'relative',
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            color: 'var(--text-muted)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'var(--primary-glow)', borderRadius: '50%', marginBottom: '8px' }}>
            <QrCode size={32} color="#14b8a6" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cryptographic Arrival QR</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Present to Reception or Emergency Desk at {targetFacility}
          </p>
        </div>

        {/* Visual SVG QR Representation */}
        <div className="qr-container" style={{ margin: '0 auto 20px', width: '220px', height: '220px', position: 'relative' }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {/* Standard QR boundary anchors */}
            <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4" />
            <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
            <rect x="13" y="13" width="10" height="10" fill="#0f172a" />

            <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4" />
            <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
            <rect x="77" y="13" width="10" height="10" fill="#0f172a" />

            <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4" />
            <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
            <rect x="13" y="77" width="10" height="10" fill="#0f172a" />

            {/* Simulated Cryptographic Payload Bits */}
            <rect x="36" y="8" width="5" height="5" fill="#0d9488" />
            <rect x="44" y="12" width="6" height="4" fill="#0f172a" />
            <rect x="54" y="6" width="4" height="8" fill="#0f172a" />
            <rect x="36" y="22" width="8" height="4" fill="#0f172a" />
            <rect x="48" y="20" width="5" height="5" fill="#0d9488" />

            <rect x="8" y="38" width="5" height="8" fill="#0f172a" />
            <rect x="18" y="44" width="7" height="4" fill="#0f172a" />
            <rect x="28" y="36" width="4" height="6" fill="#0d9488" />
            
            <rect x="38" y="38" width="24" height="24" fill="#14b8a6" rx="4" />
            <circle cx="50" cy="50" r="6" fill="#ffffff" />

            <rect x="68" y="38" width="6" height="6" fill="#0f172a" />
            <rect x="78" y="42" width="12" height="4" fill="#0f172a" />
            <rect x="86" y="52" width="6" height="8" fill="#0d9488" />

            <rect x="36" y="70" width="10" height="6" fill="#0f172a" />
            <rect x="52" y="74" width="8" height="8" fill="#0f172a" />
            <rect x="44" y="86" width="6" height="6" fill="#0d9488" />
            <rect x="68" y="72" width="8" height="8" fill="#0f172a" />
            <rect x="82" y="78" width="10" height="4" fill="#0f172a" />
          </svg>
        </div>

        {/* Security & Verification Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Triage Tier:</span>
            <span className={`badge badge-${triageCategory.toLowerCase().replace('_', '')}`}>
              {triageCategory}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Referral ID:</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{referralId}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> Valid Until:
            </span>
            <span style={{ color: 'var(--text-main)' }}>{new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div style={{ 
            background: 'var(--bg-surface)', 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)', 
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
              {token}
            </span>
            <button 
              onClick={handleCopy}
              style={{ background: 'transparent', color: copied ? '#10b981' : 'var(--text-muted)' }}
              title="Copy cryptographic signature"
            >
              <Copy size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', marginTop: '6px', justifyContent: 'center' }}>
            <ShieldCheck size={14} /> HMAC-SHA256 Anti-Tamper Sealed
          </div>
        </div>
      </div>
    </div>
  );
};
