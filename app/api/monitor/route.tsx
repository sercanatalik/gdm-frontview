import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';

// Define interface for price data
interface PriceData {
  [key: string]: string;
}

// Initialize Redis client with error handling
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

export async function GET() {
  const encoder = new TextEncoder();

  let cleanup: (() => Promise<void>) | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const subscriber = redis.duplicate();

        // Helper function to format and send data
        const publishData = async (key: string) => {
          const data = await redis.hgetall(key);
          if (data && Object.keys(data).length > 0) {
           
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
        };

        // Initial data load
        // const keys = await redis.keys('price:*');
        // await Promise.all(keys.map(sendPriceData));

        // Setup Redis subscription
        await subscriber.config('SET', 'notify-keyspace-events', 'KEA');
        await subscriber.psubscribe('__keyspace@0__:valuation:*');

        subscriber.on('pmessage', async (_pattern, channel, message) => {
          // console.log('pmessage', channel, message)
          const key = channel.split('__:')[1];
          if (key) {
            await publishData(key);
          }
          
          //   try {
          //     const key = channel.split('__:')[1];
          //     if (key) {
          //       await sendPriceData(key);
          //     }
          //   } catch (error) {
            // console.error('Error processing message:', error);
          // }
        });

        subscriber.on('error', (error) => {
          console.error('Redis subscription error:', error);
          controller.error(error);
        });

        cleanup = async () => {
          try {
            await subscriber.punsubscribe();
            await subscriber.quit();
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
    async cancel() {
      if (cleanup) await cleanup();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
