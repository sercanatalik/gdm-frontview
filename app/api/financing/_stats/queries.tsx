import { getClickHouseClient } from '@/lib/clickhouse-wrap';
import { QUERY_CONFIGS } from './queryConfigs';
import { DataProcessor } from './dataProcessor';
import { FilterSchema, type Measure, type Filter, type QueryResult } from './types';
import { QueryBuilder } from './queryBuilder';

const client = getClickHouseClient();

class QueryError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'QueryError';
  }
}

class QueryExecutor {
  static async execute<T>(query: string): Promise<QueryResult<T>> {
    if (!query.trim()) {
      throw new QueryError('Query cannot be empty');
    }

    try {
      const result = await client.query({ 
        query, 
        format: 'JSONEachRow' 
      }).then(res => res.json());
      
      return { data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown query error';
      throw new QueryError(`Query execution failed: ${errorMessage}`, error);
    }
  }
}

export async function fetchMeasureTotal<T>(
  measure: Measure, 
  filterStr: string | null
): Promise<T> { 
  try {
    if (!QUERY_CONFIGS[measure]) {
      throw new Error(`Invalid measure: ${measure}`);
    }

    const filter = filterStr 
      ? FilterSchema.parse(JSON.parse(filterStr)) 
      : null;
      
    const queryConditions = QueryBuilder.buildQueryConditions(filter);
    const query = QueryBuilder.getQuery(measure, queryConditions);
    
    const { data } = await QueryExecutor.execute<T>(query);
    return QUERY_CONFIGS[measure].processResult(data);
  } catch (error) {
    if (error instanceof QueryError) {
      throw error;
    }
    throw new Error(`Failed to fetch ${measure}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const fetchFinancingStats = fetchMeasureTotal;
