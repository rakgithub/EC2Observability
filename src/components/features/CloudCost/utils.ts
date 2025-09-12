import { LABELS } from "@/constants/cloudCost";
import { CostsResponse } from "@/types/cost";

export type MetricType = "burn" | "totalSpend" | "projected";

export const detectSpike = (
  history: { Timestamp: string; Average: number }[],
  type: MetricType,
  threshold = 0.2
): boolean => {
  if (history.length < 2) return false;

  if (type === "totalSpend") {
    if (history.length < 3) return false;

    const prevDelta = history.at(-2)!.Average - history.at(-3)!.Average;
    const currDelta = history.at(-1)!.Average - history.at(-2)!.Average;

    if (prevDelta <= 0) return false;

    const change = (currDelta - prevDelta) / prevDelta;
    return change > threshold;
  }
  // burn or projected
  const prev = history.at(-2)!.Average;
  const curr = history.at(-1)!.Average;

  if (prev <= 0) return false;

  const change = (curr - prev) / prev;
  return change > threshold;
};

export const getProjectedMonthlyRecommendation = (
  previousProjectedMonthly: number,
  projectedMonthly: number
) => {
  const diff =
    previousProjectedMonthly === 0
      ? projectedMonthly > 0
        ? 100
        : 0
      : ((projectedMonthly - previousProjectedMonthly) /
          previousProjectedMonthly) *
        100;

  if (diff > 20) {
    return {
      message: `Projected spend is ${diff.toFixed(
        2
      )}% higher than last month. Review workloads.`,
    };
  } else if (diff < -15) {
    return {
      message: `Projected spend is ${Math.abs(diff).toFixed(
        0
      )}% lower than last month. Excellent management!`,
    };
  }
  return {
    message: "Projected monthly spend is stable.",
  };
};

export const getSpendRecommendation = (
  previousTotalSpend: number,
  totalSpend: number
) => {
  const diff =
    previousTotalSpend === 0
      ? totalSpend > 0
        ? 100
        : 0
      : ((totalSpend - previousTotalSpend) / previousTotalSpend) * 100;

  if (diff > 20) {
    return {
      message: `Spending is ${diff.toFixed(
        2
      )}% higher than last month. Consider scaling down unused instances or optimizing storage.`,
    };
  } else if (diff < -10) {
    return {
      message: `Spending is ${Math.abs(diff).toFixed(
        2
      )}% lower than last month. Great job!`,
    };
  }
  return {
    message: "Cloud spend is stable compared to last month.",
  };
};


export const getDailyBurnRecommendation = (
  previousDailyBurn: number,
  dailyBurn: number
) => {
  const diff =
    previousDailyBurn === 0
      ? dailyBurn > 0
        ? 100
        : 0
      : ((dailyBurn - previousDailyBurn) / previousDailyBurn) * 100;

  if (diff > 30) {
    return {
      message: `Daily burn rate spiked by ${diff.toFixed(
        2
      )}%. Check running processes that could be terminated.`,
    };
  } else if (diff < -15) {
    return {
      message: `Daily burn decreased by ${Math.abs(diff).toFixed(
        2
      )}%. Cost-saving measures are working.`,
    };
  }
  return {
    message: "Daily burn is consistent with the past period.",
  };
};

export type TrendSignal = "idle" | "bursty" | "high" | "rising" | "stable";

export function analyzeTrend(values: number[]): TrendSignal {
  if (!values || values.length < 3) return "stable";

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  const slope = values[values.length - 1] - values[0];

  if (avg < 10 && variance < 5) return "idle";
  if (variance > 50) return "bursty";
  if (avg > 70) return "high";
  return slope > 0 ? "rising" : "stable";
}

export const buildMetrics = (data: CostsResponse) => {
  const {
    totalSpend = 0,
    dailyBurn = 0,
    projectedMonthly = 0,
    previousTotalSpend = 0,
    previousDailyBurn = 0,
    previousProjectedMonthly = 0,
    totalSpendTrend = "neutral",
    dailyBurnTrend = "neutral",
    projectedMonthlyTrend = "neutral",
  } = data ?? {};

  return [
    {
      key: "totalSpend",
      title: LABELS.TOTAL_SPEND,
      value: `$${totalSpend.toFixed(2)}`,
      trend: totalSpendTrend,
      history: data?.totalSpendHistory ?? [],
      tooltip: LABELS.TOTAL_SPEND_TOOLTIP,
      isAnomaly: detectSpike(data?.totalSpendHistory ?? [], "totalSpend"),
      anomalyMessage: "Overall AWS costs are much higher than usual.",
      anomalyActionButtonText: "View Cost Breakdown",
      recommendation: getSpendRecommendation(previousTotalSpend, totalSpend),
      color: "#10b981",
    },
    {
      key: "dailyBurn",
      title: LABELS.DAILY_BURN,
      value: `$${dailyBurn.toFixed(2)}/day`,
      trend: dailyBurnTrend,
      history: data?.dailyBurnHistory ?? [],
      tooltip: LABELS.DAILY_BURN_TOOLTIP,
      isAnomaly: detectSpike(data?.dailyBurnHistory ?? [], "burn"),
      anomalyMessage: "Spending more each day than your typical average.",
      anomalyActionButtonText: "Check Active Jobs",
      recommendation: getDailyBurnRecommendation(previousDailyBurn, dailyBurn),
      color: "#3b82f6",
    },
    {
      key: "projectedMonthly",
      title: LABELS.PROJECTED_MONTHLY,
      value: `$${projectedMonthly.toFixed(2)}`,
      trend: projectedMonthlyTrend,
      history: data?.projectedMonthlyHistory ?? [],
      tooltip: LABELS.PROJECTED_MONTHLY_TOOLTIP,
      isAnomaly: detectSpike(data?.projectedMonthlyHistory ?? [], "projected"), 
      anomalyMessage: "This month's costs are trending well above than last month.",
      anomalyActionButtonText: "Set Budget Alert",
      recommendation: getProjectedMonthlyRecommendation(
        previousProjectedMonthly,
        projectedMonthly
      ),
      color: "#f59e0b",
    },
  ];
};

export const COLORS = {
  IDLE: "#6B7280",    
  BUSTY: "#FBBF24",  
  HIGH: "#DC2626",    
  RISING: "#F97316",   
  STABLE: "#34D399",  
  COLLECTING_DATA: "#9CA3AF",
};

