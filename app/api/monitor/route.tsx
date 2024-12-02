import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';

// Define interface for price data
interface PriceData {
  [key: string]: string;
}

// Memoize Redis connections
let globalRedis: Redis | null = null;
let globalSubscriber: Redis | null = null;

function getRedisClient() {
  if (!globalRedis) {
    globalRedis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3, // Add retry limit
      enableReadyCheck: false, // Disable ready check for better performance
    });
    
    globalRedis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }
  return globalRedis;
}

function getSubscriber() {
  if (!globalSubscriber) {
    globalSubscriber = getRedisClient().duplicate();
  }
  return globalSubscriber;
}

export async function GET() {
  // Pre-initialize encoder
  const encoder = new TextEncoder();
  const BATCH_SIZE = 50; // For batch processing

  // Pre-encode newline
  const NEWLINE = encoder.encode('\n\n');
  
  let cleanup: (() => Promise<void>) | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const redis = getRedisClient();
        const subscriber = getSubscriber();

        // Optimized data publishing
        const publishData = async (key: string) => {
          const data = await redis.hgetall(key);
          if (data && Object.keys(data).length > 0) {
            // Combine encoding operations
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}`));
            controller.enqueue(NEWLINE);
          }
        };

        // Setup Redis subscription with error handling
        await subscriber.config('SET', 'notify-keyspace-events', 'KEA')
          .catch(error => console.error('Failed to set keyspace events:', error));
          
        await subscriber.psubscribe('__keyspace@0__:valuation:*')
          .catch(error => console.error('Failed to subscribe:', error));

        // Optimized message handling
        subscriber.on('pmessage', async (_pattern, channel, message) => {
          const key = channel.split('__:')[1];
          if (key) {
            await publishData(key).catch(error => 
              console.error('Error publishing data:', error)
            );
          }
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

    // Improved cleanup
    async cancel() {
      if (cleanup) {
        await cleanup();
        // Don't close global connections, just unsubscribe
        if (globalSubscriber) {
          await globalSubscriber.punsubscribe().catch(console.error);
        }
      }
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
