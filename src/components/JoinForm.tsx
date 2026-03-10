'use client';

import { useState } from 'react';
import AvatarPicker from './AvatarPicker';
import type { ParticipantRole } from '@/lib/types';

interface JoinFormProps {
  onJoin: (name: string, avatar: string, role: ParticipantRole) => Promise<void>;
}

export default function JoinForm({ onJoin }: JoinFormProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('dealer');
  const [role, setRole] = useState<ParticipantRole>('player');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter your name to take a seat');
      return;
    }
    setIsJoining(true);
    setError('');
    try {
      await onJoin(name.trim(), avatar, role);
    } catch (err) {
      setError((err as Error).message);
      setIsJoining(false);
    }
  };

  const remaining = 20 - name.length;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="gold-shimmer">Scrum Poker</span>
          </h1>
          <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-gold-600 to-transparent" />
          <p className="mt-4 text-sm text-casino-muted">Take a seat at the table</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-casino-border bg-casino-surface p-6 shadow-2xl sm:p-8">
            {/* Name input */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="name" className="text-sm font-medium text-gold-400">
                  Your Name
                </label>
                <span
                  aria-live="polite"
                  className={`text-xs tabular-nums ${
                    remaining <= 5 ? 'text-casino-red-light' : 'text-casino-muted'
                  }`}
                >
                  {remaining}
                </span>
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                autoComplete="nickname"
                className="w-full rounded-lg border border-casino-border bg-casino-dark px-4 py-3 text-white placeholder-casino-muted outline-none transition-colors focus:border-gold-600 focus:ring-1 focus:ring-gold-600/50"
              />
            </div>

            {/* Avatar picker */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gold-400">
                Choose Your Avatar
              </label>
              <AvatarPicker selected={avatar} onSelect={setAvatar} />
            </div>

            {/* Role toggle */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gold-400">
                Join as
              </label>
              <div role="radiogroup" aria-label="Participation role" className="flex gap-3">
                {(['player', 'observer'] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                      role === r
                        ? 'border-gold-600/60 bg-gold-400/5 text-gold-400'
                        : 'border-casino-border bg-casino-dark text-casino-muted hover:border-gold-900/40 hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="sr-only"
                    />
                    <span aria-hidden="true">{r === 'player' ? '🃏' : '👁'}</span>
                    <span className="capitalize">{r}</span>
                  </label>
                ))}
              </div>

              {role === 'observer' && (
                <div
                  role="note"
                  aria-live="polite"
                  className="mt-3 rounded-lg border border-casino-border bg-casino-dark px-4 py-3 text-sm text-casino-muted animate-[fadeSlideDown_200ms_ease-out] overflow-hidden"
                >
                  <span className="text-white font-medium">Observer mode:</span> You can watch
                  the session in real time but won&apos;t vote or affect results.
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="mb-4 text-center text-sm text-casino-red-light">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isJoining}
              className="w-full rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3 font-display text-lg font-semibold text-casino-black transition-all hover:from-gold-500 hover:to-gold-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining
                ? 'Joining...'
                : role === 'observer'
                  ? 'Watch the Table'
                  : 'Take a Seat'}
            </button>
          </div>
        </form>

        {/* Decorative */}
        <div className="mt-6 flex items-center justify-center gap-2 text-casino-muted">
          <span className="text-lg">♠</span>
          <span className="text-lg">♥</span>
          <span className="text-lg">♦</span>
          <span className="text-lg">♣</span>
        </div>
      </div>
    </div>
  );
}
