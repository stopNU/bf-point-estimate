'use client';

import { useEffect, useState } from 'react';
import type { Toast as ToastType } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { isCosmos } = useTheme();

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

  if (isCosmos) {
    const cosmosAccentColor: Record<ToastType['type'], string> = {
      disconnected: 'var(--color-cosmos-magenta-500)',
      reconnected: 'var(--color-cosmos-online)',
      error: 'var(--color-cosmos-magenta-500)',
      info: 'var(--color-cosmos-beam-500)',
      'session-expired': 'var(--color-cosmos-warning)',
      kicked: 'var(--color-cosmos-magenta-500)',
    };
    const accent = cosmosAccentColor[toast.type];

    return (
      <div
        role="status"
        className={`
          relative overflow-hidden w-full sm:w-80
          ${isExiting
            ? 'animate-[slideOutRight_200ms_ease-in_forwards]'
            : 'animate-[slideInRight_250ms_ease-out]'
          }
        `}
        style={{
          background: 'var(--color-cosmos-station)',
          border: '1px solid var(--color-cosmos-hull)',
          borderLeft: `3px solid ${accent}`,
          borderRadius: 0,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <span className="mt-0.5 text-base flex-shrink-0" aria-hidden="true">{iconMap[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-cosmos-ui)', fontWeight: 700, color: 'var(--color-cosmos-text-primary)' }}
            >
              {toast.title}
            </div>
            {toast.body && (
              <div
                className="mt-0.5 text-xs"
                style={{ fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600, color: 'var(--color-cosmos-text-secondary)' }}
              >
                {toast.body}
              </div>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-xs font-bold uppercase tracking-wider transition-colors"
                style={{ fontFamily: 'var(--font-cosmos-ui)', color: 'var(--color-cosmos-beam-400)' }}
                aria-label={toast.type === 'session-expired' ? 'Rejoin the session' : toast.action.label}
              >
                {toast.action.label} →
              </button>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="flex-shrink-0 p-1 transition-colors"
            style={{ color: 'var(--color-cosmos-text-dim)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-cosmos-text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-cosmos-text-dim)'; }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        {!toast.persistent && toast.dismissAfter && (
          <div
            aria-hidden="true"
            className="h-0.5"
            style={{
              background: accent,
              opacity: 0.4,
              animation: `shrinkWidth ${toast.dismissAfter}ms linear forwards`,
            }}
          />
        )}
      </div>
    );
  }

  // Casino theme
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
        <span className="mt-0.5 text-base flex-shrink-0" aria-hidden="true">{iconMap[toast.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">{toast.title}</div>
          {toast.body && <div className="mt-0.5 text-xs text-casino-muted">{toast.body}</div>}
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

      {!toast.persistent && toast.dismissAfter && (
        <div
          aria-hidden="true"
          className={`h-0.5 ${progressColorMap[toast.type]}`}
          style={{ animation: `shrinkWidth ${toast.dismissAfter}ms linear forwards` }}
        />
      )}
    </div>
  );
}
