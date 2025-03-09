import { getClickHouseClient, buildWhereCondition } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { filter = null, tableName } = await req.json()

    const query = `
            SELECT *
            FROM ${tableName}  
            ${buildWhereCondition(filter,true)}
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

