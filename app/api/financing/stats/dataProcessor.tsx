interface StatsData {
  asOfDate: string;
  cashOut: number;
  collateralAmount: number;
  accrualDaily: number;
  accrualProjected: number;
  accrualRealised: number;
}

interface ProcessedStats {
  [key: string]: {
    current: number;
    previous: number;
    change: number;
    currentDate: string;
    previousDate: string;
    numDays: number;
  };
}

export class DataProcessor {
  static processStatsData(statsData: StatsData[]): ProcessedStats {
    if (!statsData || statsData.length === 0) {
      return {} as ProcessedStats;
    }

    const sortedData = [...statsData].sort((a, b) => 
      new Date(b.asOfDate).getTime() - new Date(a.asOfDate).getTime()
    );

    const latest = sortedData[0];
    const previous = sortedData[1] || latest;

    return ['cashOut', 'collateralAmount', 'accrualDaily', 'accrualProjected', 'accrualRealised'].reduce((acc, key) => {
      const currentValue = Number(latest[key as keyof StatsData] ?? 0);
      const previousValue = Number(previous[key as keyof StatsData] ?? 0);
      
      acc[key] = {
        current: currentValue,
        previous: previousValue,
        change: currentValue - previousValue,
        currentDate: latest.asOfDate || '',
        previousDate: previous.asOfDate || '',
        numDays: Math.ceil(
          (new Date(latest.asOfDate || Date.now()).getTime() - new Date(previous.asOfDate || Date.now()).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
      };
      return acc;
    }, {} as ProcessedStats);
  }
} 