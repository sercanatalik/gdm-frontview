import { NextResponse } from 'next/server';
import { getClickHouseClient } from '@/lib/clickhouse-wrap';
import { NextRequest } from 'next/server';

interface RiskViewRow {
  eventId: number;
  // Add other fields as needed
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lastUpdate = searchParams.get('lastUpdate');
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {   
      const client = getClickHouseClient();
      let lastEventId = 0;
      
      try {
        while (true) {  // Simplified loop condition
          // Update query with latest eventId
          let query = 'SELECT * FROM risk_view final';
          
          if (lastUpdate && lastEventId === 0) {
            query += ` WHERE eventId > ${Number(lastUpdate)}`;
          } else if (lastEventId > 0) {
            query += ` WHERE eventId > ${lastEventId}`;
          }

          query += ' ORDER BY eventId ASC LIMIT 1000';
         
          
          try {
            const resultSet = await client.query({
              query,
              format: 'JSONEachRow',
              clickhouse_settings: {
                wait_end_of_query: 1,
               
               
              }
            });

            for await (const row of resultSet.stream()) {
              const parsedRow = JSON.parse(row[0].text) as RiskViewRow;
              const data = encoder.encode(`data: ${JSON.stringify(parsedRow)}\n\n`);
             
              controller.enqueue(data);
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
            
          } catch (error) {
            console.error('Error:', error);
            const errorData = encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
            controller.enqueue(errorData);
            break;  // Exit the loop on error
          }
        }
      } finally {
        await client.close();  // Ensure client is closed
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