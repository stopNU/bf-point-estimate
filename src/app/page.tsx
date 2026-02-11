'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import JoinForm from '@/components/JoinForm';
import { useGameActions } from '@/hooks/useGameActions';

export default function Home() {
  const router = useRouter();
  const { join } = useGameActions();
  const [checking, setChecking] = useState(true);

  // Check if already joined
  useEffect(() => {
    const participantId = localStorage.getItem('participantId');
    if (participantId) {
      router.replace('/game');
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleJoin = async (name: string, avatar: string) => {
    await join(name, avatar);
    router.push('/game');
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-display text-xl text-gold-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return <JoinForm onJoin={handleJoin} />;
}
