import { NextResponse } from 'next/server';
import { fetchFinancingStats, Measure } from './queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const measure = searchParams.get('measure');
    const filter = searchParams.get('filter');

    
    const data = await fetchFinancingStats(measure as Measure,filter as any);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching financing stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

