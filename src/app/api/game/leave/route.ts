import { NextResponse } from 'next/server';
import { gameService } from '@/lib/game-service';

export async function POST(req: Request) {
  try {
    const { participantId } = await req.json();

    if (!participantId) {
      return NextResponse.json({ error: 'participantId required' }, { status: 400 });
    }

    gameService.leave(participantId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
