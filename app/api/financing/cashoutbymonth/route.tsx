import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"



export async function POST(req: Request) {
  try {
    const { filter = null,breakdown = 'SL1' } = await req.json()
    let breakdownClause =  breakdown ? `, ${breakdown}` : ''
    let breakdownPartition = breakdown ? `PARTITION BY ${breakdown}` : ''
    const query = `
      WITH monthly_data AS (
        SELECT
          toStartOfMonth(asOfDate) as month_start,
          sum(cashOut) as monthly_cashout${breakdownClause} 
        FROM risk_f_mv
        ${buildWhereCondition(filter,true)}
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
    console.log(query)
    const resultSet = await getClickHouseClient().query({
      query,
      format: "JSONEachRow",
    })

    const result = await resultSet.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating cashout by month:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

