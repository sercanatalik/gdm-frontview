import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchFinancingStats } from './queries';
import { FilterSchema, type Measure } from './types';

// Validate measure parameter
const MeasureSchema = z.enum(['stats', 'cashoutbymonth', 'recenttrades', 'countrecenttrades', 'desk'] as const);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const measure = searchParams.get('measure');
    const filterStr = searchParams.get('filter');

    // Validate measure parameter
    const validatedMeasure = MeasureSchema.safeParse(measure);
    if (!validatedMeasure.success) {
      return NextResponse.json(
        { error: 'Invalid measure parameter' },
        { status: 400 }
      );
    }

    // Validate filter if present
    if (filterStr) {
      try {
        const parsedFilter = JSON.parse(filterStr);
        const validatedFilter = FilterSchema.safeParse(parsedFilter);
        if (!validatedFilter.success) {
          return NextResponse.json(
            { error: 'Invalid filter parameter' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid filter JSON' },
          { status: 400 }
        );
      }
    }

    const data = await fetchFinancingStats(validatedMeasure.data, filterStr);
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching financing stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

