import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@clickhouse/client';


const client = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123',
    username: process.env.CLICKHOUSE_USER || 'default',

});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const table = searchParams.get('table');
  if (!table) {
    return NextResponse.json({ error: 'Table parameter is required' }, { status: 400 });
  }

  try {
    // TODO: Implement logic to fetch Clickhouse table columns
    // This is a placeholder response
    const query = `DESC ${table} `;
    const result = await client.query({ query });
    const data = await result.json();
    

    return NextResponse.json(data.data)
  } catch (error) {
    console.error('Error fetching table columns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


