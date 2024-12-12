import { createClient } from '@clickhouse/client'
import type { ClickHouseClient } from '@clickhouse/client'

let clientInstance: ClickHouseClient = createClient({
  url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
})

export const client = clientInstance

process.on('SIGTERM', async () => {
  if (clientInstance) {
    await clientInstance.close()
    clientInstance = null as any
  }
})