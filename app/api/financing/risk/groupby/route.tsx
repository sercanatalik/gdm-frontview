import { buildWhereCondition } from "@/lib/clickhouse-wrap"
import { handleApiResponse } from "@/lib/api-utils"

export interface GroupByResponse {
  groupBy: string;
  totalCashOut: number;
  totalNotional: number;
  distinctCount: number;
}

export async function POST(req: Request) {
  const { 
    filter = null, 
    groupBy = 'counterparty', 
    countBy = 'tradeId',
    orderBy = 'totalCashOut DESC' 
  } = await req.json()

  // Validate required fields
  if (!groupBy || !countBy) {
    return new Response(JSON.stringify({ error: 'groupBy and countBy are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query = `
    SELECT 
      ${groupBy} as groupBy,
      abs(sum(cashOut)) as totalCashOut,
      abs(sum(notional)) as totalNotional,
      count(DISTINCT ${countBy}) as distinctCount
    FROM risk_f_mv  
    ${buildWhereCondition(filter, true)}
    GROUP BY ${groupBy}
    ${orderBy ? `ORDER BY ${orderBy}` : ''}
  `
  
  return handleApiResponse<GroupByResponse>(query, {
    useCache: true,
    ttl: 300 // Cache for 5 minutes
  })
}

