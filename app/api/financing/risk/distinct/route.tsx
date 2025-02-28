// 2	asOfDate	DateTime					
// 3	updatedAt	DateTime					
// 4	bu	Nullable(String)					
// 5	sbu	Nullable(String)					
// 6	portfolio	Nullable(String)					
// 7	book	String					
// 8	tradeId	Nullable(String)					
// 9	ccy	Nullable(String)					
// 10	tradeCcy	Nullable(String)					
// 11	instrument	Nullable(String)					
// 12	tradeStatus	Nullable(Int64)					
// 13	version	Nullable(Float64)					
// 14	cashOut	Nullable(Float64)					
// 15	projectedCashOut	Nullable(Float64)					
// 16	realisedCashOut	Nullable(Float64)					
// 17	notional	Nullable(Float64)					
// 18	vcProduct	Nullable(String)					
// 19	vcProductGroup	Nullable(String)					
// 20	counterparty	Nullable(String)					
// 21	obligor	Nullable(String)					
// 22	tradeDate	Nullable(Date)					
// 23	startDate	Nullable(Date)					
// 24	maturityDate	Nullable(Date)					
// 25	underlyingCcy	Nullable(Float64)					
// 26	underlyingAmount	Nullable(String)					
// 27	calculatedAt	DateTime

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
            'bu', 'sbu', 'portfolio', 'book', 'tradeId', 'ccy', 'tradeCcy',
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



