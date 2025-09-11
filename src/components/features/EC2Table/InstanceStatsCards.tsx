import { AlertCircle, Activity, CheckCircle } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  color: string;
  label: string;
  count: number;
}

interface InstanceStatsCardsProps {
  idleCount: number;
  busyCount: number;
  healthyCount: number;
}

const StatCard = ({ icon: Icon, color, label, count }: StatCardProps) => (
  <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-md text-center transition-all duration-300 hover:shadow-teal-500/50">
    <div className="flex items-center justify-center gap-2 mb-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <p className="text-sm text-gray-400">{label}</p>
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
    />
    <StatCard
      icon={Activity}
      color="text-yellow-400"
      label="Busy Instances"
      count={busyCount}
    />
    <StatCard
      icon={CheckCircle}
      color="text-green-400"
      label="Healthy Instances"
      count={healthyCount}
    />
  </div>
);

export default InstanceStatsCards;
