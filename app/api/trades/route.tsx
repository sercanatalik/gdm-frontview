import { NextResponse } from 'next/server';
import { createClient } from '@clickhouse/client';

interface Trade {
  name: string;
  description: string;
  
  // Add other properties as needed
}

const client = createClient({
  host: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
});

export async function GET(request: Request) {
  /**
 * @swagger
 * /api/trades:
 *   get:
 *     summary: Fetch trades
 *     description: Retrieves a list of trades based on search criteria
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search string for instrument name, ISIN, CUSIP, SEDOL, etc.
 *     responses:
 *       200:
 *         description: Successful response with trade data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *             
 *       500:
 *         description: Internal server error
 */ 
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM fo_trade';
    let params: Record<string, any> = {};

    if (search) {
      query += " WHERE id ILIKE "+`'%${search}%' OR name ILIKE '%${search}%' OR isin ILIKE '%${search}%' OR cusip ILIKE '%${search}%' OR sedol ILIKE '%${search}%'`;
      
    }
    
    query += ' LIMIT 100';

    console.log('Query:', query);
    console.log('Params:', params);
    
    const result = await client.query({
      query,
      format: 'JSONEachRow',
     
    });

    const trades: Trade[] = await result.json();

    console.log('Number of trades found:', trades.length);

    return NextResponse.json(trades, { status: 200 });
  } catch (error) {
    console.error('Error querying fo_trade:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const trade: Trade = await request.json();

    const query = `
      INSERT INTO fo_trade (name, description)
      VALUES ({name:String}, {description:String})
    `;

    await client.query({
      query,
      format: 'JSONEachRow',
      
    });

    return NextResponse.json({ message: 'Trade created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const updatedTrade: Partial<Trade> = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }

    const setClause = Object.entries(updatedTrade)
      .map(([key, value]) => `${key} = {${key}:String}`)
      .join(', ');

    const query = `
      ALTER TABLE fo_trade
      UPDATE ${setClause}
      WHERE name = {name:String}
    `;

    await client.query({
      query,
      format: 'JSONEachRow',
    
    });

    return NextResponse.json({ message: 'Trade updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// select sum(cashout) from mv_fo_financing_trades
// select sum(cashout) from fo_risk where created_at > now() - interval '1 month'
