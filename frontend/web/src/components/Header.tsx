import React, { useState } from 'react';

interface HeaderProps {
  onOpenEmergency: () => void;
  onSearchQuery?: (q: string) => void;
  onToggleMobileSidebar: () => void;
  currentHospital: string;
  onSelectHospital: (hospital: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergency,
  onSearchQuery,
  onToggleMobileSidebar,
  currentHospital,
  onSelectHospital,
}) => {
  const [hospitalDropdownOpen, setHospitalDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const hospitals = [
    { name: 'District Civil Hospital, Nashik', role: 'CARDIOLOGY & TRIAGE HUB' },
    { name: 'Sub-District Hospital, Baramati', role: 'SECONDARY CCU & TELE-CONSULT' },
    { name: 'Govt Medical College, Dhule', role: 'TERTIARY CARDIAC SURGERY BACKUP' },
    { name: 'SDH Manmad', role: 'RURAL FIRST STABILIZATION NODE' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface-container-low z-40 px-3 md:px-4 flex items-center justify-between shadow-[0_2px_10px_rgba(209,217,228,0.45)]">
      {/* Brand & Hospital Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-1.5 rounded-lg neu-flat text-on-surface hover:text-primary transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Brand identity */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="neu-flat p-1 rounded-lg flex items-center justify-center">
            <img
              alt="SwasthyaSetu Logo"
              referrerPolicy="no-referrer"
              className="h-6 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1Wu7bWL0SJLxWdqDn5exZ4xMgzIRgi7iMVvGC03J7zR2H5_FleapCVvmyHGYk9Bme-G7MZQjFtWDaxnP0y5lh-mp1fTojsqJPH_gUyX9P1X5BcWJlFkuD6vLXv_5B-Hm65DQDxB07RN_QK7U9AGekqh64mVXtpJw0IHdc0iX15xg5Ch1fSziKm90lbFRSU6O0iqc7YFJFxHMYG0GOmfffBULuY-YG4B4x0iXrQJcdv8mc9mVy63T44"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-primary', 'text-white');
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-headline-sm text-base text-on-surface font-bold tracking-tight">
                SwasthyaSetu
              </span>
              <span className="px-1 py-0.2 rounded neu-inset font-label-sm text-[10px] text-primary font-semibold">
                AI
              </span>
            </div>
            <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-wider leading-none mt-0.5">
              CLINICAL COMMAND CENTER
            </p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-outline-variant/30 hidden xl:block"></div>

        {/* Hospital Hub Dropdown */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => setHospitalDropdownOpen(!hospitalDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg neu-flat text-left hover:shadow-[2px_2px_6px_#d1d9e4,-2px_-2px_6px_#ffffff] transition-all cursor-pointer"
            type="button"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></div>
            <div>
              <span className="font-headline-sm text-xs font-semibold text-on-surface flex items-center gap-1">
                {currentHospital}
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                  {hospitalDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </span>
              <span className="font-label-sm text-[9px] text-on-surface-variant block uppercase leading-none">
                CARDIOLOGY &amp; TRIAGE HUB
              </span>
            </div>
          </button>

          {hospitalDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 neu-flat rounded-xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-1.5 border-b border-outline-variant/20 mb-1">
                <span className="font-label-sm text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">
                  Select Regional Command Hub
                </span>
              </div>
              <div className="space-y-0.5">
                {hospitals.map((h) => (
                  <button
                    key={h.name}
                    onClick={() => {
                      onSelectHospital(h.name);
                      setHospitalDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-all ${
                      currentHospital === h.name
                        ? 'neu-inset text-primary font-semibold'
                        : 'hover:neu-inset text-on-surface'
                    }`}
                  >
                    <div className="text-xs font-semibold leading-tight">{h.name}</div>
                    <div className="font-label-sm text-[9px] text-on-surface-variant uppercase mt-0.5">
                      {h.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-sm mx-3 hidden md:block">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[16px]">
            search
          </span>
          <input
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearchQuery?.(e.target.value);
            }}
            className="w-full neu-inset rounded-full py-1 pl-8 pr-7 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-transparent"
            placeholder="Search Patient UHID, Bed, Triage Protocol, or ABHA ID..."
            type="text"
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal('');
                onSearchQuery?.('');
              }}
              className="absolute right-2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center gap-2.5">
        {/* Live sync indicators */}
        <div className="hidden 2xl:flex items-center gap-2">
          <div
            title="Ayushman Bharat Digital Mission (ABDM) Real-time Synchronization"
            className="neu-inset px-2.5 py-0.5 rounded-full flex items-center gap-1.5 cursor-default"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span className="font-label-sm text-[10px] text-on-surface font-medium">ABDM LIVE SYNC</span>
          </div>
          <div
            title="Local SQLite Vault active. Capable of zero-cellular triage caching."
            className="neu-flat px-2.5 py-0.5 rounded-full flex items-center gap-1.5 cursor-default"
          >
            <span className="material-symbols-outlined text-[12px] text-secondary">shield</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant">OFFLINE ARMED</span>
          </div>
        </div>

        {/* 108 Emergency Bridge Button */}
        <button
          onClick={onOpenEmergency}
          className="neu-crimson-pill px-3 py-1 rounded-full flex items-center gap-1 text-on-tertiary transition-transform active:scale-95 shadow-sm hover:brightness-105 cursor-pointer"
          type="button"
          title="Open 108 Maharashtra Emergency Medical Services Dispatch Bridge"
        >
          <span className="material-symbols-outlined text-[15px] animate-pulse">e911_emergency</span>
          <span className="font-label-sm text-[10.5px] font-bold tracking-wide whitespace-nowrap">
            108 MEMS DIRECT BRIDGE
          </span>
        </button>

        <div className="h-6 w-[1px] bg-outline-variant/30 hidden sm:block"></div>

        {/* Profile Lockup */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-1 text-left cursor-pointer"
          >
            <div className="neu-flat p-0.5 rounded-full ring-1 ring-primary/20">
              <img
                alt="Dr. Priya Deshmukh"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WF-sehcUw6akjeHrvgu1X37OJxv0Km2XF8WP26S08-WRudXtdqdyRbgQllm_wt6yK86hJCETLrFn7OKANXJ9eZTlIoORPHtiQouLXnN6bHObo3e-UVo_e3IT6ep_HwZ0a93lR1Unq9Ug0eoa_99vxyWmWjTCaBBNWuRB95saer7mz1NTsImNYYWkfwplndOwCiczQ1y_2JP5AMv-zDb3MclXfwCF73qeJhZ_TGRpBWWWJuLsEqV5w"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="hidden lg:block leading-tight">
              <span className="font-headline-sm text-xs font-semibold text-on-surface block">
                Dr. Priya Deshmukh
              </span>
              <span className="font-label-sm text-[9px] text-primary font-medium block uppercase">
                NODAL MEDICAL OFFICER
              </span>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 neu-flat rounded-xl p-3 shadow-xl z-50 text-left">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20 mb-2">
                <div className="w-8 h-8 rounded-full neu-inset flex items-center justify-center font-bold text-xs text-primary">
                  PD
                </div>
                <div>
                  <div className="font-semibold text-xs text-on-surface">Dr. Priya Deshmukh</div>
                  <div className="font-label-sm text-[9px] text-primary">MD, Cardiology · MMC-88912</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-on-surface-variant font-label-sm">
                <div className="flex items-center justify-between py-0.5">
                  <span>Duty Shift</span>
                  <span className="font-semibold text-on-surface">08:00 - 20:00 IST</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>Sector Node</span>
                  <span className="font-semibold text-on-surface">Nashik-Central Hub</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span>Digital Key</span>
                  <span className="font-mono text-primary font-semibold">ECDSA-P256</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
