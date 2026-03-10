import { gameService } from '@/lib/game-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const url = new URL(req.url);
  const participantId = url.searchParams.get('participantId');

  const stream = new ReadableStream({
    start(controller) {
      // Mark participant online and get cleanup function
      const unmarkOnline = participantId
        ? gameService.markOnline(participantId)
        : () => {};

      // Send current state immediately
      const initialState = gameService.getPublicState();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialState)}\n\n`));

      // Subscribe to future updates
      const unsubscribe = gameService.subscribe((state) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        unmarkOnline();
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
