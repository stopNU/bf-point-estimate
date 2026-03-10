'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ConfirmationModalConfig } from '@/lib/types';

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

  // Store the trigger element before opening
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      // Body scroll lock
      document.body.style.overflow = 'hidden';
      // Focus cancel button
      setTimeout(() => cancelRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      // Return focus to trigger
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = [cancelRef.current, confirmRef.current, closeXRef.current].filter(Boolean) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
        className="absolute inset-0 bg-casino-black/80 modal-backdrop-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card — bottom sheet on mobile, centered on sm+ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-body"
        className="relative z-10 w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl border border-casino-border bg-casino-surface shadow-2xl modal-card-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            {config?.icon && (
              <span className="text-2xl" aria-hidden="true">{config.icon}</span>
            )}
            <h2 id="modal-title" className="font-display text-lg font-semibold text-white">
              {config?.title}
            </h2>
          </div>
          <button
            ref={closeXRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-casino-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div id="modal-body" className="px-5 pb-5 text-sm text-casino-muted">
          {config?.body}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-6 pt-2">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="flex-1 rounded-lg border border-casino-border px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-casino-dark"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={handleConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              config?.confirmVariant === 'gold'
                ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-casino-black hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_16px_rgba(250,204,21,0.3)]'
                : 'bg-casino-red text-white hover:bg-casino-red-light'
            }`}
          >
            {config?.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
