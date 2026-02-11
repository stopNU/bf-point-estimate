import { NextResponse } from 'next/server';
import { gameService } from '@/lib/game-service';

export async function POST(req: Request) {
  try {
    const { participantId, targetId } = await req.json();

    if (!participantId || !targetId) {
      return NextResponse.json({ error: 'participantId and targetId required' }, { status: 400 });
    }

    gameService.kick(participantId, targetId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
