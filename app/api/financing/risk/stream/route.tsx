// File: app/api/stream/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@clickhouse/client';


export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {   
      const client = createClient({
        url: 'http://localhost:8123',
        username: 'default',
        password: '',
        database: 'default'
      });

      const query = 'SELECT * FROM  mv_fo_financing_trades';

      try {
        const resultSet = await client.query({
          query,
          format: 'JSONEachRow',
          clickhouse_settings: {
            wait_end_of_query: 1,
            max_block_size: '1000' ,
          }
        });

        for await (const row of resultSet.stream()) {
            
          const data = encoder.encode(`${JSON.stringify(row)}\n\n`);
          controller.enqueue(data);
        }
      } catch (error) {
        console.error('Error:', error);
        const errorData = encoder.encode(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
        controller.enqueue(errorData);
      } finally {
        await client.close();
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

