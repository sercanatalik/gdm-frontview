import { createClient, QueryResult } from '@clickhouse/client';


export type Measure = 'cashout' | 'dailyaccrual' | 'accrual' | 'projectedaccrual' |'cashoutbymonth' | 'recenttrades' | 'countrecenttrades' | 'notional' | 'desk' | 'trader' |'portfolio' | 'book' |'counterparty' ;


const client = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123',
    username: process.env.CLICKHOUSE_USER || 'default',

});


// 
// totalNotionalAmount	39539527.03
// totalDailyAccrual	4121.18
// totalCashout	819598.01
// totalEad	15815810.81
// totalProjectedAccrual	733577.18
// totalPastAccrual	431502.32
// 

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
    
    // Add WHERE clause if filter.desk is present
    if (filter.desk) {
        whereClause = ` WHERE hmsDesk = '${filter.desk}'`;
    }
    
    switch (measure) {
        case 'cashout':
            query = `SELECT sum(totalCashout) AS total FROM risk_agg FINAL${whereClause}`;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            
            data = {
                message: 'Cashout financing information',
                amount: data[0].total || 0,
                lastMonthAmount: 0,
                monthOnMonthChange: 0
            };

            return data;


        case 'notional':
            query = `SELECT sum(totalNotionalAmount) AS total FROM risk_agg FINAL${whereClause}`;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json() as { total: number }[];
            data = {
                message: 'notional financing information',
                amount: data[0]?.total || 0,
                lastMonthAmount: 0,
                monthOnMonthChange: 0
            };

            return data;
    
        
        case 'dailyaccrual':
            query = `SELECT sum(totalDailyAccrual) AS total FROM risk_agg FINAL${whereClause}`;
            console.log(query);
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            const dailyAccrual = data[0].total || 0;


            // const lastMonthDailyAccrual = data[0].last_month_daily_accrual || 0;

            // change  = dailyAccrual - lastMonthDailyAccrual;
            data = {
                message: 'Accrual  financing information',
                amount: dailyAccrual,
                lastMonthAmount: 0,
                monthOnMonthChange: 0
            };

            return data;

        case 'projectedaccrual':
            query = `SELECT sum(totalProjectedAccrual) AS total FROM risk_agg FINAL${whereClause}`;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json(); 
            console.log(data);
            data = {
                message: 'Accrual  financing information',
                amount: data[0].total || 0,
                lastMonthAmount: 0,
                monthOnMonthChange: 0
            };

            return data;

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
                    formatDateTime(toStartOfMonth(tradeDt), '%b') AS month,
                    round(sum(notionalAmount) / 1000000, 2) AS monthlyCashout,
                    round(sum(sum(notionalAmount)) OVER (ORDER BY toStartOfMonth(tradeDt)) / 1000000, 2) AS cumulativeCashout
                FROM risk_view ${whereClause}
                GROUP BY toStartOfMonth(tradeDt)
                ORDER BY toStartOfMonth(tradeDt)
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
                    SUM(notionalAmount) / 1e6 as notional,
                    MAX(tradeDt) as latest_trade_date
                FROM risk_view ${whereClause}  
                GROUP BY counterparty, sector
                ORDER BY latest_trade_date DESC 
                LIMIT 150
            `;
            console.log(query);
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return {
                message: 'Recent trades grouped by counter party (notional in millions)',
                data: data
            };

       
    }

    // ... handle the result
}

export function fetchFinancingStats(measure: Measure, filter: any) {
    const data = Promise.resolve(fetchMeasureTotal(measure, filter));
    return data;
    // Function implementation
}
