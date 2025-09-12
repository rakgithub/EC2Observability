import Sparkline from "@/components/ui/Sparkline";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MetricDatapoint } from "@/types/ec2";
import { LABELS } from "@/constants/ec2Table";

interface MetricCellProps {
  value: number | undefined;
  metricsData?: MetricDatapoint[];
}

const formatPercentage = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return LABELS.NA;
  return `${value.toFixed(2)}%`;
};

const MetricCell: React.FC<MetricCellProps> = ({ value, metricsData }) => (
  <td className="px-4 py-3 align-middle">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-28">
        <ProgressBar value={value || 0} />
        <span className="text-sm font-medium text-gray-300">
          {formatPercentage(value)}
        </span>
      </div>
      {metricsData && <Sparkline data={metricsData} />}
    </div>
  </td>
);

export default MetricCell;