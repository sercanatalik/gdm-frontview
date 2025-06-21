import { NextResponse } from 'next/server';

export async function handleApiResponse<T>(
  query: string, 
  options: {
    params?: Record<string, unknown>;
    useCache?: boolean;
    ttl?: number;
  } = {}
): Promise<NextResponse> {
  try {
    const { clickhouse } = await import('@/lib/clickhouse-wrap');
    const result = await clickhouse.query<T>(query, {
      useCache: options.useCache ?? true,
      ttl: options.ttl,
      params: options.params,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
