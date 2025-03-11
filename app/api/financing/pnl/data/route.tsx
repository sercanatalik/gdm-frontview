import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {

    const query = `
            SELECT *
            FROM pnl_eod  
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

