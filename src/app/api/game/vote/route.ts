import { NextResponse } from 'next/server';
import { gameService } from '@/lib/game-service';
import { CARD_VALUES, type CardValue } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { participantId, value } = await req.json();

    if (!participantId) {
      return NextResponse.json({ error: 'participantId required' }, { status: 400 });
    }

    if (value === null) {
      gameService.clearVote(participantId);
      return NextResponse.json({ success: true });
    }

    if (!CARD_VALUES.includes(value as CardValue)) {
      return NextResponse.json({ error: 'Invalid card value' }, { status: 400 });
    }

    gameService.vote(participantId, value as CardValue);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
