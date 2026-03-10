'use client';

import { createContext, useState, useCallback } from 'react';
import type { Toast as ToastType } from '@/lib/types';
import ToastItem from './Toast';

interface ToastContextValue {
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastType, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => {
      const next = [...prev, { ...toast, id }];
      // Max 3 toasts; if 4th arrives, remove oldest non-persistent toast first
      if (next.length > 3) {
        const oldestNonPersistentIdx = next.findIndex((t) => !t.persistent);
        if (oldestNonPersistentIdx !== -1) {
          next.splice(oldestNonPersistentIdx, 1);
        } else {
          next.splice(0, 1);
        }
      }
      return next;
    });
  }, []);

  const politeToasts = toasts.filter(
    (t) => t.type !== 'session-expired' && t.type !== 'kicked'
  );
  const assertiveToasts = toasts.filter(
    (t) => t.type === 'session-expired' || t.type === 'kicked'
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Polite notifications */}
      <div
        aria-label="Notifications"
        aria-live="polite"
        role="region"
        className="fixed right-4 top-4 z-50 flex flex-col gap-2 sm:items-end items-stretch w-[calc(100%-2rem)] sm:w-auto"
      >
        {politeToasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Assertive notifications (kicked, session-expired) */}
      <div
        aria-label="Critical notifications"
        aria-live="assertive"
        role="region"
        className="fixed right-4 top-4 z-50 flex flex-col gap-2 sm:items-end items-stretch w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
        style={{ top: politeToasts.length > 0 ? `${politeToasts.length * 80 + 16}px` : '1rem' }}
      >
        {assertiveToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
