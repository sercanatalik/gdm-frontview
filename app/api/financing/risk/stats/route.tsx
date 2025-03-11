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
type FieldType = typeof FIELDS[number]

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

// Dynamic StatsData interface based on fields
type StatsData = {
  [key in FieldType]: {
    current: number;
    relative: number;
    change: number;
  };
} & {
  asOfDate: string;
  closestDate: string;
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

    const [result] = await resultSet.json() as Record<string, number>[]
    
    // Transform the flat result into dynamic StatsData structure
    const statsData = FIELDS.reduce((acc, field) => {
      acc[field] = {
        current: result[`current_${field}`] || 0,
        relative: result[`relative_${field}`] || 0,
        change: result[`change_${field}`] || 0
      }
      return acc
    }, {} as StatsData)
    
    // Add date information
    statsData.asOfDate = formatDate(asofdate)
    statsData.closestDate = formatDate(new Date(closestDate))

    return NextResponse.json(statsData)
  } catch (error) {
    console.error("Error calculating sums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

