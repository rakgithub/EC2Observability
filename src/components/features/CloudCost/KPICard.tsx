import Sparkline from "@/components/ui/Sparkline";
import Tooltip from "@/components/ui/Tooltip";
import {
  TrendingUp,
  TrendingDown,
  Square,
  Info,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  isAnomaly?: boolean;
  tooltipContent?: string;
  recommendation?: { message: string };
  history?: { Timestamp: string; Average: number }[];
  color?: string;
}

const getValueClass = (value: number): string => {
  if (value > 0) return "text-red-400 font-medium";
  if (value < 0) return "text-green-400 font-medium";
  return "text-gray-400 font-medium";
};

const HighlightedText: React.FC<{ message: string }> = ({ message }) => {
  return (
    <span className="text-sm text-gray-300 leading-relaxed">
      {message.split(/(-?\d+\.?\d*%)/g).map((part, i) =>
        part.endsWith("%") ? (
          <span key={i} className={getValueClass(parseFloat(part))}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

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
  color = "#14b8a6", // Teal default to match EC2Table theme
}) => {
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
            place="top" // Position above to avoid overlap
            className="z-50 bg-gray-900 text-gray-100 border border-gray-700 rounded-md p-2 text-sm shadow-lg"
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
          <Sparkline data={history} color={color} />
        </div>
      )}
      {recommendation && (
        <div className="mt-4 flex items-start gap-2 bg-teal-900/50 rounded-lg p-3">
          <Lightbulb className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <HighlightedText message={recommendation.message} />
        </div>
      )}
      {isAnomaly && (
        <div className="mt-4 flex items-start gap-2 bg-red-900/50 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 leading-relaxed">
            Anomaly detected: Spending has increased significantly.
          </p>
        </div>
      )}
    </div>
  );
};

export default KPICard;
