import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';

// Initialize Redis client
const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

export async function GET() {
  const encoder = new TextEncoder();

  let cleanup: (() => void) | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const subscriber = redis.duplicate();
        
        // First, get all existing keys with "price"
        const keys = await redis.keys('price:*');
        for (const key of keys) {
            const data = await redis.get(key);  
            if (data) {
                const pdata = 'data: ' + JSON.stringify({key:key, px:data})+'\n\n';
               
                controller.enqueue(encoder.encode(pdata));
            }
        }

        // Enable keyspace notifications for all events
        await subscriber.config('SET', 'notify-keyspace-events', 'KEA');
        await subscriber.psubscribe('__keyspace@0__:price:');

        subscriber.on('pmessage', async (_pattern, channel, message) => {
          try {
            const key = channel.split(':')[1];
            const px = await redis.get(key);
            const pdata = 'data: ' + JSON.stringify({key:key, px:px}) + '\n\n';
            controller.enqueue(encoder.encode(pdata));
          } catch (error) {
            console.error('Error processing message:', error);
          }
        });

        subscriber.on('error', (error) => {
          console.error('Redis subscription error:', error);
          controller.error(error);
        });

        cleanup = () => {
          try {
            subscriber.punsubscribe();
            subscriber.quit();
           
            console.log('Cleanup complete');
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        };
      } catch (error) {
        console.error('Stream start error:', error);
        controller.error(error);
      }
    },
    cancel() {
      if (cleanup) cleanup();
    }
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
