import Tooltip from "@/components/ui/Tooltip";
import { AlertCircle, Activity, CheckCircle, Info } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  color: string;
  label: string;
  count: number;
  tooltipContent: string;
}

interface InstanceStatsCardsProps {
  idleCount: number;
  busyCount: number;
  healthyCount: number;
}

const StatCard = ({ icon: Icon, color, label, count, tooltipContent }: StatCardProps) => (
  <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-md text-center transition-all duration-300 hover:shadow-teal-500/50">
    <div className="flex items-center justify-center gap-2 mb-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <p className="text-sm text-gray-400">{label}</p>
       <Tooltip content={tooltipContent}>
        <Info className="w-4 h-4 text-teal-400 cursor-pointer transition-colors duration-200 hover:text-teal-300" />
      </Tooltip>
    </div>
    <p className={`text-xl font-bold ${color}`}>{count}</p>
  </div>
);

const InstanceStatsCards = ({
  idleCount,
  busyCount,
  healthyCount,
}: InstanceStatsCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
    <StatCard
      icon={AlertCircle}
      color="text-red-400"
      label="Idle Instances"
      count={idleCount}
      tooltipContent="Idle instances are running but are not currently handling any user requests. These can be optimized to reduce cost."
    />
    <StatCard
      icon={Activity}
      color="text-yellow-400"
      label="Busy Instances"
      count={busyCount}
      tooltipContent="Busy instances are actively processing requests. These are essential for maintaining your application's performance."
    />
    <StatCard
      icon={CheckCircle}
      color="text-green-400"
      label="Healthy Instances"
      count={healthyCount}
      tooltipContent="Healthy instances are fully operational and have passed all health checks. A high count here indicates system stability."
    />
  </div>
);

export default InstanceStatsCards;
