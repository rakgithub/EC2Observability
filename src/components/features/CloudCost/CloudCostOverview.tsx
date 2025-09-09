"use client";

import { AlertTriangle, DollarSign } from "lucide-react";
import Skeleton from "../../ui/Skeleton";
import KPICard from "./KPICard";
import { useCosts } from "@/hooks/useCosts";
import { TimeRange } from "@/types/cost";
import { detectSpike } from "./utils";

const CloudCostOverview: React.FC = () => {
  const timeRange: TimeRange = "7d";
  const { data, error, isLoading } = useCosts(timeRange);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-24 w-full rounded-2xl bg-gray-700" />
        <Skeleton className="h-24 w-full rounded-2xl bg-gray-700" />
        <Skeleton className="h-24 w-full rounded-2xl bg-gray-700" />
      </div>
    );
  }
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">
        Failed to load costs: {error.message}
      </div>
    );

  const totalSpend = data?.totalSpend ?? 0;
  const dailyBurn = data?.dailyBurn ?? 0;
  const projectedMonthly = data?.projectedMonthly ?? 0;
  const mockData = data?.mock ?? false;
  const previousTotalSpend = data?.previousTotalSpend ?? 0;
  const previousDailyBurn = data?.previousDailyBurn ?? 0;
  const previousProjectedMonthly = data?.previousProjectedMonthly ?? 0;

  const totalSpendSpike = detectSpike(previousTotalSpend ?? 0, totalSpend);
  const dailyBurnSpike = detectSpike(previousDailyBurn ?? 0, dailyBurn);
  const projectedMonthlySpike = detectSpike(
    previousProjectedMonthly ?? 0,
    projectedMonthly
  );

  const totalSpendDiff =
    ((totalSpend - previousTotalSpend) / previousTotalSpend) * 100;
  const dailyBurnDiff =
    ((dailyBurn - previousDailyBurn) / previousDailyBurn) * 100;
  const projectedMonthlyDiff =
    ((projectedMonthly - previousProjectedMonthly) / previousProjectedMonthly) *
    100;
  const getSpendRecommendation = () => {
    // Check if previousTotalSpend is zero to avoid division by zero
    const totalSpendDiff =
      previousTotalSpend === 0
        ? totalSpend > 0
          ? 100 // If previous spend is 0 and current spend is non-zero, treat as a 100% increase
          : 0 // If both are zero, there's no change
        : ((totalSpend - previousTotalSpend) / previousTotalSpend) * 100;

    if (totalSpendDiff > 20) {
      return {
        message: `You are spending ${totalSpendDiff.toFixed(
          2
        )}% more than the previous month. Consider scaling down unused instances or optimizing storage.`,
        icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      };
    } else if (totalSpendDiff < -10) {
      return {
        message: `You are spending ${Math.abs(totalSpendDiff).toFixed(
          2
        )}% less than the previous month. Great job! Keep monitoring to ensure the savings continue.`,
        icon: <DollarSign className="w-6 h-6 text-green-500" />,
      };
    }
    return {
      message: "Your cloud spend is stable compared to last month.",
      icon: <DollarSign className="w-6 h-6 text-gray-400" />,
    };
  };

  const getDailyBurnRecommendation = () => {
    // Check if previousDailyBurn is zero to avoid division by zero
    const dailyBurnDiff =
      previousDailyBurn === 0
        ? dailyBurn > 0
          ? 100 // If previous daily burn is 0 and current daily burn is non-zero, treat as 100% increase
          : 0 // If both are zero, there's no change
        : ((dailyBurn - previousDailyBurn) / previousDailyBurn) * 100;

    if (dailyBurnDiff > 30) {
      return {
        message: `Your daily burn rate has spiked by ${dailyBurnDiff.toFixed(
          2
        )}%. Check for any running processes or instances that could be terminated.`,
        icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      };
    } else if (dailyBurnDiff < -15) {
      return {
        message: `Your daily burn rate has decreased by ${Math.abs(
          dailyBurnDiff
        ).toFixed(2)}%. This indicates good cost-saving measures are working.`,
        icon: <DollarSign className="w-6 h-6 text-green-500" />,
      };
    }
    return {
      message: "Your daily burn rate is consistent with the past period.",
      icon: <DollarSign className="w-6 h-6 text-gray-400" />,
    };
  };

  const getProjectedMonthlyRecommendation = () => {
    // Check if previousProjectedMonthly is zero to avoid division by zero
    const projectedMonthlyDiff =
      previousProjectedMonthly === 0
        ? projectedMonthly > 0
          ? 100 // If previous projected monthly is 0 and current projected monthly is non-zero, treat as 100% increase
          : 0 // If both are zero, there's no change
        : ((projectedMonthly - previousProjectedMonthly) /
            previousProjectedMonthly) *
          100;

    if (projectedMonthlyDiff > 20) {
      return {
        message: `Your projected monthly spend is ${projectedMonthlyDiff.toFixed(
          2
        )}% higher than last month. Consider reviewing resource usage.`,
        icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      };
    } else if (projectedMonthlyDiff < -15) {
      return {
        message: `Your projected monthly spend is ${Math.abs(
          projectedMonthlyDiff
        ).toFixed(0)}% lower than last month. Excellent cost management!`,
        icon: <DollarSign className="w-6 h-6 text-green-500" />,
      };
    }
    return {
      message: "Your projected monthly spend is stable.",
      icon: <DollarSign className="w-6 h-6 text-gray-400" />,
    };
  };

  const spendRecommendation = getSpendRecommendation();
  const dailyBurnRecommendation = getDailyBurnRecommendation();
  const projectedMonthlyRecommendation = getProjectedMonthlyRecommendation();
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2  rounded-full">
            <DollarSign className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Cloud Costs</h2>
            <p className="text-sm text-gray-300">
              Last 7 days • Total: ${totalSpend.toFixed(2)}
            </p>
          </div>
        </div>
        {mockData && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-200">
            Demo Data
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          {spendRecommendation.icon}
          <p className="text-sm text-gray-300">{spendRecommendation.message}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          {dailyBurnRecommendation.icon}
          <p className="text-sm text-gray-300">
            {dailyBurnRecommendation.message}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 p-4 bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          {projectedMonthlyRecommendation.icon}
          <p className="text-sm text-gray-300">
            {projectedMonthlyRecommendation.message}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Spend"
          value={`$${totalSpend.toFixed(2)}`}
          trend={data?.totalSpendTrend ?? "neutral"}
          tooltipContent="The total amount spent on cloud resources over the last 7 days."
          subtitle={
            data?.totalSpendTrend === "up"
              ? "Spending so far is higher than the same day last month."
              : data?.totalSpendTrend === "down"
              ? "Spending so far is lower than the same day last month."
              : "No change compared to last month’s same day."
          }
          isAnomaly={totalSpendSpike}
        />

        <KPICard
          title="Daily Burn"
          value={`$${dailyBurn.toFixed(2)}/day`}
          trend={data?.dailyBurnTrend ?? "neutral"}
          tooltipContent="The daily cost of cloud usage, averaged over the last 24 hours."
          subtitle={
            data?.dailyBurnTrend === "up"
              ? "Yesterday’s cost was higher than the day before."
              : data?.dailyBurnTrend === "down"
              ? "Yesterday’s cost was lower than the day before."
              : "No change in daily cost."
          }
          isAnomaly={dailyBurnSpike}
        />

        <KPICard
          title="Projected Monthly"
          value={`$${projectedMonthly.toFixed(2)}`}
          trend={data?.projectedMonthlyTrend ?? "neutral"}
          tooltipContent="Estimate of your total cloud spend based on current usage patterns for the rest of the month."
          subtitle={
            data?.projectedMonthlyTrend === "up"
              ? "This month’s projected spend is higher than last month."
              : data?.projectedMonthlyTrend === "down"
              ? "This month’s projected spend is lower than last month."
              : "Projection is similar to last month."
          }
          isAnomaly={projectedMonthlySpike}
        />
      </div>
    </div>
  );
};

export default CloudCostOverview;
