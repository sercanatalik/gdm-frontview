import { z } from 'zod';

export type Measure = 'stats' | 'cashoutbymonth' | 'recenttrades' | 'countrecenttrades' | 'desk';

export interface Filter {
  desk?: string;
  [key: string]: unknown;
}

export interface StatsData {
  asOfDate: string;
  cashOut: number;
  collateralAmount: number;
  accrualDaily: number;
  accrualProjected: number;
  accrualRealised: number;
}

export interface ProcessedStats {
  [key: string]: {
    current: number;
    previous: number;
    change: number;
    currentDate: string;
    previousDate: string;
    numDays: number;
  };
}

export interface QueryConditions {
  whereClause: string;
  conditions: string[];
}

export interface QueryResult<T> {
  message?: string;
  data: T;
}

// Zod schema for runtime type validation
export const FilterSchema = z.object({
  desk: z.string().optional()
}); 