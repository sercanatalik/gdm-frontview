import { createClient } from '@clickhouse/client'
import type { ClickHouseClient } from '@clickhouse/client'
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

let client: ClickHouseClient | null = null

export function getClickHouseClient() {
  if (!client) {
    return createClient({
        url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    });
  }
  return client
}


// Optional: Clean up connection when the server shuts down
process.on('SIGTERM', async () => {
  if (client) {
    await client.close()
    client = null
  }
})

interface FilterCondition {
  type: string;
  value: string[];
  operator: string;
}



export function convertToExactDate(timeNotation: string, currentDate: Date = new Date()) {
  // Validate input format
  if (!/^-?\d+[dwmy]$/.test(timeNotation)) {
    throw new Error('Invalid format. Please use formats like "-1d", "1d", "2w", "3m", or "4y"');
  }
  
  // Extract the number and unit
  const isNegative = timeNotation.startsWith('-');
  const amount = parseInt(timeNotation.replace('-', ''));
  const unit = timeNotation.slice(-1);
  
  // Get current date
  let futureDate;
  
  // Apply the appropriate date-fns function based on the unit
  // For negative values, multiply amount by -1
  const adjustedAmount = isNegative ? -amount : amount;
  
  switch (unit) {
    case 'd':
      futureDate = addDays(currentDate, adjustedAmount);
      break;
    case 'w':
      futureDate = addWeeks(currentDate, adjustedAmount);
      break;
    case 'm':
      futureDate = addMonths(currentDate, adjustedAmount);
      break;
    case 'y':
      futureDate = addYears(currentDate, adjustedAmount);
      break;
    default:
      throw new Error('Unsupported time unit. Use d (days), w (weeks), m (months), or y (years)');
  }
  
  // Format the dates
  const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');
  const formattedFutureDate = format(futureDate, 'yyyy-MM-dd');
  
  return {
    currentDate: formattedCurrentDate,
    futureDate: formattedFutureDate,
    fullDateObject: futureDate,
    description: `${amount} ${unit === 'd' ? 'day' : unit === 'w' ? 'week' : unit === 'm' ? 'month' : 'year'}${amount > 1 ? 's' : ''} from now`
  };
}


export function buildWhereCondition(filter: FilterCondition[], removeAsOfDate: boolean = false): string {
  if (!filter?.length) return '';
  
  // Check if asOfDate is present in the filter
  const hasAsOfDate = filter.some(f => f.type === 'asOfDate');  

  // Create a copy of the filter array
  let conditions = [...filter];
  
  // If asOfDate is not present and we're not removing asOfDate, add today's date
  if (!hasAsOfDate && !removeAsOfDate) {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    conditions.push({
      type: 'asOfDate',
      value: [today],
      operator: 'is'
    });
  }
  
  // Process all conditions, filtering out asOfDate if removeAsOfDate is true
  const whereConditions = conditions
      .filter(f => f.value?.length > 0)
      .filter(f => !(removeAsOfDate && f.type === 'asOfDate')) // Remove asOfDate conditions if removeAsOfDate is true
      .map(({ type, value, operator }) => {
          const values = value.map(v => `'${v}'`).join(',');
          return operator === 'is not'
              ? `${type} NOT IN (${values})`
              : `${type} IN (${values})`;
      });

  return whereConditions.length 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
}



export function generateAgGridRowGrouping(
  data: any[], 
  autoGroup: boolean = false
): {field: string, rowGroup?: boolean, enableRowGroup: boolean, hide?: boolean}[] {  
  if (!data?.length) return [];
  
  return data
    .filter((col: any) => {
      // Include String types and other categorical types that make sense for grouping
      return ['String', 'Enum8', 'Enum16', 'LowCardinality(String)', 'UUID', 'IPv4', 'IPv6', 'Date', 'DateTime','Nullable(String)'].includes(col.type) ||
        // Also include Date and DateTime types
        col.type.startsWith('Date') ||
        // Include numeric types that might represent categories
        (col.type.includes('Int') && col.name.toLowerCase().includes('id'));
    })
    .map((col: any) => {
      return {
        field: col.name,
        enableRowGroup: true,
        // Only set rowGroup and hide if autoGroup is true
        ...(autoGroup && { rowGroup: true, hide: true })
      };
    });
}


