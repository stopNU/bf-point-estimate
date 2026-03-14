'use client';

import { useState, useEffect, useRef } from 'react';
import { AVATARS, type PublicParticipant } from '@/lib/types';
import { useTheme } from '@/hooks/useTheme';

interface ParticipantCardProps {
  participant: PublicParticipant;
  isAdmin: boolean;
  isCurrentUser: boolean;
  isGameAdmin: boolean;
  isRevealed: boolean;
  onKick?: () => void;
  onTransferAdmin?: () => void;
}

export default function ParticipantCard({
  participant,
  isAdmin,
  isCurrentUser,
  isGameAdmin,
  isRevealed,
  onKick,
  onTransferAdmin,
}: ParticipantCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isCosmos } = useTheme();

  const avatarData = AVATARS.find((a) => a.id === participant.avatar);
  const emoji = avatarData?.emoji ?? '🎰';
  const isObserver = participant.role === 'observer';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuOpen]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
      triggerRef.current?.focus();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
      if (items && items.length > 0) {
        const focused = Array.from(items).findIndex((el) => el === document.activeElement);
        (items[(focused + 1) % items.length] as HTMLElement).focus();
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
      if (items && items.length > 0) {
        const focused = Array.from(items).findIndex((el) => el === document.activeElement);
        (items[(focused - 1 + items.length) % items.length] as HTMLElement).focus();
      }
    }
  };

  if (isCosmos) {
    return (
      <div
        className={`group relative flex items-center gap-3 px-3 py-2.5 transition-all ${
          !participant.isOnline && !isCurrentUser ? 'opacity-60' : ''
        }`}
        style={{ borderBottom: '1px solid var(--color-cosmos-hull)' }}
      >
        {/* Avatar — hard square */}
        <div className="relative flex-shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center text-lg"
            style={{ background: 'var(--color-cosmos-deep)', border: '1px solid var(--color-cosmos-hull)', borderRadius: 0 }}
          >
            {emoji}
          </div>
          {isAdmin && <span className="absolute -top-1 -right-1 text-xs" title="Admin">👑</span>}
          <span
            aria-label={participant.isOnline ? 'Online' : 'Offline'}
            className={`cosmos-online-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full`}
            style={{
              background: participant.isOnline ? 'var(--color-cosmos-online)' : 'var(--color-cosmos-offline)',
              boxShadow: participant.isOnline ? '0 0 4px var(--color-cosmos-online)' : 'none',
            }}
          />
        </div>

        {/* Name + status */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="truncate text-sm"
              style={{ fontFamily: 'var(--font-cosmos-ui)', fontWeight: 700, color: isCurrentUser ? 'var(--color-cosmos-beam-400)' : 'var(--color-cosmos-text-primary)' }}
            >
              {participant.name}
            </span>
            {isCurrentUser && (
              <span className="text-[9px]" style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-dim)' }}>(you)</span>
            )}
            <span
              className="text-[9px] font-bold uppercase px-1 py-0.5"
              style={{
                fontFamily: 'var(--font-cosmos-ui)',
                border: isObserver ? '1px solid var(--color-cosmos-muted)' : '1px solid var(--color-cosmos-beam-700)',
                color: isObserver ? 'var(--color-cosmos-text-dim)' : 'var(--color-cosmos-beam-400)',
                borderRadius: 0,
              }}
            >
              {isObserver ? 'SPECTATOR' : 'OPERATIVE'}
            </span>
          </div>
          <div aria-live="polite" className="mt-0.5">
            {isObserver ? (
              <span className="text-xs" style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-dim)' }}>OBSERVING</span>
            ) : isRevealed && participant.vote ? (
              <span className="text-xs font-bold tracking-wider" style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-400)' }}>{participant.vote}</span>
            ) : participant.hasVoted ? (
              <span className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-beam-700)' }}>▣ DEPLOYED</span>
            ) : (
              <span className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-dim)' }}>STANDBY</span>
            )}
          </div>
        </div>

        {/* Admin menu */}
        {isGameAdmin && !isCurrentUser && (
          <div ref={menuRef} className="relative flex-shrink-0" onKeyDown={handleMenuKeyDown}>
            <button
              ref={triggerRef}
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Player options for ${participant.name}`}
              className="p-1.5 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              style={{ color: 'var(--color-cosmos-text-dim)' }}
            >
              ···
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 z-50 min-w-[160px] py-1"
                style={{ background: 'var(--color-cosmos-station)', border: '1px solid var(--color-cosmos-hull)', borderRadius: 0 }}
              >
                {onTransferAdmin && (
                  <button
                    role="menuitem"
                    onClick={() => { onTransferAdmin(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--color-cosmos-text-primary)', fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,191,255,0.06)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <span>👑</span> Make Admin
                  </button>
                )}
                {onKick && (
                  <button
                    role="menuitem"
                    onClick={() => { onKick(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                    style={{ color: 'var(--color-cosmos-magenta-500)', fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,191,255,0.06)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <span>✕</span> Remove
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Casino theme
  return (
    <div
      className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
        isCurrentUser ? 'border-gold-600/40 bg-gold-400/5' : 'border-casino-border bg-casino-surface/50'
      } ${!participant.isOnline && !isCurrentUser ? 'opacity-60' : ''}`}
    >
      <div className="relative flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-casino-dark text-xl">{emoji}</div>
        {isAdmin && <span className="absolute -top-1 -right-1 text-sm" title="Admin">👑</span>}
        <span
          aria-label={participant.isOnline ? 'Online' : 'Offline'}
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-casino-dark ${
            participant.isOnline ? 'bg-green-400' : 'bg-casino-muted'
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm font-medium ${isCurrentUser ? 'text-gold-400' : 'text-white'}`}>{participant.name}</span>
          {isCurrentUser && <span className="text-[10px] text-casino-muted">(you)</span>}
          {isObserver && (
            <span className="rounded-full bg-casino-dark px-1.5 py-0.5 text-[9px] text-casino-muted border border-casino-border">OBS</span>
          )}
        </div>
        <div aria-live="polite" className="flex items-center gap-1.5 mt-0.5">
          {isObserver ? (
            <span className="text-xs text-casino-muted">👁 Observing</span>
          ) : isRevealed && participant.vote ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400">
              <span className="font-display">{participant.vote}</span>
            </span>
          ) : participant.hasVoted ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 chip-in" />
              Voted
            </span>
          ) : (
            <span className="text-xs text-white/70">Waiting...</span>
          )}
        </div>
      </div>

      {isGameAdmin && !isCurrentUser && (
        <div ref={menuRef} className="relative flex-shrink-0" onKeyDown={handleMenuKeyDown}>
          <button
            ref={triggerRef}
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Player options for ${participant.name}`}
            className="rounded p-1.5 text-casino-muted transition-colors hover:text-white hover:bg-casino-dark opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          >
            ···
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-xl border border-casino-border bg-casino-surface shadow-2xl py-1">
              {onTransferAdmin && (
                <button
                  role="menuitem"
                  onClick={() => { onTransferAdmin(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-casino-dark transition-colors"
                >
                  <span>👑</span> Make Admin
                </button>
              )}
              {onKick && (
                <button
                  role="menuitem"
                  onClick={() => { onKick(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-casino-red-light hover:bg-casino-dark transition-colors"
                >
                  <span>✕</span> Remove from Session
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
