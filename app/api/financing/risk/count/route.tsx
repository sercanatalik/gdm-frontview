import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"
import type { Filter } from "@/components/ui/filters"

export async function POST(req: Request) {
  try {
    const { filter = [] } = await req.json()
    
    // Add a date filter to count trades in the last 35 days
    const dateFilter = [
      ...filter,
      {
        id: "tradeDate",
        type: "tradeDate",
        operator: ">=",
        value: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Format: YYYY-MM-DD
      }
    ]

    console.log(dateFilter)

    const query = `
            SELECT count()
            FROM risk_f_mv  
            ${buildWhereCondition(dateFilter)}
        `
        console.log(query)

    const resultSet = await getClickHouseClient().query({
      query,
      format: "JSONEachRow",
    })
    console.log(query)
    const result = await resultSet.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

