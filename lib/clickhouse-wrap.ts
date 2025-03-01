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
  const conditions = filter
      .filter(f => f.value?.length > 0)
      .map(({ type, value, operator }) => {
          const values = value.map(v => `'${v}'`).join(',');
          return operator === 'is not'
              ? `\`${type}\` NOT IN (${values})`
              : `\`${type}\` IN (${values})`;
      });

  return conditions.length 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
}