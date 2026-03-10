'use client';

import { useState, useEffect } from 'react';

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

  const hasVotes = votedCount > 0;
  const allVoted = votedCount === totalVoters && totalVoters > 0;

  // Reset inline confirm when revealed state changes or on cancel
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
              {allVoted
                ? 'Reveal Cards'
                : `Reveal (${votedCount}/${totalVoters} voted)`
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}
