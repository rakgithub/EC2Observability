import Legend from "@/components/ui/Legend";
import { Dimension, ViewMode } from "@/types/cost";
import { ChartDataItem } from "@/types/ec2";
import { chartColors } from "./utils";

interface FooterSectionProps {
  viewMode: ViewMode;
  showOverlay: boolean;
  totalCost: number;
  attributed: number;
  unaccounted: number;
  chartData: ChartDataItem[];
  dimension: Dimension;
}
const FooterSection: React.FC<FooterSectionProps> = ({
  viewMode,
  showOverlay,
  totalCost,
  attributed,
  unaccounted,
  chartData,
  dimension,
}) => (
  <div className="mt-4 space-y-4">
    {viewMode === "chart" && (
      <Legend chartData={chartData} chartColors={chartColors} />
    )}
    {!showOverlay && (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md text-sm font-medium text-gray-100">
        Total: ${totalCost.toFixed(2)} (Attributed: ${attributed.toFixed(2)},
        Unaccounted: ${unaccounted.toFixed(2)})
      </div>
    )}
    {chartData.length > 0 && (
      <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md text-sm text-teal-400">
        {dimension === "region"
          ? `Highest spend is in ${chartData[0].name}, likely where most jobs ran.`
          : `Most costs are from ${chartData[0].name} instances, likely reflecting compute needs.`}
      </div>
    )}
  </div>
);

export default FooterSection;
