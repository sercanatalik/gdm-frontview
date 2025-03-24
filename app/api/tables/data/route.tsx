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

    let result = await resultSet.json()
    
    // Replace dots with underscores in result keys
    result = result.map(item => {
      const newItem: Record<string, unknown> = {}
      for (const key in item as Record<string, unknown>) {
        const newKey = key.replace(/\./g, '_')
        newItem[newKey] = (item as Record<string, unknown>)[key]
      }
      return newItem
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

