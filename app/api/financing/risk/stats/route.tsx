import { buildWhereCondition, convertToExactDate } from "@/lib/clickhouse-wrap"
import { NextResponse } from 'next/server';
import { handleApiResponse } from '@/lib/api-utils';

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
const findClosestDate = async (relativeDate: string): Promise<string> => {
  const query = `
    SELECT asOfDate
    FROM ${RISK_TABLE}
    WHERE asOfDate <= '${relativeDate}'
    ORDER BY asOfDate DESC
    LIMIT 1
  `
  
  interface ClosestDateResult {
    asOfDate: string;
  }
  
  const result = await handleApiResponse<ClosestDateResult>(query, {
    useCache: true,
    ttl: 300
  })
  
  if (Array.isArray(result) && result.length > 0) {
    return result[0].asOfDate
  }
  return relativeDate
}

// Helper function to build sum expressions
const buildSumExpressions = (currentDate: Date | string, relativeDate: string) => {
  const currentDateStr = typeof currentDate === 'string' ? currentDate : formatDate(currentDate)
  
  return FIELDS.map(field => `
    sum(if(asOfDate = '${currentDateStr}', ${field}, 0)) as current_${field},
    sum(if(asOfDate = '${relativeDate}', ${field}, 0)) as relative_${field}
  `).join(',')
}

// Dynamic StatsData interface based on fields
type StatsData = {
  [K in FieldType as `${K}Data`]: {
    current: number
    relative: number
    change: number
    asOfDate: string
    closestDate: string
  }
}

interface StatsResponse extends Record<string, unknown> {
  [key: `current_${string}`]: number;
  [key: `relative_${string}`]: number;
}

export async function POST(req: Request) {
  try {
    const { filter = [] } = await req.json()
    
    // Process asOfDate from filter and get current date
    const { asofdate, updatedFilter } = processAsOfDate(filter as FilterCondition[])
    const currentDate = formatDate(asofdate)
    
    // Calculate relative date (30 days ago)
    const relativeDate = new Date(asofdate)
    relativeDate.setDate(relativeDate.getDate() - 30)
    const relativeDateStr = formatDate(relativeDate)
    
    // Find closest available dates
    const [closestCurrentDate, closestRelativeDate] = await Promise.all([
      findClosestDate(currentDate),
      findClosestDate(relativeDateStr)
    ])
    
    // Build the query
    const sumExpressions = buildSumExpressions(closestCurrentDate, closestRelativeDate)
    const whereClause = buildWhereCondition(updatedFilter, false)
    
    const query = `
      SELECT
        ${sumExpressions}
      FROM ${RISK_TABLE}
      WHERE asOfDate IN ('${closestCurrentDate}', '${closestRelativeDate}')
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `
    
    
    // Execute query with caching
    const result = await handleApiResponse<StatsResponse>(query, {
      useCache: true,
      ttl: 300 // Cache for 5 minutes
    })
    
    const data = (Array.isArray(result) && result[0]) || {}
    
    // Process results
    const response: Partial<StatsData> = {}
    
    FIELDS.forEach(field => {
      const current = data[`current_${field}`] || 0
      const relative = data[`relative_${field}`] || 0
      const change = relative !== 0 ? ((current - relative) / Math.abs(relative)) * 100 : 0
      
      response[`${field}Data`] = {
        current,
        relative,
        change,
        asOfDate: closestCurrentDate,
        closestDate: closestRelativeDate
      }
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error calculating stats:", error)
    return NextResponse.json(
      { 
        error: "Failed to calculate risk statistics", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
