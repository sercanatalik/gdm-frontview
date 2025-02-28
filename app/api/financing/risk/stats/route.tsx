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

export async function POST(request: Request) {
    try {
        // Get the fields parameter from the request body
        const body = await request.json();
        const fields = body.fields;

        // Validate the fields parameter
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return NextResponse.json({ error: 'Fields array is required in request body' }, { status: 400 });
        }

        // List of valid numeric columns to prevent SQL injection
        const validNumericColumns = [
            'cashOut', 'projectedCashOut', 'realisedCashOut',
            'notional'
        ];

        // Validate all provided fields
        if (!fields.every(field => validNumericColumns.includes(field))) {
            return NextResponse.json({ error: 'Invalid field parameter' }, { status: 400 });
        }

        const client = getClickHouseClient();
        
        // Create sum expressions for each field
        const sumExpressions = fields.map(field => `SUM(${field}) as ${field}_sum`).join(', ');
        
        // Query for sums
        const query = `
            SELECT ${sumExpressions}
            FROM risk_f_mv
        `;

        const resultSet = await client.query({
            query,
            format: 'JSONEachRow',
        });

        const rows = await resultSet.json();
        
        return NextResponse.json(rows[0]); // Return first row since it's an aggregate query

    } catch (error) {
        console.error('Error calculating sums:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



