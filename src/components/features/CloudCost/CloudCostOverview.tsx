"use client";

import KPICard from "./KPICard";
import { useCosts } from "@/hooks/useCosts";
import { TimeRange } from "@/types/cost";
import { buildMetrics } from "./utils";
import { useMemo, useState } from "react";
import { useError } from "@/context/ErrorProvider";
import Skeleton from "@/components/ui/Skeleton";
import { ERROR_MESSAGES, LABELS } from "@/constants/cloudCost";
import ErrorMessage from "@/components/ui/ErrorMessage";
import CloudCostHeader from "./CloudCostHeader";

const CloudCostOverview: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("7d");
  const { data, error, isLoading } = useCosts(selectedTimeRange);
  const { showError } = useError();

  const { totalSpend = 0 } = data ?? {};

  const metrics = useMemo(() => {
    return data ? buildMetrics(data) : [];
  }, [data]);

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
    showError(
      ERROR_MESSAGES.LOAD_COSTS.replace("{errorMessage}", error.message)
    );
    return (
      <ErrorMessage
        title={LABELS.UNABLE_TO_LOAD_COSTS}
        description={LABELS.ERROR_MESSAGE}
      />
    );
  }

  return (
    <div className="mb-6">
      <CloudCostHeader
        totalSpend={totalSpend}
        selectedTimeRange={selectedTimeRange}
        onTimeRangeChange={setSelectedTimeRange}
      />
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
