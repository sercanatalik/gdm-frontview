import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@clickhouse/client';


const client = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123',
    username: process.env.CLICKHOUSE_USER || 'default',

});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('table');
    const id = searchParams.get('id');

    if (!tableName || !id) {
        return NextResponse.json({ error: 'Table name and ID are required' }, { status: 400 });
    }

    try {
        const query = `SELECT * FROM ${tableName} WHERE id = '${id}'`;
        const result = await client.query({
            query,
            format: 'JSONEachRow',
        });

        const data = await result.json();

        if (data.length === 0) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error('Error querying ClickHouse:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
