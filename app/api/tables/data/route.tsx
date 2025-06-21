import { buildWhereCondition } from "@/lib/clickhouse-wrap"
import { handleApiResponse } from "@/lib/api-utils"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { filter = null, tableName } = await req.json()
    
    if (!tableName) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
    }

    const query = `
            SELECT *
            FROM ${tableName}  FINAL
            ${buildWhereCondition(filter,true)}
        `
    
    const result = await handleApiResponse<Record<string, unknown>>(query, {
      useCache: true,
      ttl: 300 // Cache for 5 minutes
    })
    
    // Replace dots with underscores in result keys
    const processedResult = result.map(item => {
      const newItem: Record<string, unknown> = {}
      for (const key in item) {
        const newKey = key.replace(/\./g, '_')
        newItem[newKey] = item[key]
      }
      return newItem
    })
    
    return NextResponse.json(processedResult)
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
