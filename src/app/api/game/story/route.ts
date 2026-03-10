import { NextResponse } from 'next/server';
import { gameService } from '@/lib/game-service';

export async function PATCH(req: Request) {
  try {
    const { participantId, title, description } = await req.json();
    if (!participantId) return NextResponse.json({ error: 'participantId required' }, { status: 400 });
    gameService.setStory(participantId, title ?? '', description ?? '');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }
}
