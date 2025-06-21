import { createClient, type ClickHouseClient, type QueryParams } from '@clickhouse/client';
import Redis, { type Redis as RedisType } from 'ioredis';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

// Types
type QueryOptions<T = unknown> = {
  /** Whether to use Redis cache (default: true) */
  useCache?: boolean;
  /** Cache TTL in seconds (default: 300s / 5 minutes) */
  ttl?: number;
  /** Query parameters */
  params?: Record<string, unknown>;
  /** Custom cache key prefix */
  cacheKeyPrefix?: string;
  /** Callback for cache misses */
  onCacheMiss?: (key: string) => void;
  /** Callback for cache hits */
  onCacheHit?: (key: string) => void;
};

type ClientConfig = {
  clickhouse: {
    url: string;
    username: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
};

// Default configuration
const DEFAULT_CONFIG: ClientConfig = {
  clickhouse: {
    url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
};

/**
 * ClickHouse client with Redis caching capabilities
 */
class ClickHouseWrapper {
  private static instance: ClickHouseWrapper;
  private clickhouseClient: ClickHouseClient | null = null;
  private redisClient: RedisType | null = null;
  private config: ClientConfig;
  private isInitialized = false;

  private constructor(config: Partial<ClientConfig> = {}) {
    this.config = {
      clickhouse: { ...DEFAULT_CONFIG.clickhouse, ...(config.clickhouse || {}) },
      redis: { ...DEFAULT_CONFIG.redis, ...(config.redis || {}) },
    };
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(config?: Partial<ClientConfig>): ClickHouseWrapper {
    if (!ClickHouseWrapper.instance) {
      ClickHouseWrapper.instance = new ClickHouseWrapper(config);
    }
    return ClickHouseWrapper.instance;
  }

  /**
   * Initialize clients
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize ClickHouse client
      this.clickhouseClient = createClient({
        url: this.config.clickhouse.url,
        username: this.config.clickhouse.username,
        password: this.config.clickhouse.password,
      });

      // Initialize Redis client
      this.redisClient = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        db: this.config.redis.db,
        lazyConnect: true,
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 5000);
          console.warn(`Redis reconnecting in ${delay}ms`);
          return delay;
        },
      });

      // Test connections
      await Promise.all([
        this.clickhouseClient.ping(),
        this.redisClient.ping(),
      ]);

      this.isInitialized = true;
      console.log('ClickHouse and Redis clients initialized successfully');
    } catch (error) {
      console.error('Failed to initialize clients:', error);
      throw error;
    }
  }

  /**
   * Execute a query with optional Redis caching
   */
  public async query<T = unknown>(
    query: string,
    options: QueryOptions<T> = {}
  ): Promise<T[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      useCache = true,
      ttl = 300,
      params,
      cacheKeyPrefix = 'ch',
      onCacheMiss,
      onCacheHit,
    } = options;

    const cacheKey = this.generateCacheKey(query, params, cacheKeyPrefix);

    // Try to get from cache if enabled
    if (useCache && this.redisClient) {
      try {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          onCacheHit?.(cacheKey);
          console.log('Cache hit for:', cacheKey);
          return JSON.parse(cached) as T[];
        }
        onCacheMiss?.(cacheKey);
      } catch (error) {
        console.error('Redis cache read error:', error);
        // Continue with the database query if cache read fails
      }
    }

    // Execute the query against ClickHouse
    if (!this.clickhouseClient) {
      throw new Error('ClickHouse client is not initialized');
    }

    const queryParams: QueryParams = {
      query,
      format: 'JSONEachRow',
      ...(params ? { query_params: params } : {}),
    };

    const result = await this.clickhouseClient.query(queryParams);
    const jsonResult = await result.json<T>();

    // Cache the result if enabled
    if (useCache && this.redisClient) {
      try {
        await this.redisClient.setex(cacheKey, ttl, JSON.stringify(jsonResult));
      } catch (error) {
        console.error('Redis cache write error:', error);
        // Don't fail the request if cache write fails
      }
    }

    // Ensure we always return an array
    return Array.isArray(jsonResult) ? jsonResult : [jsonResult as unknown as T];
  }

  /**
   * Generate a consistent cache key
   */
  private generateCacheKey(
    query: string,
    params?: Record<string, unknown>,
    prefix: string = 'ch'
  ): string {
    const queryHash = Buffer.from(query).toString('base64');
    const key = `${prefix}:${queryHash}`;
    
    if (!params || Object.keys(params).length === 0) {
      return key;
    }
    
    // Sort params to ensure consistent key generation
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    
    return `${key}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Clear cache for a specific key or pattern
   */
  public async clearCache(pattern: string = 'ch:*'): Promise<void> {
    if (!this.redisClient) return;
    
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    try {
      if (this.clickhouseClient) {
        await this.clickhouseClient.close();
        this.clickhouseClient = null;
      }
      
      if (this.redisClient) {
        await this.redisClient.quit();
        this.redisClient = null;
      }
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const clickhouse = ClickHouseWrapper.getInstance();

// Handle process termination
process.on('SIGTERM', async () => {
  try {
    await clickhouse.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
});

// Example usage:
// const result = await clickhouse.query<YourType>('SELECT * FROM table', {
//   useCache: true,
//   ttl: 300, // 5 minutes
//   params: { param1: 'value1' },
//   cacheKeyPrefix: 'custom',
//   onCacheHit: (key) => console.log(`Cache hit for ${key}`),
//   onCacheMiss: (key) => console.log(`Cache miss for ${key}`),
// });

export function convertToExactDate(timeNotation: string, currentDate: Date = new Date()): string {
  // Validate input format
  if (!/^-?\d+[dwmy]$/.test(timeNotation)) {
    throw new Error('Invalid format. Please use formats like "-1d", "1d", "2w", "3m", or "4y"');
  }
  
  // Extract the number and unit
  const isNegative = timeNotation.startsWith('-');
  const number = parseInt(timeNotation.replace(/[^0-9-]/g, ''));
  const unit = timeNotation.slice(-1);
  
  let resultDate: Date;
  
  // Calculate the new date based on the unit
  switch (unit) {
    case 'd':
      resultDate = addDays(currentDate, number);
      break;
    case 'w':
      resultDate = addWeeks(currentDate, number);
      break;
    case 'm':
      resultDate = addMonths(currentDate, number);
      break;
    case 'y':
      resultDate = addYears(currentDate, number);
      break;
    default:
      throw new Error('Invalid time unit. Use d (days), w (weeks), m (months), or y (years)');
  }
  
  // Format the date as YYYY-MM-DD
  return format(resultDate, 'yyyy-MM-dd');
}

// Export types for external use
export interface FilterCondition {
  type: string;
  value: string[];
  operator: string;
}

export function getClickHouseClient(): ClickHouseClient | null {
  const instance = ClickHouseWrapper.getInstance();
  if (!instance['clickhouseClient']) {
    instance.initialize();
    return null;
  }
  return instance['clickhouseClient'];
}

export function buildWhereCondition(filter: FilterCondition[], removeAsOfDate: boolean = false, orderBy: string = ''): string {
  if (!filter?.length) return orderBy ? `ORDER BY ${orderBy}` : '';
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
          // Handle comparison operators (>=, >, <=, <)
          if (['>=', '>', '<=', '<'].includes(operator)) {
              return `${type} ${operator} '${value}'`;
          }
          
          // Handle IN/NOT IN operators (is/is not)
          const values = value.map(v => `'${v}'`).join(',');
          return operator === 'is not'
              ? `${type} NOT IN (${values})`
              : `${type} IN (${values})`;
      });

  const whereClause = whereConditions.length 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
      
  return orderBy 
      ? `${whereClause} ORDER BY ${orderBy}` 
      : whereClause;
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

export function formatAsCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function generateAgGridValueColumns(
  data: any[], 
  autoValue: boolean = false,
  currencyFields: string[] = []
): {field: string, enableValue: boolean, aggFunc?: string, hide?: boolean, valueFormatter?: (params: any) => string, cellDataType: string}[] {
  if (!data?.length) return [];
  
  return data
    .filter((col: any) => {
      // Include string types for 'first' aggregation
      return ['String', 'Enum8', 'Enum16', 'LowCardinality(String)', 'UUID', 'IPv4', 'IPv6', 'Nullable(String)'].includes(col.type) ||
        // Include numeric types that make sense for value columns
        ['Int', 'Float', 'Decimal'].includes(col.type) ||
        col.type.includes('Int') || 
        col.type.includes('Float') ||
        col.type.includes('Decimal') ||
        // Include Date and DateTime types
        col.type.startsWith('Date') ||
        // Include numeric types that might represent categories
        (col.type.includes('Int') && col.name.toLowerCase().includes('id'));
    })
    .map((col: any) => {    
      // Determine if it's a string type
      const isString = ['String', 'Enum8', 'Enum16', 'LowCardinality(String)', 'UUID', 'IPv4', 'IPv6', 'Nullable(String)'].includes(col.type);
      
      // Determine if it's a numeric type
      const isNumeric = col.type.includes('Int') || 
                        col.type.includes('Float') || 
                        col.type.includes('Decimal');
      
      
      return {
        field: col.name,
        enableValue: true,
        // Add appropriate aggFunc based on column type
        ...(isString && { aggFunc: 'first' }),
        ...(isNumeric && !isString && { 
          aggFunc: 'sum',
    
        }),
        // Only set hide if autoValue is true
        ...(autoValue && { hide: true }),
        cellDataType: isNumeric ? 'number' : 'string'
      };
    }); 
}



