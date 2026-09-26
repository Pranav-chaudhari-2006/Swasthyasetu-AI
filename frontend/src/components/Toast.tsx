import React from 'react';
import { ToastMessage } from '../types/clinical';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isEmergency = toast.type === 'emergency';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto neu-flat rounded-2xl p-space-md shadow-2xl flex items-start gap-space-sm border-l-4 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isEmergency
                ? 'border-l-tertiary bg-error-container/20'
                : isSuccess
                ? 'border-l-primary'
                : isWarning
                ? 'border-l-secondary'
                : 'border-l-outline'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg neu-inset flex items-center justify-center shrink-0 mt-0.5 ${
                isEmergency
                  ? 'text-tertiary'
                  : isSuccess
                  ? 'text-primary'
                  : isWarning
                  ? 'text-secondary'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isEmergency
                  ? 'e911_emergency'
                  : isSuccess
                  ? 'check_circle'
                  : isWarning
                  ? 'warning'
                  : 'info'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-headline-sm text-body-sm font-bold text-on-surface block leading-tight">
                {toast.title}
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
