import { getClickHouseClient, buildWhereCondition, convertToExactDate } from "@/lib/clickhouse-wrap"
import { NextResponse } from "next/server"

interface FilterCondition {
  type: string;
  value: string[];
  operator: string;
}

// Constants
const RISK_TABLE = 'risk_f_mv FINAL'
const FIELDS = ["cashOut", "projectedCashOut", "realisedCashOut", "notional"] as const

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => date.toISOString().split('T')[0]

// Helper function to extract and process asOfDate from filter
const processAsOfDate = (filter: FilterCondition[]) => {
  const asOfDateFilter = filter.find(f => f.type === 'asOfDate')
  const asofdate = asOfDateFilter ? new Date(asOfDateFilter.value[0]) : new Date()
  const updatedFilter = filter.filter(f => f.type !== 'asOfDate')
  
  return { asofdate, updatedFilter }
}

// Helper function to find closest available date
const findClosestDate = async (relativeDate: any): Promise<string> => {
  const query = `
    SELECT asOfDate
    FROM ${RISK_TABLE}
    ORDER BY abs(dateDiff('day', asOfDate, toDate('${formatDate(relativeDate.fullDateObject)}')))
    LIMIT 1
  `
  
  const result = await getClickHouseClient().query({
    query,
    format: "JSONEachRow",
  })
  
  const [{ asOfDate }] = await result.json() as { asOfDate: string }[]
  return asOfDate
}

// Helper function to build sum expressions
const buildSumExpressions = (currentDate: Date | string, relativeDate: string) => {
  const formatDateStr = (date: Date | string) => 
    date instanceof Date ? formatDate(date) : date
  
  const buildExpression = (field: string, dateStr: string, prefix: string) =>
    `SUM(CASE WHEN asOfDate = '${dateStr}' THEN ${field} ELSE 0 END) as ${prefix}_${field}`

  const currentSums = FIELDS.map(field => 
    buildExpression(field, formatDateStr(currentDate), 'current')
  ).join(", ")
  
  const relativeSums = FIELDS.map(field => 
    buildExpression(field, relativeDate, 'relative')
  ).join(", ")
  
  const changes = FIELDS.map(field => 
    `current_${field} - relative_${field} as change_${field}`
  ).join(", ")

  return { currentSums, relativeSums, changes }
}

export async function POST(req: Request) {
  try {
    const { filter = [], relativeDt = null } = await req.json()
    
    const { asofdate, updatedFilter } = processAsOfDate(filter)
    const relativeDate = convertToExactDate(relativeDt, asofdate)
    const closestDate = await findClosestDate(relativeDate)
    
    const { currentSums, relativeSums, changes } = buildSumExpressions(asofdate, closestDate)
    
    const query = `
      SELECT 
        ${currentSums},
        ${relativeSums},
        ${changes}
      FROM ${RISK_TABLE}
      ${buildWhereCondition(updatedFilter, true)}
    `
    
    const resultSet = await getClickHouseClient().query({
      query,
      format: "JSONEachRow",
    })

    const [result] = await resultSet.json()
    return NextResponse.json({
      ...(result as Record<string, unknown>),
      asOfDate: formatDate(asofdate),
      closestDate: formatDate(new Date(closestDate)),
      updatedFilter: JSON.stringify(updatedFilter)
    })
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

