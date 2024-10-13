import { createClient } from '@clickhouse/client';

async function createMaterializedView() {
    const client = createClient({
        host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    });

    try {
        // Assuming you have tables: table1, table2, and table3
        const query = `
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_fo_financing_trades
    ENGINE = ReplacingMergeTree()
    ORDER BY (t.id)
    POPULATE
    AS SELECT
        t.*,
        h.*,
        c.*,
        i.*
    FROM
        fo_trades_trs t
    JOIN fo_hms h ON t.book = h.book
    JOIN fo_counterparty c ON t.counterparty = c.name
    JOIN fo_instrument i ON t.underlying_asset = i.isin
    `;

        await client.exec({ query });


        console.log('Materialized view created successfully');
    } catch (error) {
        console.error('Error creating materialized view:', error);
    } finally {
        await client.close();
    }
}

createMaterializedView();

async function runSelectQuery() {
    const client = createClient({
        url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    });

    try {
        const query = `
     SELECT *,max(i.updated_at) OVER () as latestUpdate  FROM mv_fo_financing_trades
    `;
        const resultSet = await client.query({ query });
        interface RiskResults {
            updated_at: string;
            data: any[];
            meta: any[];
            rows: number;
            // Add other properties as needed
        }
        const results = await resultSet.json() as { data: Array<{ latestUpdate: string }> };
        const latestUpdate = results.data[0].latestUpdate;

        return {
            data: results.data,
            meta: 'meta' in results ? results.meta : undefined,
            latestUpdate: latestUpdate
        };
    } catch (error) {
        console.error('Error running SELECT query:', error);
        throw error;
    } finally {
        await client.close();
    }
}

/**
 * @swagger
 * /api/financing/risk:
 *   get:
 *     summary: Retrieve financing trade data
 *     description: Fetches data from the mv_fo_financing_trades materialized view in ClickHouse and includes the latest instrument update timestamp
 *     responses:
 *       200:
 *         description: Successful response with trade data and latest instrument update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       // Add properties based on your actual data structure
 *                       id:
 *                         type: string
 *                       // ... other properties ...
 *                 meta:
 *                   type: object
 *                   // Add meta properties
 *                 latestInstrumentUpdate:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function GET() {
    try {
        const results = await runSelectQuery();
        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
