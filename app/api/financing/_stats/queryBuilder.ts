import type { Filter } from './types';

interface QueryConditions {
  whereClause: string;
  conditions: string[];
}

export class QueryBuilder {
  static buildQueryConditions(filter: Filter | null): QueryConditions {
    const conditions = [];
    if (filter?.desk) {
      conditions.push(`bu = '${filter.desk}'`);
    }
    return {
      conditions,
      whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    };
  }

  static getQuery(measure: string, queryConditions: QueryConditions): string {
    const config = QUERY_CONFIGS[measure];
    return measure === 'stats' 
      ? config.query(queryConditions.conditions)
      : config.query(queryConditions.whereClause);
  }
} 