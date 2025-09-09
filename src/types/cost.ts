export interface CostData {
  totalCost?: number;
  dailyBurn?: number;
  projectedMonthly?: number;
  byRegion?: { name: string; cost: number }[];
  byType?: { name: string; cost: number }[];
}

export interface CostsResponse {
  totalSpend: number;
  dailyBurn: number;
  dailyBurnTrend: "up" | "down" | "neutral";
  projectedMonthly: number;
  byRegion: CostData[];
  byType: CostData[];
  mock?: boolean;
  totalSpendTrend?: "up" | "down" | "neutral";
  projectedMonthlyTrend?: "up" | "down" | "neutral";
  previousTotalSpend?: number;
  previousDailyBurn?: number;
  previousProjectedMonthly?: number;
}

export interface TimeRange {
  timeRange: "7d" | "30d" | "lastMonth";
}
