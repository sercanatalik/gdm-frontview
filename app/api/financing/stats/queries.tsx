import { createClient, QueryResult } from '@clickhouse/client';


export type Measure = 'stats' |'cashoutbymonth' | 'recenttrades' | 'countrecenttrades'  | 'desk' | 'trader' |'portfolio' | 'book' |'counterparty' ;


const client = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123',
    username: process.env.CLICKHOUSE_USER || 'default',

});



export async function fetchMeasureTotal(measure: Measure, filter: any) {
    /**
     * @swagger
     * /api/financing/stats:
     *   get:
     *     summary: Fetch financing statistics
     *     description: Retrieves various financing statistics based on the specified measure
     *     parameters:
     *       - in: query
     *         name: measure
     *         required: true
     *         schema:
     *           type: string
     *           enum: [cashout, dailyaccrual, accrual, cashoutbymonth, recenttrades, countrecenttrades]
     *         description: The type of financing statistic to retrieve
     *     responses:
     *       200:
     *         description: Successful response with financing statistics
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *       400:
     *         description: Bad request, invalid measure provided
     *       500:
     *         description: Internal server error
     */

    let query: string;
    let result: QueryResult;
    let data: Record<string, unknown>;
    let whereClause = '';

    // Parse filter if it's not null, otherwise set it to an empty object
    filter = filter ? JSON.parse(filter) : {};
    
    // Build WHERE clause
    let conditions = [];
    if (filter.desk) {
        conditions.push(`hmsDesk = '${filter.desk}'`);
    }
 

    switch (measure) {
        case 'stats':
            const _stats = ['notionalCcy', 'accrualDaily', 'accrualProjected', 'accrualPast']

            // Get both current and last month's data in a single query
            query = `
                WITH 
                    (SELECT MAX(asOfDate) FROM risk_view FINAL) as latest_date,
                    (SELECT dateAdd(day, -1, MAX(asOfDate)) FROM risk_view FINAL) as prev_date
                SELECT 
                    asOfDate,
                    ${_stats.map(stat => `SUM(${stat}) as ${stat}`).join(', ')}
                FROM risk_view FINAL 
                WHERE asOfDate IN (latest_date, prev_date) AND ${conditions.join('')}
                GROUP BY asOfDate`;

            console.log(query);
            let statsResult = await client.query({ query, format: 'JSONEachRow' });
            
            let statsData = await statsResult.json()
            

            // Organize data into current and previous periods
            const latest = statsData.find(d => new Date(d.asOfDate) >= new Date(Math.max(...statsData.map(d => new Date(d.asOfDate))))) || {};
            const previous = statsData.find(d => new Date(d.asOfDate) <= new Date(Math.min(...statsData.map(d => new Date(d.asOfDate))))) || {};

            // Calculate stats with changes
            const statsWithChanges = _stats.reduce((acc, key) => {
                acc[key] = {
                    current: latest[key] || 0,
                    previous: previous[key] || 0,
                    change: (latest[key] || 0) - (previous[key] || 0),
                    currentDate: latest.asOfDate,
                    previousDate: previous.asOfDate,
                    numDays: Math.ceil((new Date(latest.asOfDate).getTime() - new Date(previous.asOfDate).getTime()) / (1000 * 60 * 60 * 24)),
                   
                };
                return acc;
            }, {});

            return statsWithChanges;


        case 'desk':
            query = `SELECT DISTINCT hmsDesk FROM risk_view FINAL`;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return data;

        case 'cashoutbymonth':
            query = `
                SELECT
                    formatDateTime(toStartOfMonth(trade_dt), '%b') AS month,
                    round(sum(notionalCcy) / 1000000, 2) AS monthlyCashout,
                    round(sum(sum(notionalCcy)) OVER (ORDER BY toStartOfMonth(trade_dt)) / 1000000, 2) AS cumulativeCashout
                FROM risk_view FINAL ${whereClause}
                GROUP BY toStartOfMonth(trade_dt)
                ORDER BY toStartOfMonth(trade_dt)
            `;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return {
                message: 'Cumulative cashout by month (in millions)',
                data: data
            };

        case 'recenttrades':
            query = `
                SELECT 
                    counterparty,
                    cpSector as sector,
                    SUM(notionalCcy) / 1e6 as notional,
                    MAX(trade_dt) as latest_trade_date
                FROM risk_view ${whereClause}  
                GROUP BY counterparty, sector
                ORDER BY latest_trade_date DESC 
                LIMIT 150
            `;
            // console.log(query);
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return {
                message: 'Recent trades grouped by counter party (notional in millions)',
                data: data
            };

        case 'countrecenttrades':
            query = `SELECT COUNT(*) FROM risk_view ${whereClause}`;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return data;

       
    }

    // ... handle the result
}

export function fetchFinancingStats(measure: Measure, filter: any) {
    const data = Promise.resolve(fetchMeasureTotal(measure, filter));
    return data;
    // Function implementation
}
