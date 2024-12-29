import { client } from '@/lib/clickhouse-wrap'
import { NextResponse } from 'next/server';

interface RiskResults {
    data: Array<{ 
       
    }>;
    meta?: any[];
}


async function fetchRiskData(fromEventId?: number): Promise<RiskResults> {

    try {
        // First get the max eventId if fromEventId is not provided
      
        // Get records with eventId greater than the provided/initial eventId
        const query = `
            SELECT *
            FROM risk_view final
            ORDER BY eventId ASC
            LIMIT 100`;
       
        const resultSet = await client.query({ query });
        const results = await resultSet.json() as RiskResults;
        
        return {
            
            data: results.data,
            meta: 'meta' in results ? results.meta : undefined,
        };
    } catch (error) {
        console.error('Error fetching risk data:', error);
        throw new Error('Failed to fetch risk data');
    } finally {
        await client.close();
    }
}

/**
 * @swagger
 * /api/financing/risk:
 *   get:
 *     summary: Retrieve financing risk data
 *     description: Fetches risk data from ClickHouse risk_view
 *     responses:
 *       200:
 *         description: Successfully retrieved risk data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventId:
 *                   type: integer
 *                   description: The latest event ID from the risk view
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     
 *                 meta:
 *                   type: array
 *                   description: Optional metadata from the query
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fromEventId = searchParams.get('fromEventId');
        const results = await fetchRiskData(fromEventId ? parseInt(fromEventId) : undefined);
        return NextResponse.json(results);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
