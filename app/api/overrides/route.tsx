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


// id	String					
// 2	type	LowCardinality(String)					
// 3	override	String					
// 4	version	UInt64					
// 5	updatedAt	DateTime					
// 6	updatedBy	String					
// 7	summary	String

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, type, newValue, previousValue, updatedBy, comments } = body;

        if (!id || !type) {
            return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });
        }

        // Update version query to use proper parameter syntax
        const versionQuery = `SELECT coalesce(max(version), 0) as current_version FROM overrides WHERE id = '${id}'`;
        const versionResult = await client.query({
            query: versionQuery,
            format: 'JSONEachRow'
        });
        const versionData = await versionResult.json();
        const newVersion = Number(versionData[0].current_version) + 1;
        // console.log('newVersion', newVersion);

        // Update insert query to use proper value escaping
        const query = `
            INSERT INTO overrides (
                id,
                type,
                newValue,
                previousValue,
                version,
                updatedAt,
                updatedBy,
                comments
            ) VALUES (
                '${id}',
                '${type}',
                '${newValue || ''}',
                '${previousValue || ''}',
                ${newVersion},
                now(),
                '${updatedBy || ''}',
                '${comments || ''}'
            )
        `;

        await client.exec({
            query,
        });  // Changed from client.query to client.exec and removed format

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error inserting into ClickHouse:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
