import { createClient } from '@clickhouse/client'
import type { ClickHouseClient } from '@clickhouse/client'
export let client: ClickHouseClient = createClient({
  url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
})


process.on('SIGTERM', async () => {
  if (client) {
    await client.close()
    client = null as any
  }
})