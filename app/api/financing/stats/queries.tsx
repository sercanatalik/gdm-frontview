import { getClickHouseClient } from '@/lib/clickhouse-wrap';

// Types
export type Measure = 'stats' | 'cashoutbymonth' | 'recenttrades' | 'countrecenttrades' | 'desk';

interface Filter {
  desk?: string;
  [key: string]: unknown;
}

const client = getClickHouseClient()

interface StatsData {
  asOfDate: string;
  cashOut: number;
  collateralAmount: number;
  accrualDaily: number;
  accrualProjected: number;
  accrualRealised: number;
}

interface ProcessedStats {
  [key: string]: {
    current: number;
    previous: number;
    change: number;
    currentDate: string;
    previousDate: string;
    numDays: number;
  };
}

// Enhanced type definitions
interface QueryConditions {
  whereClause: string;
  conditions: string[];
}

interface QueryResult<T> {
  message?: string;
  data: T;
}

// New type-safe query configuration
const QUERY_CONFIGS = {
  stats: {
    query: (conditions: string[]) => `
      WITH 
        (SELECT MAX(r.asOfDate) FROM risk_f_mv FINAL) as latest_date,
        (SELECT dateAdd(day, -1, MAX(r.asOfDate)) FROM risk_f_mv FINAL) as prev_date
      SELECT 
        r.asOfDate as asOfDate,
        SUM(cashOut) as cashOut,
        SUM(collateralAmount) as collateralAmount,
        SUM(accrualDaily) as accrualDaily,
        SUM(accrualProjected) as accrualProjected,
        SUM(accrualRealised) as accrualRealised
      FROM risk_f_mv FINAL 
      WHERE r.asOfDate IN (latest_date, prev_date) 
      ${conditions.length ? 'AND ' + conditions.join(' AND ') : ''}
      GROUP BY r.asOfDate`,
    processResult: (data: StatsData[]) => DataProcessor.processStatsData(data)
  },
  desk: {
    query: () => `SELECT DISTINCT hmsbook_desk FROM risk_f_mv FINAL`,
    processResult: (data: any) => data
  },
  cashoutbymonth: {
    query: (whereClause: string) => `
      SELECT
        formatDateTime(toStartOfMonth(tradeDt), '%b') AS month,
        round(sum(fundingAmount) / 1000000, 2) AS monthlyCashout,
        round(sum(sum(fundingAmount)) OVER (ORDER BY toStartOfMonth(tradeDt)) / 1000000, 2) AS cumulativeCashout
      FROM risk_f_mv FINAL ${whereClause}
      GROUP BY toStartOfMonth(tradeDt)
      ORDER BY toStartOfMonth(tradeDt)
    `,
    processResult: (data: any) => data
  },
  recenttrades: {
    query: (whereClause: string) => `
      SELECT 
        counterparty_name as counterparty,
        counterparty_sector as sector,
        SUM(fundingAmount) / 1e6 as notional,
        MAX(tradeDt) as latest_trade_date
      FROM risk_f_mv FINAL ${whereClause}  
      GROUP BY counterparty_name, counterparty_sector
      ORDER BY latest_trade_date DESC 
      LIMIT 150
    `,
    processResult: (data: any) => data
  },
  countrecenttrades: {
    query: (whereClause: string) => `
      SELECT COUNT(*) FROM risk_f_mv FINAL ${whereClause}
    `,
    processResult: (data: any) => data
  }
} as const;

// Simplified QueryBuilder
class QueryBuilder {
  static buildQueryConditions(filter: Filter | null): QueryConditions {
    const conditions = [];
    if (filter?.desk) {
      conditions.push(`hmsbook_desk = '${filter.desk}'`);
    }
    return {
      conditions,
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    };
  }

  static getQuery(measure: Measure, queryConditions: QueryConditions): string {
    const config = QUERY_CONFIGS[measure];
    return measure === 'stats' 
      ? config.query(queryConditions.conditions)
      : config.query(queryConditions.whereClause);
  }
}

// Data processor class
class DataProcessor {
  static processStatsData(statsData: StatsData[]): ProcessedStats {
    // Guard against empty or undefined data
    if (!statsData || statsData.length === 0) {
      return {} as ProcessedStats;
    }

    // Sort dates to ensure correct latest/previous selection
    const sortedData = [...statsData].sort((a, b) => 
      new Date(b.asOfDate).getTime() - new Date(a.asOfDate).getTime()
    );

    const latest = sortedData[0];
    const previous = sortedData[1] || latest; // Fallback to latest if no previous exists

    return ['cashOut', 'collateralAmount', 'accrualDaily', 'accrualProjected', 'accrualRealised'].reduce((acc, key) => {
      acc[key] = {
        current: latest[key as keyof StatsData] ?? 0,
        previous: previous[key as keyof StatsData] ?? 0,
        change: (latest[key as keyof StatsData] ?? 0) - (previous[key as keyof StatsData] ?? 0),
        currentDate: latest.asOfDate || '',
        previousDate: previous.asOfDate || '',
        numDays: Math.ceil(
          (new Date(latest.asOfDate || Date.now()).getTime() - new Date(previous.asOfDate || Date.now()).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
      };
      return acc;
    }, {} as ProcessedStats);
  }
}

// Query executor class
class QueryExecutor {
  static async execute(query: string) {
    try {
      return await (await client.query({ query, format: 'JSONEachRow' })).json();
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }
}

// Simplified main function
export async function fetchMeasureTotal(measure: Measure, filterStr: string | null): Promise<any> {
  const filter = filterStr ? JSON.parse(filterStr) : null;
  const queryConditions = QueryBuilder.buildQueryConditions(filter);
  
  try {
    const query = QueryBuilder.getQuery(measure, queryConditions);
    const rawData = await QueryExecutor.execute(query);
    
    return QUERY_CONFIGS[measure].processResult(rawData);
  } catch (error) {
    console.error(`Error fetching ${measure}:`, error);
    throw error;
  }
}

export const fetchFinancingStats = fetchMeasureTotal;
