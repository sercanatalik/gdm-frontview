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

// select sum(cashout) from mv_fo_financing_trades
// select sum(cashout) from fo_risk where created_at > now() - interval '1 month'
