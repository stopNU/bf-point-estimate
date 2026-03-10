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

  const players = gameState.participants.filter((p) => p.role === 'player');
  const observers = gameState.participants.filter((p) => p.role === 'observer');

  return (
    <aside aria-label="Session participants" className="flex h-full flex-col">
      {/* Players section */}
      <section aria-label="Players">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-gold-400">Players</h2>
          <span className="rounded-full bg-casino-dark px-2 py-0.5 text-xs text-casino-muted">
            {players.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {players.map((p) => (
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
          {players.length === 0 && (
            <p className="text-center text-sm text-casino-muted py-4">No players yet...</p>
          )}
        </div>
      </section>

      {/* Observers section — only render if any observers present */}
      {observers.length > 0 && (
        <section aria-label="Observers" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-casino-muted">Observers</h2>
            <span className="rounded-full bg-casino-dark px-2 py-0.5 text-xs text-casino-muted">
              {observers.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {observers.map((p) => (
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
        </section>
      )}
    </aside>
  );
}
