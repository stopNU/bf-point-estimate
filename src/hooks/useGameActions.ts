'use client';

import { useCallback } from 'react';
import type { CardValue } from '@/lib/types';

function getParticipantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('participantId');
}

async function postAction(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Request failed');
  }
  return res.json();
}

export function useGameActions() {
  const join = useCallback(async (name: string, avatar: string) => {
    const data = await postAction('/api/game/join', { name, avatar });
    localStorage.setItem('participantId', data.participantId);
    return data.participantId as string;
  }, []);

  const vote = useCallback(async (value: CardValue | null) => {
    const participantId = getParticipantId();
    if (!participantId) throw new Error('Not joined');
    await postAction('/api/game/vote', { participantId, value });
  }, []);

  const reveal = useCallback(async () => {
    const participantId = getParticipantId();
    if (!participantId) throw new Error('Not joined');
    await postAction('/api/game/reveal', { participantId });
  }, []);

  const reset = useCallback(async () => {
    const participantId = getParticipantId();
    if (!participantId) throw new Error('Not joined');
    await postAction('/api/game/reset', { participantId });
  }, []);

  const transferAdmin = useCallback(async (targetId: string) => {
    const participantId = getParticipantId();
    if (!participantId) throw new Error('Not joined');
    await postAction('/api/game/transfer-admin', { participantId, targetId });
  }, []);

  const kick = useCallback(async (targetId: string) => {
    const participantId = getParticipantId();
    if (!participantId) throw new Error('Not joined');
    await postAction('/api/game/kick', { participantId, targetId });
  }, []);

  const leave = useCallback(async () => {
    const participantId = getParticipantId();
    if (!participantId) return;
    await postAction('/api/game/leave', { participantId });
    localStorage.removeItem('participantId');
  }, []);

  return { join, vote, reveal, reset, transferAdmin, kick, leave };
}
