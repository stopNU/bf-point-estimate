'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface AdminControlBarProps {
  isRevealed: boolean;
  totalVoters: number;
  votedCount: number;
  onReveal: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export default function AdminControlBar({
  isRevealed,
  totalVoters,
  votedCount,
  onReveal,
  onReset,
  isLoading,
}: AdminControlBarProps) {
  const [showInlineConfirm, setShowInlineConfirm] = useState(false);
  const { isCosmos } = useTheme();

  const hasVotes = votedCount > 0;
  const allVoted = votedCount === totalVoters && totalVoters > 0;

  useEffect(() => {
    setShowInlineConfirm(false);
  }, [isRevealed]);

  const handleRevealClick = () => {
    if (allVoted) {
      onReveal();
    } else if (hasVotes) {
      if (showInlineConfirm) {
        onReveal();
        setShowInlineConfirm(false);
      } else {
        setShowInlineConfirm(true);
      }
    }
  };

  if (isCosmos) {
    return (
      <div
        role="region"
        aria-label="Session controls (admin)"
        className="flex items-center justify-center gap-3 px-4 py-0"
        style={{
          background: 'var(--color-cosmos-void)',
          borderTop: '2px solid var(--color-cosmos-beam-500)',
          boxShadow: '0 -4px 30px rgba(0,191,255,0.15)',
          minHeight: '72px',
        }}
      >
        {isLoading ? (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'var(--color-cosmos-text-secondary)' }}
          >
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2"
              style={{ borderColor: 'var(--color-cosmos-hull)', borderTopColor: 'var(--color-cosmos-beam-400)' }}
            />
            PROCESSING...
          </div>
        ) : isRevealed ? (
          <button
            onClick={onReset}
            aria-label="Start a new round — this will clear all current votes"
            className="flex items-center gap-2 px-8 py-3 text-xl uppercase tracking-wide transition-all"
            style={{
              fontFamily: 'var(--font-cosmos-display)',
              background: 'transparent',
              border: '2px solid var(--color-cosmos-violet-500)',
              color: 'var(--color-cosmos-violet-400)',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = 'var(--color-cosmos-violet-600)';
              el.style.color = 'white';
              el.style.boxShadow = '0 0 20px var(--color-cosmos-violet-glow)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = 'transparent';
              el.style.color = 'var(--color-cosmos-violet-400)';
              el.style.boxShadow = '';
            }}
          >
            INITIALIZE NEW ROUND
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {showInlineConfirm ? (
              <div role="alert" className="flex items-center gap-3">
                <span
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-cosmos-ui)', fontWeight: 600, color: 'var(--color-cosmos-warning)' }}
                >
                  {totalVoters - votedCount} operative{totalVoters - votedCount !== 1 ? 's' : ''} not deployed. Execute anyway?
                </span>
                <button
                  onClick={() => { onReveal(); setShowInlineConfirm(false); }}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-cosmos-ui)',
                    background: 'var(--color-cosmos-beam-500)',
                    color: 'var(--color-cosmos-text-inverse)',
                    borderRadius: 0,
                  }}
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => setShowInlineConfirm(false)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-cosmos-ui)',
                    border: '1px solid var(--color-cosmos-hull)',
                    color: 'var(--color-cosmos-text-secondary)',
                    borderRadius: 0,
                  }}
                >
                  ABORT
                </button>
              </div>
            ) : !hasVotes ? (
              <button
                aria-disabled="true"
                aria-description="No votes cast yet"
                aria-label="Reveal all votes"
                className="px-8 py-3 text-xl uppercase tracking-wide cursor-not-allowed opacity-40"
                style={{
                  fontFamily: 'var(--font-cosmos-display)',
                  background: 'var(--color-cosmos-beam-500)',
                  color: 'var(--color-cosmos-text-inverse)',
                  borderRadius: 0,
                }}
              >
                EXECUTE REVEAL
              </button>
            ) : (
              <button
                onClick={handleRevealClick}
                aria-label="Reveal all votes"
                className={`flex items-center gap-3 px-8 py-3 text-xl uppercase tracking-wide transition-all ${
                  !allVoted ? 'cosmos-reveal-btn-waiting' : ''
                }`}
                style={{
                  fontFamily: 'var(--font-cosmos-display)',
                  background: 'var(--color-cosmos-beam-500)',
                  color: 'var(--color-cosmos-text-inverse)',
                  borderRadius: 0,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'var(--color-cosmos-beam-400)';
                  el.style.boxShadow = '0 0 30px rgba(0,191,255,0.4)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'var(--color-cosmos-beam-500)';
                  el.style.boxShadow = '';
                }}
              >
                EXECUTE REVEAL
                <span
                  className="text-sm"
                  style={{ fontFamily: 'var(--font-cosmos-mono)', color: 'rgba(3,4,10,0.7)', letterSpacing: '0.05em' }}
                >
                  [ {String(votedCount).padStart(2, '0')} / {String(totalVoters).padStart(2, '0')} DEPLOYED ]
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Casino theme
  return (
    <div
      role="region"
      aria-label="Session controls (admin)"
      className="flex items-center justify-center gap-3 border-t border-casino-border bg-casino-dark px-4 py-3"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-casino-muted">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-casino-border border-t-gold-400" />
          Processing...
        </div>
      ) : isRevealed ? (
        <button
          onClick={onReset}
          aria-label="Start a new round — this will clear all current votes"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 font-display text-sm font-semibold text-casino-black transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
        >
          <span>🔄</span>
          New Round
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {showInlineConfirm ? (
            <div role="alert" className="flex items-center gap-3">
              <span className="text-sm text-amber-400">
                {totalVoters - votedCount} player{totalVoters - votedCount !== 1 ? 's' : ''} haven&apos;t voted. Reveal anyway?
              </span>
              <button
                onClick={() => { onReveal(); setShowInlineConfirm(false); }}
                className="rounded-lg bg-gold-600 px-3 py-1.5 text-xs font-semibold text-casino-black hover:bg-gold-500 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowInlineConfirm(false)}
                className="rounded-lg border border-casino-border px-3 py-1.5 text-xs font-medium text-white hover:bg-casino-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : !hasVotes ? (
            <button
              aria-disabled="true"
              aria-description="No votes cast yet"
              aria-label="Reveal all votes"
              className="rounded-lg bg-gradient-to-r from-gold-600/30 to-gold-500/30 px-6 py-2.5 font-display text-sm font-semibold text-casino-black/50 cursor-not-allowed"
            >
              Reveal Cards
            </button>
          ) : (
            <button
              onClick={handleRevealClick}
              aria-label="Reveal all votes"
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-display text-sm font-semibold transition-all ${
                allVoted
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-casino-black hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
              }`}
            >
              {!allVoted && <span>⚠️</span>}
              {allVoted ? 'Reveal Cards' : `Reveal (${votedCount}/${totalVoters} voted)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
