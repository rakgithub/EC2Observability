import { LABELS } from "@/constants/cloudCost";
import { CostsResponse } from "@/types/cost";

export const detectSpike = (
  previousValue: number,
  currentValue: number
): boolean => {
  const threshold = 0.2;
  if (previousValue === 0) return false;
  const change = (currentValue - previousValue) / previousValue;
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
      isAnomaly: detectSpike(previousTotalSpend, totalSpend),
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
      isAnomaly: detectSpike(previousDailyBurn, dailyBurn),
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
      isAnomaly: detectSpike(previousProjectedMonthly, projectedMonthly),
      recommendation: getProjectedMonthlyRecommendation(
        previousProjectedMonthly,
        projectedMonthly
      ),
      color: "#f59e0b",
    },
  ];
};
