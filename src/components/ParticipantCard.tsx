'use client';

import { AVATARS, type PublicParticipant } from '@/lib/types';

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
  const avatarData = AVATARS.find((a) => a.id === participant.avatar);
  const emoji = avatarData?.emoji ?? '🎰';

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
        isCurrentUser
          ? 'border-gold-600/40 bg-gold-400/5'
          : 'border-casino-border bg-casino-surface/50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-casino-dark text-xl">
          {emoji}
        </div>
        {isAdmin && (
          <span className="absolute -top-1 -right-1 text-sm" title="Admin">👑</span>
        )}
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm font-medium ${isCurrentUser ? 'text-gold-400' : 'text-white'}`}>
            {participant.name}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] text-casino-muted">(you)</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isRevealed && participant.vote ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400">
              <span className="font-display">{participant.vote}</span>
            </span>
          ) : participant.hasVoted ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 chip-in" />
              Voted
            </span>
          ) : (
            <span className="text-xs text-casino-muted">Waiting...</span>
          )}
        </div>
      </div>

      {/* Admin actions (shown on hover) */}
      {isGameAdmin && !isCurrentUser && (
        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onTransferAdmin && (
            <button
              onClick={onTransferAdmin}
              title="Make admin"
              className="rounded p-1 text-xs text-casino-muted hover:bg-casino-dark hover:text-gold-400 transition-colors"
            >
              👑
            </button>
          )}
          {onKick && (
            <button
              onClick={onKick}
              title="Remove"
              className="rounded p-1 text-xs text-casino-muted hover:bg-casino-dark hover:text-casino-red-light transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
