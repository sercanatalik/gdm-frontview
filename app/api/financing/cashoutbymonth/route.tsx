import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"



export async function POST(req: Request) {
  try {
    const { filter = null } = await req.json()

    const query = `
      WITH monthly_data AS (
        SELECT
          toStartOfMonth(asOfDate) as month_start,
          sum(cashOut) as monthly_cashout
        FROM risk_f_mv
        ${buildWhereCondition(filter,true)}
        GROUP BY month_start
        ORDER BY month_start
      )
      
      SELECT
        formatDateTime(month_start, '%Y-%m') as month,
        sum(monthly_cashout) OVER (ORDER BY month_start) as cumulative_cashout,
        monthly_cashout
      FROM monthly_data
      ORDER BY month_start
    `
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

