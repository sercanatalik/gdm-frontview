import { getClickHouseClient } from '@/lib/clickhouse-wrap'
import { NextResponse } from 'next/server';

interface HMSBookResults {
    data: Array<{}>;
    meta?: any[];
}

async function fetchHMSBookData(distinct?: string | null): Promise<HMSBookResults> {
    const client = getClickHouseClient();

    try {
        const query = `
            SELECT ${distinct ? `DISTINCT ${distinct}` : '*'} FROM hmsbook_f
            `;
       console.log(query);
        const resultSet = await client.query({ query });
        const results = await resultSet.json() as HMSBookResults;
        
        return {
            data: results.data,
            meta: 'meta' in results ? results.meta : undefined,
        };
    } catch (error) {
        console.error('Error fetching HMS book data:', error);
        throw new Error('Failed to fetch HMS book data');
    } finally {
        await client.close();
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const distinctParam = searchParams.get('distinct');
      
        
        const results = await fetchHMSBookData(distinctParam);
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
