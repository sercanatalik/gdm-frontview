export const QUERY_CONFIGS = {
  stats: {
    query: buildStatsQuery,
    processResult: DataProcessor.processStatsData,
  },
  cashoutbymonth: {
    query: (conditions: string[]) => `
      SELECT
        formatDateTime(toStartOfMonth(tradeDt), '%b') AS month,
        round(sum(fundingAmount) / 1000000, 2) AS monthlyCashout
      FROM risk_f_mv FINAL 
      ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
      GROUP BY toStartOfMonth(tradeDt)
    `,
    processResult: (data: any) => data,
  },
  recenttrades: {
    query: (conditions: string[]) =>
      `SELECT * FROM risk_f_mv FINAL ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}`,
    processResult: (data: any) => data,
  },
  countrecenttrades: {
    query: (conditions: string[]) =>
      `SELECT COUNT(*) FROM risk_f_mv FINAL ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}`,
    processResult: (data: any) => data,
  },
  desk: {
    query: () => `SELECT DISTINCT bu FROM risk_f_mv FINAL`,
    processResult: (data: any) => data.map((item: any) => ({ desk: item.bu })),
  },
} as const

