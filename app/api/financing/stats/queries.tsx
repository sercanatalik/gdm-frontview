import { client } from '@/lib/clickhouse-wrap';

// Types
export type Measure = 'stats' | 'cashoutbymonth' | 'recenttrades' | 'countrecenttrades' | 'desk';

interface Filter {
  desk?: string;
  [key: string]: unknown;
}

interface StatsData {
  asOfDate: string;
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

// Query builder class
class QueryBuilder {
  private static readonly QUERIES = {
    stats: (conditions: string[]) => `
      WITH 
        (SELECT MAX(r.asOfDate) FROM risk_f_mv FINAL) as latest_date,
        (SELECT dateAdd(day, -1, MAX(r.asOfDate)) FROM risk_f_mv FINAL) as prev_date
      SELECT 
        r.asOfDate,
        SUM(collateralAmount) as collateralAmount,
        SUM(accrualDaily) as accrualDaily,
        SUM(accrualProjected) as accrualProjected,
        SUM(accrualRealised) as accrualRealised
      FROM risk_f_mv FINAL 
      WHERE r.asOfDate IN (latest_date, prev_date) 
      ${conditions.length ? 'AND ' + conditions.join(' AND ') : ''}
      GROUP BY r.asOfDate`,

    desk: () => `SELECT DISTINCT hmsbook_desk FROM risk_f_mv FINAL`,

    cashoutbymonth: (whereClause: string) => `
      SELECT
        formatDateTime(toStartOfMonth(tradeDt), '%b') AS month,
        round(sum(fundingAmount) / 1000000, 2) AS monthlyCashout,
        round(sum(sum(fundingAmount)) OVER (ORDER BY toStartOfMonth(tradeDt)) / 1000000, 2) AS cumulativeCashout
      FROM risk_f_mv FINAL ${whereClause}
      GROUP BY toStartOfMonth(tradeDt)
      ORDER BY toStartOfMonth(tradeDt)
    `,

    recenttrades: (whereClause: string) => `
      SELECT 
        counterparty_name as counterparty,
        counterparty_sector as sector,
        SUM(fundingAmount) / 1e6 as notional,
        MAX(tradeDt) as latest_trade_date
      FROM risk_f_mv ${whereClause}  
      GROUP BY counterparty_name, counterparty_sector
      ORDER BY latest_trade_date DESC 
      LIMIT 150
    `,

    countrecenttrades: (whereClause: string) => `
      SELECT COUNT(*) FROM risk_f_mv ${whereClause}
    `
  };

  static getQuery(measure: Measure, param: string[] | string): string {
    return this.QUERIES[measure](param);
  }
}

// Data processor class
class DataProcessor {
  static processStatsData(statsData: StatsData[]): ProcessedStats {
    const latest = statsData.find(d => 
      new Date(d.asOfDate) >= new Date(Math.max(...statsData.map(d => new Date(d.asOfDate))))) || {};
    const previous = statsData.find(d => 
      new Date(d.asOfDate) <= new Date(Math.min(...statsData.map(d => new Date(d.asOfDate))))) || {};

    return ['fundingAmount', 'accrualDaily', 'accrualProjected', 'accrualRealised'].reduce((acc, key) => {
      acc[key] = {
        current: latest[key as keyof StatsData] || 0,
        previous: previous[key as keyof StatsData] || 0,
        change: (latest[key as keyof StatsData] || 0) - (previous[key as keyof StatsData] || 0),
        currentDate: latest.asOfDate,
        previousDate: previous.asOfDate,
        numDays: Math.ceil(
          (new Date(latest.asOfDate).getTime() - new Date(previous.asOfDate).getTime()) / 
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

// Measure handlers
const measureHandlers = {
  stats: async (conditions: string[]) => {
    console.log(QueryBuilder.getQuery('stats', conditions))
    const data = await QueryExecutor.execute(QueryBuilder.getQuery('stats', conditions));
    return DataProcessor.processStatsData(data);
  },
  desk: async (whereClause: string) => 
    QueryExecutor.execute(QueryBuilder.getQuery('desk', whereClause)),
  cashoutbymonth: async (whereClause: string) => ({
    message: 'Cumulative cashout by month (in millions)',
    data: await QueryExecutor.execute(QueryBuilder.getQuery('cashoutbymonth', whereClause))
  }),
  recenttrades: async (whereClause: string) => ({
    message: 'Recent trades grouped by counter party (notional in millions)',
    data: await QueryExecutor.execute(QueryBuilder.getQuery('recenttrades', whereClause))
  }),
  countrecenttrades: async (whereClause: string) => 
    QueryExecutor.execute(QueryBuilder.getQuery('countrecenttrades', whereClause))
};

// Main function
export async function fetchMeasureTotal(measure: Measure, filter: string | null) {
  const parsedFilter: Filter = filter ? JSON.parse(filter) : {};
  const conditions = parsedFilter.desk ? [`hmsbook_desk = '${parsedFilter.desk}'`] : [];
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const handler = measureHandlers[measure];
  if (!handler) throw new Error(`Unsupported measure: ${measure}`);
  
  return measure === 'stats' ? 
    await handler(conditions) : 
    await handler(whereClause);
}

export const fetchFinancingStats = fetchMeasureTotal;
