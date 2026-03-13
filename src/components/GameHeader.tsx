'use client';

interface GameHeaderProps {
  roundNumber: number;
  participantCount: number;
  isConnected: boolean;
  isReconnecting: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onLeave: () => void;
}

export default function GameHeader({
  roundNumber,
  participantCount,
  isConnected,
  isReconnecting,
  isMuted,
  onToggleMute,
  onLeave,
}: GameHeaderProps) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-casino-border bg-casino-dark px-4 sm:px-6"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-bold">
          <span className="gold-shimmer">Scrum Poker</span>
        </h1>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-4 w-px bg-casino-border" />
          <span aria-label={`Round ${roundNumber}`} className="text-sm text-casino-muted">
            Round {roundNumber}
          </span>
        </div>
      </div>

      {/* Center: participant count (desktop) */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-xs text-casino-muted">
          {participantCount} {participantCount === 1 ? 'player' : 'players'}
        </span>
      </div>

      {/* Right: sound + connection + leave */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          className="rounded-lg border border-casino-border p-1.5 text-sm text-casino-muted transition-colors hover:border-gold-600 hover:text-gold-400"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5"
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="hidden sm:inline text-xs text-casino-muted">Connected</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-casino-red flex-shrink-0" />
              <span className={`hidden sm:inline text-xs text-casino-muted ${isReconnecting ? 'animate-pulse' : ''}`}>
                {isReconnecting ? 'Reconnecting...' : 'Disconnected'}
              </span>
            </>
          )}
        </div>

        <button
          onClick={onLeave}
          aria-label="Leave the session"
          className="rounded-lg border border-casino-border px-3 py-1.5 text-xs text-casino-muted transition-colors hover:border-casino-red/50 hover:text-casino-red-light"
        >
          Leave
        </button>
      </div>
    </header>
  );
}
