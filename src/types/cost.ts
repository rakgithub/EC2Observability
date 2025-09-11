export type TimeRange = "7d" | "24h" | "30d" | "lastMonth";
export type Dimension = "region" | "type" | "job";
export type ViewMode = "chart" | "table";
export type ChartType = "bar" | "pie";

export interface CostData {
  name: string;
  cost: number;
}

export interface CostsResponse {
  totalSpend: number;
  dailyBurn: number;
  dailyBurnTrend: "up" | "down" | "neutral";
  projectedMonthly: number;
  byRegion: CostData[];
  byType: CostData[];
  byJob: CostData[];
  mock?: boolean;
  totalSpendTrend?: "up" | "down" | "neutral";
  projectedMonthlyTrend?: "up" | "down" | "neutral";
  previousTotalSpend?: number;
  previousDailyBurn?: number;
  previousProjectedMonthly?: number;
  totalSpendHistory?: { Timestamp: string; Average: number }[];
  dailyBurnHistory?: { Timestamp: string; Average: number }[];
  projectedMonthlyHistory?: { Timestamp: string; Average: number }[];
}
