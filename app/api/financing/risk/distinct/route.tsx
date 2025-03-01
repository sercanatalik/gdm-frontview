

import { getClickHouseClient } from '@/lib/clickhouse-wrap'
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Get the column parameter from the URL
        const { searchParams } = new URL(request.url);
        const column = searchParams.get('column');

        // Validate the column parameter
        if (!column) {
            return NextResponse.json({ error: 'Column parameter is required' }, { status: 400 });
        }

        // List of valid columns to prevent SQL injection
        const validColumns = [
            'desk', 'SL1', 'portfolio', 'book', 'tradeId', 'ccy', 'tradeCcy',
            'instrument', 'vcProduct', 'vcProductGroup', 'counterparty', 'obligor'
        ];

        if (!validColumns.includes(column)) {
            return NextResponse.json({ error: 'Invalid column parameter' }, { status: 400 });
        }

        const client = getClickHouseClient();
        
        // Query for distinct values
        const query = `
            SELECT DISTINCT ${column}
            FROM risk_f_mv
            WHERE ${column} IS NOT NULL
            ORDER BY ${column}
        `;

        const resultSet = await client.query({
            query,
            format: 'JSONEachRow',
        });

        const rows = await resultSet.json();
        
        return NextResponse.json(rows);

    } catch (error) {
        console.error('Error fetching distinct values:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



