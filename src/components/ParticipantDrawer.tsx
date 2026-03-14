'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/hooks/useTheme';

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
  const { isCosmos } = useTheme();

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
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: isCosmos ? 'rgba(3,4,10,0.85)' : 'rgba(10,10,10,0.6)' }}
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
          transition-transform duration-300
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={isCosmos ? {
          background: 'var(--color-cosmos-station)',
          borderTop: '2px solid var(--color-cosmos-beam-500)',
          borderRadius: 0,
        } : {
          borderTop: '1px solid var(--color-casino-border)',
          background: 'var(--color-casino-dark)',
          borderRadius: '16px 16px 0 0',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="h-1 w-10"
            style={{
              background: isCosmos ? 'var(--color-cosmos-hull)' : 'var(--color-casino-border)',
              borderRadius: isCosmos ? 0 : '9999px',
            }}
          />
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
