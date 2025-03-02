import { getClickHouseClient, buildWhereCondition, convertToExactDate } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

interface FilterCondition {
  type: string;
  value: string[];
  operator: string;
}

// Helper function to extract and process asOfDate from filter
function processAsOfDate(filter: FilterCondition[]) {
  const hasAsOfDate = filter.some(f => f.type === 'asOfDate')
  const asofdate = hasAsOfDate 
    ? new Date(filter.find(f => f.type === 'asOfDate')!.value[0])
    : new Date()
  
  // Remove asOfDate from filter if it exists
  const updatedFilter = hasAsOfDate 
    ? filter.filter(f => f.type !== 'asOfDate')
    : filter

  return { asofdate, updatedFilter }
}

// Helper function to find closest available date
async function findClosestDate(filter: FilterCondition[], relativeDate: any) {
  const query = `
    SELECT asOfDate
    FROM risk_f_mv FINAL
    ORDER BY abs(dateDiff('day', asOfDate, toDate('${relativeDate.fullDateObject.toISOString().split('T')[0]}')))
    LIMIT 1
  `
  
  const result = await getClickHouseClient().query({
    query,
    format: "JSONEachRow",
  })
  
  const [{ asOfDate }] = await result.json() as { asOfDate: Date }[]
  return asOfDate
}

// Helper function to build sum expressions
function buildSumExpressions(fields: string[], currentDate: Date | string, relativeDate: string) {
  const currentSums = fields.map(field => 
    `SUM(CASE WHEN asOfDate = '${currentDate instanceof Date ? currentDate.toISOString().split('T')[0] : currentDate}' THEN ${field} ELSE 0 END) as current_${field}`
  ).join(", ")
  
  const relativeSums = fields.map(field => 
    `SUM(CASE WHEN asOfDate = '${relativeDate}' THEN ${field} ELSE 0 END) as relative_${field}`
  ).join(", ")
  
  const changes = fields.map(field => 
    `current_${field} - relative_${field} as change_${field}`
  ).join(", ")

  return { currentSums, relativeSums, changes }
}

export async function POST(req: Request) {
  try {
    let { filter = null, relativeDt = null } = await req.json()
    
    // Process asOfDate
    const { asofdate, updatedFilter } = processAsOfDate(filter)
    
    // Get relative date and find closest available date
    const relativeDate = convertToExactDate(relativeDt, asofdate)
    const closestDate = await findClosestDate(updatedFilter, relativeDate) 
    
    // Build and execute final query
    const fields = ["cashOut", "projectedCashOut", "realisedCashOut", "notional"]
    const { currentSums, relativeSums, changes } = buildSumExpressions(fields, asofdate, closestDate)
    
    const query = `
      SELECT 
        ${currentSums},
        ${relativeSums},
        ${changes}
      FROM risk_f_mv FINAL
      ${buildWhereCondition(updatedFilter,true)}
    `
    const resultSet = await getClickHouseClient().query({
      query,
      format: "JSONEachRow",
    })

    const [result] = await resultSet.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

