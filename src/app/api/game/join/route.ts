import { NextResponse } from 'next/server';
import { gameService } from '@/lib/game-service';

export async function POST(req: Request) {
  try {
    const { name, avatar } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json({ error: 'Avatar is required' }, { status: 400 });
    }

    const participant = gameService.join(name, avatar);
    return NextResponse.json({ participantId: participant.id, isAdmin: gameService.getPublicState().adminId === participant.id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
