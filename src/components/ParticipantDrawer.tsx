'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ParticipantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  votedCount: number;
  totalVoters: number;
}

export default function ParticipantDrawer({
  isOpen,
  onClose,
  children,
  votedCount,
  totalVoters,
}: ParticipantDrawerProps) {
  // Body scroll lock while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const drawer = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-casino-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Participant list"
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          rounded-t-2xl border-t border-casino-border bg-casino-dark
          transition-transform duration-300
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-casino-border" />
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-6 pb-safe-bottom">
          {children}
        </div>
      </div>
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawer, document.body);
}
