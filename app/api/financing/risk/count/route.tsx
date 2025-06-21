import { buildWhereCondition } from "@/lib/clickhouse-wrap"
import { handleApiResponse } from "@/lib/api-utils"
import type { Filter } from "@/components/ui/filters"

interface RiskCountResponse {
  tradeCount: number;
  counterpartyCount: number;
  instrumentCount: number;
  currencyCount: number;
}

export async function POST(req: Request) {
  const { filter = [] } = await req.json()
  
  // Add a date filter to count trades in the last 35 days
  const dateFilter = [
    ...(Array.isArray(filter) ? filter : []),
    {
      id: "tradeDate",
      type: "tradeDate",
      operator: ">=",
      value: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Format: YYYY-MM-DD
    }
  ]

  const query = `
    SELECT 
      count() as tradeCount,
      count(DISTINCT counterparty) as counterpartyCount,
      count(DISTINCT instrument) as instrumentCount,
      count(DISTINCT ccy) as currencyCount 
    FROM risk_f_mv  
    ${buildWhereCondition(dateFilter)}
  `
  
  return handleApiResponse<RiskCountResponse>(query, {
    useCache: true,
    ttl: 300 // Cache for 5 minutes
  })
}
