import { ToggleGroup } from "@/components/ui";
import { LABELS } from "@/constants/cloudCost";
import { ChartType, Dimension, TimeRange, ViewMode } from "@/types/cost";
import { BarChart3, PieChartIcon, TrendingUp } from "lucide-react";

interface HeaderSectionProps {
  dimension: Dimension;
  viewMode: ViewMode;
  chartType: ChartType;
  timeRange: TimeRange;
  onDimensionChange: (val: Dimension) => void;
  onViewModeChange: (val: ViewMode) => void;
  onChartTypeChange: (val: ChartType) => void;
  onTimeRangeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
const CostAttributionHeader: React.FC<HeaderSectionProps> = ({
  dimension,
  viewMode,
  chartType,
  timeRange,
  onDimensionChange,
  onViewModeChange,
  onChartTypeChange,
  onTimeRangeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-900 rounded-lg">
          <TrendingUp className="w-6 h-6 text-teal-400 transition-transform duration-200 hover:scale-110" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">
            {LABELS.COST_ATTRIBUTION}
          </h2>
          <p className="text-sm text-gray-400">
            {dimension === "region"
              ? LABELS.BREAKDOWN_REGION
              : dimension === "type"
              ? LABELS.BREAKDOWN_TYPE
              : LABELS.BREAKDOWN_JOB}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 transition-all duration-200 hover:bg-teal-900/50">
          <ToggleGroup
            value={dimension}
            onChange={onDimensionChange}
            options={[
              { value: "region", label: LABELS.REGION },
              { value: "type", label: LABELS.INSTANCE },
              { value: "job", label: LABELS.JOB_TEAM },
            ]}
          />
        </div>

        <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 transition-all duration-200 hover:bg-teal-900/50">
          <ToggleGroup
            value={viewMode}
            onChange={onViewModeChange}
            options={[
              { value: "chart", label: LABELS.CHART },
              { value: "table", label: LABELS.TABLE },
            ]}
          />
        </div>

        <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 transition-all duration-200 hover:bg-teal-900/50">
          <ToggleGroup
            value={chartType}
            onChange={onChartTypeChange}
            options={[
              {
                value: "bar",
                label: LABELS.BAR,
                icon: <BarChart3 className="w-4 h-4 text-teal-400" />,
                disabled: viewMode === "table",
              },
              {
                value: "pie",
                label: LABELS.PIE,
                icon: <PieChartIcon className="w-4 h-4 text-teal-400" />,
                disabled: viewMode === "table",
              },
            ]}
          />
        </div>

        <select
          value={timeRange}
          onChange={onTimeRangeChange}
          className="px-4 py-2 rounded-md text-sm font-medium border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 hover:bg-teal-900/50"
          aria-label="Select time range"
        >
          <option value="7d" className="bg-gray-900 text-gray-100">
            {LABELS.LAST_7_DAYS}
          </option>
          <option value="30d" className="bg-gray-900 text-gray-100">
            {LABELS.THIS_MONTH}
          </option>
          <option value="lastMonth" className="bg-gray-900 text-gray-100">
            {LABELS.LAST_MONTH}
          </option>
        </select>
      </div>
    </div>
  );
};

export default CostAttributionHeader;
