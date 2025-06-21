import { buildWhereCondition } from "@/lib/clickhouse-wrap"
import { handleApiResponse } from "@/lib/api-utils"

interface CashoutByMonthResponse {
  month: string;
  cumulative_cashout: number;
  monthly_cashout: number;
  [key: string]: string | number; // For dynamic breakdown fields
}

export async function POST(req: Request) {
  const { filter = null, breakdown = 'SL1' } = await req.json()
  const breakdownClause = breakdown ? `, ${breakdown}` : ''
  const breakdownPartition = breakdown ? `PARTITION BY ${breakdown}` : ''
  
  const query = `
    WITH monthly_data AS (
      SELECT
        toStartOfMonth(asOfDate) as month_start,
        sum(cashOut) as monthly_cashout${breakdownClause} 
      FROM risk_f_mv
      ${buildWhereCondition(filter, true)}
      GROUP BY month_start${breakdownClause}
      ORDER BY month_start
    )
    
    SELECT
      formatDateTime(month_start, '%Y-%m') as month${breakdownClause}, 
      sum(monthly_cashout) OVER (${breakdownPartition} ORDER BY month_start) as cumulative_cashout,
      monthly_cashout
    FROM monthly_data
    ORDER BY month_start${breakdownClause}
  `
  
  return handleApiResponse<CashoutByMonthResponse>(query, { 
    useCache: true,
    ttl: 300 // Cache for 5 minutes
  })
}
