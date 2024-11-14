import { createClient } from '@clickhouse/client';
import { NextResponse } from 'next/server';

interface RiskResults {
    data: Array<{ latestUpdate: string }>;
    meta?: any[];
}

const createClickHouseClient = () => {
    return createClient({
        url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    });
};

async function fetchRiskData(): Promise<RiskResults> {
    const client = createClickHouseClient();

    try {
        const query = `SELECT * FROM risk_view final`;
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       latestUpdate:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
export async function GET() {
    try {
        const results = await fetchRiskData();
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
