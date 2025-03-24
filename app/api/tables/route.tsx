import { getClickHouseClient } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

interface TableResult {
  name: string
  type: string
 
}


async function fetchTableData(tableName: string) {
  const client = getClickHouseClient()

  try {
    // Special case for listing all tables
    const query = tableName === 'db' 
      ? 'SHOW TABLES FROM default'
      : `DESC TABLE ${tableName}`
   
    const resultSet = await client.query({ query })
    const results = await resultSet.json()

    return results.data as TableResult[]
  } catch (error) {
    console.error(`Error fetching table description for ${tableName}:`, error)
    throw new Error(`Failed to fetch table description for ${tableName}`)
  } finally {
    await client.close()
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get("table")

    if (!tableName) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      )
    }

    const results = await fetchTableData(tableName)
    
    // Replace dots with underscores in table names
    const processedResults = results.map(result => ({
      ...result,
      name: result.name.replace(/\./g, '_')
    }));
    
    return NextResponse.json(processedResults)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

