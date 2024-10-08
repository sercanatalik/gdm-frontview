import { NextResponse } from 'next/server';
import { createClient } from '@clickhouse/client';

interface Instrument {
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
 * /api/instruments:
 *   get:
 *     summary: Fetch instruments
 *     description: Retrieves a list of instruments based on search criteria
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search string for instrument name, ISIN, CUSIP, SEDOL, etc.
 *     responses:
 *       200:
 *         description: Successful response with instrument data
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
    
    let query = 'SELECT * FROM fo_instrument';
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

    const instruments: Instrument[] = await result.json();

    console.log('Number of instruments found:', instruments.length);

    return NextResponse.json(instruments, { status: 200 });
  } catch (error) {
    console.error('Error querying fo_instrument:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const instrument: Instrument = await request.json();

    const query = `
      INSERT INTO fo_instrument (name, description)
      VALUES ({name:String}, {description:String})
    `;

    await client.query({
      query,
      format: 'JSONEachRow',
      
    });

    return NextResponse.json({ message: 'Instrument created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating instrument:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const updatedInstrument: Partial<Instrument> = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }

    const setClause = Object.entries(updatedInstrument)
      .map(([key, value]) => `${key} = {${key}:String}`)
      .join(', ');

    const query = `
      ALTER TABLE fo_instrument
      UPDATE ${setClause}
      WHERE name = {name:String}
    `;

    await client.query({
      query,
      format: 'JSONEachRow',
    
    });

    return NextResponse.json({ message: 'Instrument updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating instrument:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// select sum(cashout) from mv_fo_financing_trades
// select sum(cashout) from fo_risk where created_at > now() - interval '1 month'
