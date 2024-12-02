import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@clickhouse/client';

// New file for types and schema
export interface BasketDefinition {
    id: string;
    sym: string;
    weight: number;
    category: string;
    name: string;
    model: string;
    description: string;
    ticker: string;
    updatedAt: string;
    asofDate: string;
}

export const basketSchema = {
    id: 'string',
    sym: 'string',
    weight: 'float',
    category: 'string',
    name: 'string',
    model: 'string',
    description: 'string',
    ticker: 'string',
    updatedAt: 'datetime',
    asofDate: 'date',
} as const;


const clickhouseClient = createClient({
    host: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
});


// Helper functions
const formatValue = (value: any, column: string): any => {
    const type = basketSchema[column as keyof typeof basketSchema];
    if (value === null || value === undefined) {
        if (type === 'date') {
            return 'toDate(\'1970-01-01\')';
        }
      
        if (type === 'string') {
            return '\'\'';
        }
        if (type === 'float') {
            return '0';
        }
    }
    
    if (type === 'string') {
        return `'${value.replace(/'/g, "\\'")}'`;
    } else if (type === 'float') {
        return parseFloat(value).toString();
    } else if (type === 'date' && typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format for ${column}: ${value}`);
        }
        return `toDate('${date.toISOString().split('T')[0]}')`;
    } else if (type === 'datetime' && typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid datetime format for ${column}: ${value}`);
        }
        return `toDateTime('${date.toISOString().replace('T', ' ').split('.')[0]}')`;
    }
    
    return String(value);
};

const buildBatchInsertQuery = (records: Partial<BasketDefinition>[]): string => {
    if (records.length === 0) return '';
    
    const columns = Object.keys(basketSchema);
    
    const values = records.map(record => {
        const recordWithId = { 
            ...record, 
            id: record.id || randomUUID(),
            updatedAt: new Date().toISOString() ,
            asofDate:  new Date().toISOString()
        };
        return `(${columns
            .map(column => formatValue(recordWithId[column as keyof BasketDefinition], column))
            .join(', ')})`;
    }).join(',\n        ');
    
    return `INSERT INTO ref_basketdef (${columns.join(', ')}) VALUES ${values}`;
};

// Error handler
const handleApiError = (error: unknown, operation: string) => {
    console.error(`Error ${operation}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
        { error: `Failed to ${operation}`, details: errorMessage },
        { status: 500 }
    );
};

// Route handlers
export async function GET() {
    try {
        const resultSet = await clickhouseClient.query({
            query: 'SELECT * FROM ref_basketdef final',
            format: 'JSONEachRow',
        });

        const data = await resultSet.json();
        return NextResponse.json({ data });
    } catch (error) {
        return handleApiError(error, 'fetch basket definitions');
    }
}

export async function POST(request: Request) {
    try {
        const { data: insertData } = await request.json();
        
        if (!Array.isArray(insertData)) {
            return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });
        }
        
        // Get distinct names from insertData
        const distinctNames = Array.from(new Set(insertData.map(item => item.name)));
     
        
        // Delete existing records with names in distinctNames
        if (distinctNames.length > 0) {
            const deleteQuery = `ALTER TABLE ref_basketdef DELETE WHERE name IN (${distinctNames.map(name => `'${name.replace(/'/g, "\\'")}'`).join(', ')})`;
            console.log(deleteQuery);
            await clickhouseClient.exec({ query: deleteQuery });
        }
        
        // Process in batches of 1000 records
        const BATCH_SIZE = 1000;
        for (let i = 0; i < insertData.length; i += BATCH_SIZE) {
            const batch = insertData.slice(i, i + BATCH_SIZE);
            const query = buildBatchInsertQuery(batch);
            console.log(query);
            if (query) {
                await clickhouseClient.exec({ query });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully inserted ${insertData.length} basket definitions` 
        });
    } catch (error) {
        return handleApiError(error, 'insert basket definition');
    }
}


