import { DataProcessor } from './dataProcessor';

type QueryConditions = string[];

interface StatsQueryResult {
  asOfDate: Date;
  cashOut: number;
  projectedCashOut: number;
  notional: number;
  realisedCashOut: number;
}

const buildStatsQuery = (conditions: QueryConditions): string => {
  const whereClause = conditions.length 
    ? `AND ${conditions.join(' AND ')}` 
    : '';

  return `
    WITH 
      (SELECT MAX(asOfDate) FROM risk_f_mv FINAL) as latest_date,
      (SELECT dateAdd(day, -1, MAX(asOfDate)) FROM risk_f_mv FINAL) as prev_date
    SELECT 
      asOfDate,
      SUM(cashOut) as cashOut,
      SUM(projectedCashOut) as projectedCashOut,
      SUM(notional) as notional,
      SUM(realisedCashOut) as realisedCashOut
    FROM risk_f_mv FINAL 
    WHERE asOfDate IN (latest_date, prev_date) 
    ${whereClause}
    GROUP BY asOfDate`;
};

export const QUERY_CONFIGS = {
  stats: {
    query: buildStatsQuery,
    processResult: DataProcessor.processStatsData
  },
  // ... other configs remain the same ...
} as const; 