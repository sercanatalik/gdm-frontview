import { NextResponse } from 'next/server';
import { fetchFinancingStats, Measure } from './queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const measure = searchParams.get('measure');
      

    const data = await fetchFinancingStats(measure as Measure);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

