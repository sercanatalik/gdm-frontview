import { createClient } from '@clickhouse/client';


export type Measure = 'cashout' | 'dailyaccrual' | 'accrual' | 'cashoutbymonth' | 'recenttrades' | 'countrecenttrades';


const client = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123',
    username: process.env.CLICKHOUSE_USER || 'default',

});


export async function fetchMeasureTotal(measure: Measure) {

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
    let result: any;
    let data: any;

    switch (measure) {
        case 'cashout':
            query = 'SELECT sum(notional_amount) AS total FROM mv_fo_financing_trades';
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            const totalCashout = data[0].total || 0;

            query = "SELECT sum(notional_amount) AS last_month_cashout FROM mv_fo_financing_trades WHERE trade_date > now() - interval '1 month'"
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            const lastMonthCashout = data[0].last_month_cashout || 0;

            let change = totalCashout - lastMonthCashout;
            data = {
                message: 'Cashout financing information',
                amount: totalCashout,
                lastMonthAmount: lastMonthCashout,
                monthOnMonthChange: change
            };

            return data;


        case 'dailyaccrual':
            query = 'SELECT sum(accrual_daily) AS total FROM fo_risk';
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

        case 'cashoutbymonth':
            query = `
                SELECT
                    formatDateTime(toStartOfMonth(trade_date), '%b') AS month,
                    round(sum(notional_amount) / 1000000, 2) AS monthly_cashout,
                    round(sum(sum(notional_amount)) OVER (ORDER BY toStartOfMonth(trade_date)) / 1000000, 2) AS cumulative_cashout
                FROM mv_fo_financing_trades
                GROUP BY toStartOfMonth(trade_date)
                ORDER BY toStartOfMonth(trade_date)
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
                    i.sector as sector,
                    SUM(notional_amount) as notional,
                    MAX(trade_date) as latest_trade_date
                FROM mv_fo_financing_trades 
                GROUP BY counterparty, sector
                ORDER BY latest_trade_date DESC 
                LIMIT 150
            `;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return {
                message: 'Recent trades grouped by counter party',
                data: data
            };

        case 'countrecenttrades':
            query = `
                SELECT 
                    COUNT(*) as count
                FROM mv_fo_financing_trades 
                WHERE trade_date >= now() - INTERVAL 30 DAY
            `;
            result = await client.query({
                query,
                format: 'JSONEachRow',
            });
            data = await result.json();
            return {
                message: 'Count of trades in the last 30 days',
                data: data[0].count
            };
        

        case 'accrual':
            // TODO: Implement accrual query
            throw new Error('Accrual measure not implemented yet');
        default:
            throw new Error(`Invalid measure: ${measure}`);
    }

    // ... handle the result
}

export function fetchFinancingStats(measure: Measure) {
    const data = Promise.resolve(fetchMeasureTotal(measure));
    return data;
    // Function implementation
}
