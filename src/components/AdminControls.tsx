'use client';

interface AdminControlsProps {
  isRevealed: boolean;
  hasVotes: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export default function AdminControls({
  isRevealed,
  hasVotes,
  onReveal,
  onReset,
}: AdminControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {!isRevealed ? (
        <button
          onClick={onReveal}
          disabled={!hasVotes}
          className="rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 font-display text-sm font-semibold text-casino-black transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          Reveal Cards
        </button>
      ) : (
        <button
          onClick={onReset}
          className="rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 font-display text-sm font-semibold text-casino-black transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
        >
          New Round
        </button>
      )}
    </div>
  );
}
