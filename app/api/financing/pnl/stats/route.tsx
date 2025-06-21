import { buildWhereCondition } from "@/lib/clickhouse-wrap"
import { handleApiResponse } from "@/lib/api-utils"

// Constants
const RISK_TABLE = 'pnl_eod FINAL'

export interface PnLStatsResponse {
  SL1: string;
  ytd: number;
  mtd: number;
  aop: number;
}

export async function POST(req: Request) {
  const { filter = [] } = await req.json()
  
  const query = `
    SELECT 
      SL1,
      sum(YTD) as ytd,
      sum(MTD) as mtd,
      any(AOP) as aop
    FROM ${RISK_TABLE}
    ${buildWhereCondition(filter, true)} and asOfDate = (select max(asOfDate) from ${RISK_TABLE}) 
    GROUP BY SL1
    ORDER BY SL1
  `
  
  return handleApiResponse<PnLStatsResponse>(query, {
    useCache: true,
    ttl: 300 // Cache for 5 minutes
  })
}