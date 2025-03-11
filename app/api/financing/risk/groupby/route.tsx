import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { filter = null, groupBy = null } = await req.json()

    const query = `
            SELECT 
                counterparty,
                sum(cashOut) as totalCashOut,
                count(DISTINCT instrument) as distinctInstrumentCount
            FROM risk_f_mv  
            ${buildWhereCondition(filter,true)}
            GROUP BY counterparty
            ORDER BY totalCashOut DESC
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

