"use client";

import { DollarSign } from "lucide-react";
import KPICard from "./KPICard";
import { useCosts } from "@/hooks/useCosts";
import { TimeRange } from "@/types/cost";
import {
  detectSpike,
  getDailyBurnRecommendation,
  getProjectedMonthlyRecommendation,
  getSpendRecommendation,
} from "./utils";
import { useState } from "react";
import { useError } from "@/context/ErrorProvider";
import Skeleton from "@/components/ui/Skeleton";

const CloudCostOverview: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("7d");
  const { data, error, isLoading } = useCosts(selectedTimeRange);
  const { showError } = useError();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    showError(`Failed to load costs: ${error.message}`);
    return (
      <div className="mb-6 p-6 bg-gray-800 dark:bg-gray-900 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          Unable to Load Cloud Costs
        </h2>
        <p className="text-gray-300 mb-4">
          Something went wrong while fetching the data. Please try again.
        </p>
      </div>
    );
  }

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

  // Precompute spikes & recommendations
  const metrics = [
    {
      key: "totalSpend",
      title: "Total Spend",
      value: `$${totalSpend.toFixed(2)}`,
      trend: totalSpendTrend,
      history: data?.totalSpendHistory ?? [],
      tooltip:
        "The total amount spent on cloud resources over the last 7 days.",
      isAnomaly: detectSpike(previousTotalSpend, totalSpend),
      recommendation: getSpendRecommendation(previousTotalSpend, totalSpend),
      color: "#10b981",
    },
    {
      key: "dailyBurn",
      title: "Daily Burn",
      value: `$${dailyBurn.toFixed(2)}/day`,
      trend: dailyBurnTrend,
      history: data?.dailyBurnHistory ?? [],
      tooltip:
        "The daily cost of cloud usage, averaged over the last 24 hours.",
      isAnomaly: detectSpike(previousDailyBurn, dailyBurn),
      recommendation: getDailyBurnRecommendation(previousDailyBurn, dailyBurn),
      color: "#3b82f6",
    },
    {
      key: "projectedMonthly",
      title: "Projected Monthly",
      value: `$${projectedMonthly.toFixed(2)}`,
      trend: projectedMonthlyTrend,
      history: data?.projectedMonthlyHistory ?? [],
      tooltip:
        "Estimate of your total cloud spend based on current usage patterns for the rest of the month.",
      isAnomaly: detectSpike(previousProjectedMonthly, projectedMonthly),
      recommendation: getProjectedMonthlyRecommendation(
        previousProjectedMonthly,
        projectedMonthly
      ),
      color: "#f59e0b",
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full">
            <DollarSign className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Cloud Costs</h2>
            <p className="text-sm text-gray-300">
              Last {selectedTimeRange === "24h" ? "24 Hours" : "7 Days"} •
              Total: ${totalSpend.toFixed(2)}
            </p>
          </div>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
          className="bg-gray-800 text-white rounded p-2"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <KPICard
            key={m.key}
            title={m.title}
            value={m.value}
            trend={m.trend}
            tooltipContent={m.tooltip}
            isAnomaly={m.isAnomaly}
            recommendation={m.recommendation}
            color={m.color}
            history={m.history}
          />
        ))}
      </div>
    </div>
  );
};

export default CloudCostOverview;
