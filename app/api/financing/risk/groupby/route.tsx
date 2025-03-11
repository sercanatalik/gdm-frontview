import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { filter = null, groupBy = null, countBy = null,orderBy = null } = await req.json()

    const query = `
            SELECT 
                ${groupBy} as groupBy,
                sum(cashOut) as totalCashOut,
                sum(notional) as totalNotional,
                count(DISTINCT ${countBy}) as distinctCount
            FROM risk_f_mv  
            ${buildWhereCondition(filter,true)}
            GROUP BY ${groupBy}
            ORDER BY ${orderBy}
        `
    console.log(query)
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

