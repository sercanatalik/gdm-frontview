import { getClickHouseClient, buildWhereCondition, convertToExactDate } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"


// Constants
const RISK_TABLE = 'pnl_eod FINAL'



export async function POST(req: Request) {
    try {
      const { filter = [] } = await req.json()
      
      const query = `
        SELECT 
          SL1,
          sum(YTD) as ytd,
          sum(MTD) as mtd,
          any(AOP) as aop
        FROM ${RISK_TABLE}
        ${buildWhereCondition(filter, true)} and asOfDate = (select max(asOfDate) from ${RISK_TABLE}) 
        GROUP BY  SL1
        ORDER BY  SL1
      `
      
      const resultSet = await getClickHouseClient().query({
        query,
        format: "JSONEachRow",
      })

      const result = await resultSet.json()
      
      return NextResponse.json(result)
    } catch (error) {
      console.error("Error calculating sums:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
  
  