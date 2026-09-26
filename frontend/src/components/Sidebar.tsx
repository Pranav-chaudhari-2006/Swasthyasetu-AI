import React from 'react';
import { ClinicalModule } from '../types/clinical';

interface SidebarProps {
  activeModule: ClinicalModule;
  onSelectModule: (module: ClinicalModule) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: ClinicalModule; label: string; icon: string }[] = [
    {
      id: 'triage-and-intake',
      label: 'Triage & Intake',
      icon: 'emergency',
    },
    {
      id: 'vitals-and-telemetry',
      label: 'Vitals & Telemetry',
      icon: 'vital_signs',
    },
    {
      id: 'referrals-and-facilities',
      label: 'Referrals & Facilities',
      icon: 'transfer_within_a_station',
    },
    {
      id: 'care-plans-and-tasks',
      label: 'Care Plans & Tasks',
      icon: 'assignment',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-52 bg-surface-container-low z-30 pt-14 pb-3 flex flex-col justify-between shadow-[2px_0_10px_rgba(209,217,228,0.4)] transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-2.5 pt-3">
          <div className="px-2 pb-1.5 mb-1.5 flex items-center justify-between">
            <span className="font-label-sm text-[9.5px] text-on-surface-variant uppercase tracking-wider font-semibold">
              CLINICAL MODULES
            </span>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                    isActive
                      ? 'neu-inset text-primary font-semibold'
                      : 'neu-flat text-on-surface-variant hover:text-on-surface'
                  }`}
                  data-path={item.id}
                  type="button"
                >
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      isActive ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Health Card */}
        <div className="px-2.5">
          <div className="neu-concave-deep p-2.5 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-sm text-[9px] text-on-surface-variant uppercase">
                SYSTEM HEALTH
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <span className="font-label-lg text-xs text-primary font-bold tracking-tight">
                GRID 99.98%
              </span>
              <span className="font-label-sm text-[9px] text-on-surface-variant">ACTIVE</span>
            </div>

            <div className="w-full bg-surface-container rounded-full h-1 neu-inset overflow-hidden mb-1.5">
              <div className="bg-primary h-1 rounded-full w-[99.98%]"></div>
            </div>

            <div className="pt-1 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant text-[9.5px]">
              <span className="font-label-sm">Dialect Engine</span>
              <span className="font-label-sm font-semibold text-on-surface">
                v4.2 · MH-West
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
