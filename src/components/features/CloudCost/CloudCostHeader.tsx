import React from "react";
import { DollarSign } from "lucide-react";
import { TimeRange } from "@/types/cost";
import { LABELS } from "@/constants/cloudCost";

interface CloudCostHeaderProps {
  totalSpend: number;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const CloudCostHeader: React.FC<CloudCostHeaderProps> = ({
  totalSpend,
  selectedTimeRange,
  onTimeRangeChange,
}) => {
  const formattedTimeRange =
    selectedTimeRange === "24h" ? "24 Hours" : "7 Days";

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full">
          <DollarSign className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {LABELS.CLOUD_COSTS}
          </h2>
          <p className="text-sm text-gray-300">
            {LABELS.SELECT_TIME_RANGE.replace(
              "{timeRange}",
              formattedTimeRange
            ).replace("{totalSpend}", totalSpend.toFixed(2))}
          </p>
        </div>
      </div>

      <select
        value={selectedTimeRange}
        onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
        className="bg-gray-800 text-white rounded p-2"
        aria-label="Select time range"
      >
        <option value="24h">{LABELS.LAST_24H}</option>
        <option value="7d">{LABELS.LAST_7D}</option>
      </select>
    </div>
  );
};

export default CloudCostHeader;
