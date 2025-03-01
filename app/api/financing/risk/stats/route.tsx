import { getClickHouseClient } from '@/lib/clickhouse-wrap'
import { NextResponse } from 'next/server';

interface FilterCondition {
    type: string;
    value: string[];
    operator: string;
}

function buildWhereCondition(filter: FilterCondition[]): string {
    if (!filter?.length) return '';
    console.log(filter)
    const conditions = filter
        .filter(f => f.value?.length > 0)
        .map(({ type, value, operator }) => {
            const values = value.map(v => `'${v}'`).join(',');
            return operator === 'is not'
                ? `\`${type}\` NOT IN (${values})`
                : `\`${type}\` IN (${values})`;
        });

    return conditions.length 
        ? `WHERE ${conditions.join(' AND ')}`
        : '';
}

export async function POST(req: Request) {
    try {
        const { filter = null } = await req.json();
        
        const fields = ['cashOut', 'projectedCashOut', 'realisedCashOut', 'notional'];
        const sumExpressions = fields.map(field => `SUM(${field})`).join(', ');
        
        

        const query = `
            SELECT ${sumExpressions}
            FROM risk_f_mv  
            ${buildWhereCondition(filter)}
        `;
        console.log(query)
        const resultSet = await getClickHouseClient().query({
            query,
            format: 'JSONEachRow',
        });

        const [result] = await resultSet.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error calculating sums:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}



