'use client';

import type { PublicGameState } from '@/lib/types';
import ParticipantCard from './ParticipantCard';

interface ParticipantListProps {
  gameState: PublicGameState;
  currentUserId: string | null;
  onKick: (targetId: string) => void;
  onTransferAdmin: (targetId: string) => void;
}

export default function ParticipantList({
  gameState,
  currentUserId,
  onKick,
  onTransferAdmin,
}: ParticipantListProps) {
  const isGameAdmin = currentUserId === gameState.adminId;
  const votedCount = gameState.participants.filter((p) => p.hasVoted).length;
  const totalCount = gameState.participants.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-gold-400">
          Players
        </h2>
        <span className="rounded-full bg-casino-dark px-2.5 py-0.5 text-xs text-casino-muted">
          {votedCount}/{totalCount} voted
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        {gameState.participants.map((p) => (
          <ParticipantCard
            key={p.id}
            participant={p}
            isAdmin={p.id === gameState.adminId}
            isCurrentUser={p.id === currentUserId}
            isGameAdmin={isGameAdmin}
            isRevealed={gameState.isRevealed}
            onKick={() => onKick(p.id)}
            onTransferAdmin={() => onTransferAdmin(p.id)}
          />
        ))}
      </div>

      {totalCount === 0 && (
        <p className="text-center text-sm text-casino-muted mt-8">
          No players yet...
        </p>
      )}
    </div>
  );
}
