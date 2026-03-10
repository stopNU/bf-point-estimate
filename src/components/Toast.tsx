'use client';

import { useEffect, useState } from 'react';
import type { Toast as ToastType } from '@/lib/types';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const dismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  useEffect(() => {
    if (!toast.persistent && toast.dismissAfter) {
      const timer = setTimeout(() => dismiss(), toast.dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.persistent, toast.dismissAfter]);

  const iconMap: Record<ToastType['type'], string> = {
    disconnected: '🔴',
    reconnected: '🟢',
    error: '⚠️',
    info: 'ℹ️',
    'session-expired': '⏰',
    kicked: '🚫',
  };

  const borderMap: Record<ToastType['type'], string> = {
    disconnected: 'border-casino-red/40',
    reconnected: 'border-green-500/40',
    error: 'border-amber-500/40',
    info: 'border-gold-600/40',
    'session-expired': 'border-amber-500/40',
    kicked: 'border-casino-red/40',
  };

  const progressColorMap: Record<ToastType['type'], string> = {
    disconnected: 'bg-casino-red',
    reconnected: 'bg-green-500',
    error: 'bg-amber-500',
    info: 'bg-gold-500',
    'session-expired': 'bg-amber-500',
    kicked: 'bg-casino-red',
  };

  return (
    <div
      role="status"
      className={`
        relative overflow-hidden rounded-xl border bg-casino-surface shadow-2xl
        w-full sm:w-80
        ${borderMap[toast.type]}
        ${isExiting
          ? 'animate-[slideOutRight_200ms_ease-in_forwards]'
          : 'animate-[slideInRight_250ms_ease-out]'
        }
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 text-base flex-shrink-0" aria-hidden="true">
          {iconMap[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">{toast.title}</div>
          {toast.body && (
            <div className="mt-0.5 text-xs text-casino-muted">{toast.body}</div>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              aria-label={toast.type === 'session-expired' ? 'Rejoin the session' : toast.action.label}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="flex-shrink-0 rounded p-1 text-casino-muted hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      {!toast.persistent && toast.dismissAfter && (
        <div
          aria-hidden="true"
          className={`h-0.5 ${progressColorMap[toast.type]}`}
          style={{
            animation: `shrinkWidth ${toast.dismissAfter}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}
