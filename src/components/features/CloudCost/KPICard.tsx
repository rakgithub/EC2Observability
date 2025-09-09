import Tooltip from "@/components/ui/Tooltip";
import { TrendingUp, TrendingDown, Square, Info } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  subtitle?: string;
  isAnomaly?: boolean;
  tooltipContent?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  subtitle,
  isAnomaly,
  tooltipContent,
}) => {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-gray-600";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Square;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
        {tooltipContent && (
          <Tooltip content={tooltipContent}>
            <Info className="w-5 h-5 text-gray-400 cursor-pointer" />
          </Tooltip>
        )}
        <TrendIcon
          className={`w-6 h-6 ${trendColor} transition-colors duration-200`}
        />
      </div>
      {isAnomaly && (
        <div className="text-red-500 text-xs mt-2">
          🚨 Anomaly detected: Spending has increased significantly.
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
