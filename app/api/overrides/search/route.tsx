import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@clickhouse/client';


const client = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://127.0.0.1:8123',
    username: process.env.CLICKHOUSE_USER || 'default',

});







export async function POST(request: NextRequest) {
    try {
        const { table, searchText } = await request.json();
        
        if (!table || !searchText) {
            return NextResponse.json({ error: 'Table and searchText are required' }, { status: 400 });
        }

        
        // Define table-specific search columns
        const tableSearchColumns = {
            ref_instruments: ['region', 'isin', 'name'],
            overrides: ['id', 'previousValue', 'newValue', 'comments'],
            trades: ['id'],
            ref_counterparty: ['id', 'name']
        };

        // Get the search columns for the specified table
        const searchColumns = tableSearchColumns[table as keyof typeof tableSearchColumns];
        console.log(searchColumns);
        if (!searchColumns) {
            return NextResponse.json({ error: 'Invalid table specified' }, { status: 400 });
        }

        // Construct the WHERE clause dynamically
        const whereClause = searchColumns.map(column => `${column} ILIKE '%${searchText}%'`).join(' OR ');

        const query = `
            SELECT *
            FROM ${table}
            WHERE ${whereClause}
            LIMIT 100
        `;
        console.log(query);

        const result = await client.query({
            query,
            format: 'JSONEachRow',
        });

        const data = await result.json();
       

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error searching table:', error);
        return NextResponse.json({ error: 'An error occurred while searching the table' }, { status: 500 });
    }
}
