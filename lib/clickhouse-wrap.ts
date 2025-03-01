import { createClient } from '@clickhouse/client'
import type { ClickHouseClient } from '@clickhouse/client'

let client: ClickHouseClient | null = null

export function getClickHouseClient() {
  if (!client) {
    return createClient({
        url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    });
  }
  return client
}



// Optional: Clean up connection when the server shuts down
process.on('SIGTERM', async () => {
  if (client) {
    await client.close()
    client = null
  }
})


interface FilterCondition {
  type: string;
  value: string[];
  operator: string;
}

export function buildWhereCondition(filter: FilterCondition[]): string {
  if (!filter?.length) return '';
  
  // Check if asOfDate is present in the filter
  const hasAsOfDate = filter.some(f => f.type === 'asOfDate');
  
  // Create a copy of the filter array
  let conditions = [...filter];
  
  // If asOfDate is not present, add today's date
  if (!hasAsOfDate) {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    conditions.push({
      type: 'asOfDate',
      value: [today],
      operator: 'is'
    });
  }

  // Process all conditions
  const whereConditions = conditions
      .filter(f => f.value?.length > 0)
      .map(({ type, value, operator }) => {
          const values = value.map(v => `'${v}'`).join(',');
          return operator === 'is not'
              ? `${type} NOT IN (${values})`
              : `${type} IN (${values})`;
      });

  return whereConditions.length 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
}