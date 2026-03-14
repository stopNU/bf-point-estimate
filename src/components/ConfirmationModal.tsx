'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ConfirmationModalConfig } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';

interface ConfirmationModalProps {
  isOpen: boolean;
  config: ConfirmationModalConfig | null;
  onClose: () => void;
}

export default function ConfirmationModal({ isOpen, config, onClose }: ConfirmationModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const closeXRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const { isCosmos } = useTheme();

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => cancelRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab') {
      const focusable = [cancelRef.current, confirmRef.current, closeXRef.current].filter(Boolean) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, [onClose]);

  if (!isOpen && !config) return null;

  const handleConfirm = async () => {
    await config?.onConfirm();
    onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 modal-backdrop-in ${isCosmos ? '' : 'bg-casino-black/80'}`}
        style={isCosmos ? { background: 'rgba(3,4,10,0.92)', backdropFilter: 'blur(2px)' } : {}}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-body"
        className={`relative z-10 w-full mx-0 sm:mx-4 modal-card-in ${
          isCosmos
            ? 'sm:max-w-md'
            : 'sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-casino-border bg-casino-surface shadow-2xl'
        }`}
        style={isCosmos ? {
          background: 'var(--color-cosmos-deep)',
          border: '1px solid var(--color-cosmos-hull)',
          borderTop: '3px solid var(--color-cosmos-magenta-500)',
          borderRadius: 0,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        } : {}}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            {config?.icon && (
              <span className="text-2xl" aria-hidden="true">{config.icon}</span>
            )}
            <h2
              id="modal-title"
              className={isCosmos ? 'text-2xl uppercase tracking-wide' : 'font-display text-lg font-semibold text-white'}
              style={isCosmos ? { fontFamily: 'var(--font-cosmos-display)', color: 'var(--color-cosmos-text-primary)' } : {}}
            >
              {config?.title}
            </h2>
          </div>
          <button
            ref={closeXRef}
            onClick={onClose}
            aria-label="Close dialog"
            className={isCosmos ? 'p-1.5 transition-colors' : 'rounded-lg p-1.5 text-casino-muted hover:text-white transition-colors'}
            style={isCosmos ? { color: 'var(--color-cosmos-text-dim)' } : {}}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          id="modal-body"
          className="px-5 pb-5 text-sm"
          style={isCosmos ? { fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600, color: 'var(--color-cosmos-text-secondary)' } : { color: 'var(--color-casino-muted)' }}
        >
          {config?.body}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-6 pt-2">
          <button
            ref={cancelRef}
            onClick={onClose}
            className={isCosmos ? 'flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors' : 'flex-1 rounded-lg border border-casino-border px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-casino-dark'}
            style={isCosmos ? {
              fontFamily: 'var(--font-cosmos-ui)',
              border: '1px solid var(--color-cosmos-hull)',
              color: 'var(--color-cosmos-text-secondary)',
              borderRadius: 0,
            } : {}}
            onMouseEnter={isCosmos ? (e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-cosmos-beam-500)'; } : undefined}
            onMouseLeave={isCosmos ? (e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-cosmos-hull)'; } : undefined}
          >
            {isCosmos ? 'ABORT' : 'Cancel'}
          </button>
          <button
            ref={confirmRef}
            onClick={handleConfirm}
            className={isCosmos
              ? 'flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-all'
              : `flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  config?.confirmVariant === 'gold'
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-casino-black hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_16px_rgba(250,204,21,0.3)]'
                    : 'bg-casino-red text-white hover:bg-casino-red-light'
                }`
            }
            style={isCosmos ? {
              fontFamily: 'var(--font-cosmos-ui)',
              background: config?.confirmVariant === 'gold'
                ? 'var(--color-cosmos-beam-500)'
                : 'var(--color-cosmos-magenta-600)',
              color: 'white',
              borderRadius: 0,
            } : {}}
            onMouseEnter={isCosmos ? (e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = config?.confirmVariant === 'gold'
                ? '0 0 20px rgba(0,191,255,0.4)'
                : '0 0 20px var(--color-cosmos-magenta-glow)';
            } : undefined}
            onMouseLeave={isCosmos ? (e) => { (e.currentTarget as HTMLElement).style.boxShadow = ''; } : undefined}
          >
            {isCosmos ? (config?.confirmLabel ?? '').toUpperCase() : config?.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
