import { handleApiResponse } from "@/lib/api-utils"
import { NextResponse } from "next/server"

const dateColumns = ['asOfDate', 'reportDate', 'reportDate']

async function fetchDistinctValues(tableName: string, columnName: string): Promise<string[] | NextResponse> {
  try {
    const query = dateColumns.includes(columnName)
      ? `SELECT DISTINCT toString(toDate(${columnName})) as ${columnName} FROM ${tableName} FINAL`
      : `SELECT DISTINCT ${columnName} FROM ${tableName} FINAL`

    // Execute the query using handleApiResponse
    const response = await handleApiResponse<Array<Record<string, string>>>(query, {
      params: { tableName, columnName },
      useCache: true,
      ttl: 3600 // Cache for 1 hour
    })

    // Check if the response is an error
    const responseData = await response.json()
    if ('error' in responseData) {
      return NextResponse.json(
        { error: responseData.error, details: responseData.details },
        { status: 500 }
      )
    }

    // Return the column values
    return responseData.map((row: Record<string, string>) => row[columnName])
  } catch (error) {
    console.error(`Error in fetchDistinctValues for ${tableName}.${columnName}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch distinct values', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tableName = searchParams.get("table")
  const columnName = searchParams.get("column")

  if (!tableName || !columnName) {
    return NextResponse.json(
      { error: "Table name and column name are required" },
      { status: 400 }
    )
  }

  try {
    const distinctValues = await fetchDistinctValues(tableName, columnName)
    
    // If fetchDistinctValues returned a response (which would happen on error), return it
    if (distinctValues instanceof NextResponse) {
      return distinctValues
    }
    
    return NextResponse.json(distinctValues)
  } catch (error) {
    console.error('Error in GET /api/tables/distinct:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
