import { getClickHouseClient } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

const dateColumns = ['asOfDate', 'reportDate', 'reportDate']

async function fetchDistinctValues(tableName: string, columnName: string) {
  const client = getClickHouseClient()

  try {
    const query = `SELECT DISTINCT ${columnName} FROM ${tableName}`
    const resultSet = await client.query({ query })
    const result = await resultSet.json()
    
    // Extract distinct values and format dates if needed
    return result.data.map((row: any) => {
      const value = row[columnName]
      if (dateColumns.includes(columnName) && value) {
        // Format date as yyyy-mm-dd
        return new Date(value).toISOString().split('T')[0]
      }
      return value
    })
   
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
    const columnName = searchParams.get("column")

    if (!tableName || !columnName) {
      return NextResponse.json(
        { error: "Table name and column name are required" },
        { status: 400 }
      )
    }

    const distinctValues = await fetchDistinctValues(tableName, columnName)
    
    return NextResponse.json(distinctValues)
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

