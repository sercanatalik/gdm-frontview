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
