import HighlightedText from "@/components/ui/HighlightedText";
import Sparkline from "@/components/ui/Sparkline";
import Tooltip from "@/components/ui/Tooltip";
import {
  TrendingUp,
  TrendingDown,
  Square,
  Info,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useCallback } from "react";

type Trend = "up" | "down" | "neutral";

interface KPICardProps {
  title: string;
  value: string;
  trend: Trend;
  isAnomaly?: boolean;
  tooltipContent?: string;
  recommendation?: { message: string };
  history?: { Timestamp: string; Average: number }[];
  color?: string;
  anomalyMessage?: string;
  anomalyActionButtonText?: string;
}

const trendConfig = {
  up: { Icon: TrendingUp, color: "text-green-400" },
  down: { Icon: TrendingDown, color: "text-red-400" },
  neutral: { Icon: Square, color: "text-gray-400" },
};

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  isAnomaly,
  tooltipContent,
  recommendation,
  history,
  anomalyMessage,
  anomalyActionButtonText
}) => {

  const handleAnomalyAction = useCallback(() => {
  // Implement the action to be taken when the anomaly button is clicked
  // For example, navigate to a detailed cost breakdown page or open a modal
  console.log("Anomaly action triggered");
}, []);

  const { Icon: TrendIcon, color: trendColor } = trendConfig[trend];
  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-5 transition-all duration-300 hover:scale-105 hover:shadow-teal-500/50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          {title}
        </p>
        {tooltipContent && (
          <Tooltip
            content={tooltipContent}
          >
            <Info
              className="w-4 h-4 text-teal-400 cursor-pointer transition-colors duration-200 hover:text-teal-300"
              aria-label={`Tooltip for ${title}`}
            />
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        <TrendIcon
          className={`w-5 h-5 ${trendColor} transition-transform duration-300 hover:scale-110`}
        />
      </div>
      {history && history.length > 0 && (
        <div className="mt-4 h-12">
          <Sparkline data={history}/>
        </div>
      )}
      {recommendation && (
        <div
          className="mt-4 flex items-start gap-2 bg-teal-900/50 rounded-lg p-3"
          aria-label="Cost optimization recommendation"
        >
          <Lightbulb className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <HighlightedText message={recommendation.message} />
        </div>
      )}
      {isAnomaly && (
        <div
          className="mt-4 flex items-start justify-between gap-2 bg-red-900/50 rounded-lg p-3"
          aria-label="Anomaly detected"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 leading-relaxed">
              {anomalyMessage}
            </p>
          </div>
          <button
            onClick={handleAnomalyAction}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-100 bg-gradient-to-r from-red-800/60 to-red-700/60 hover:from-red-700/70 hover:to-red-600/70 px-2 py-1 rounded-md transition-all duration-200 ease-in-out hover:shadow-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
           {anomalyActionButtonText || "Investigate"}
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default KPICard;
