import { EC2Instance, MetricDatapoint } from "@/types/ec2";
import { formatUptime, isWaste } from "./utils";
import RecommendedAction from "./RecommendedAction";
import { LABELS } from "@/constants/ec2Table";
import MetricCell from "./MetricCell";
import { useInstanceMetrics } from "@/hooks/useInstanceMetrics";

interface InstanceRowProps {
  instance: EC2Instance;
  index: number;
}

const InstanceRow: React.FC<InstanceRowProps> = ({
  instance,
  index,
}) => {
  const { cpuMetrics, ramMetrics, gpuMetrics, diskMetrics } = useInstanceMetrics(instance.id);

  const getLatestMetric = (metrics?: MetricDatapoint[]): number | undefined => {
    if (!metrics || metrics.length === 0) return undefined;
    return metrics.sort(
      (a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
    )[0].Average;
  };

  const cpu = getLatestMetric(cpuMetrics);
  const ram = getLatestMetric(ramMetrics);
  const gpu = getLatestMetric(gpuMetrics);
  const disk = getLatestMetric(diskMetrics);

  const uptimeHours = instance.launchTime
    ? (new Date().getTime() - new Date(instance.launchTime).getTime()) /
      (1000 * 60 * 60)
    : instance.uptimeHours;

  const costPerHour =
    instance.type === "t2.micro" ? 0.0116 : instance.costPerHour;

  return (
    <tr
      className={`border-t border-gray-700 transition-all duration-200 ${
        index % 2 === 0
          ? "bg-gradient-to-r from-gray-800 to-gray-900"
          : "bg-gradient-to-r from-gray-900 to-gray-950"
      } hover:bg-teal-900/30`}
    >
      <td className="px-4 py-3 text-gray-100">{instance.id}</td>
      <td className="px-4 py-3 text-gray-100">{instance.region}</td>
      <td className="px-4 py-3 text-gray-100">{instance.type}</td>
      
      <MetricCell value={cpu} metricsData={cpuMetrics} />
      <MetricCell value={ram} metricsData={ramMetrics} />
      <MetricCell value={gpu} metricsData={gpuMetrics} />

      <td className="px-4 py-3 text-gray-100">{formatUptime(uptimeHours)}</td>
      <td className="px-4 py-3 text-gray-100">
        {costPerHour !== undefined ? `$${costPerHour.toFixed(4)}` : LABELS.NA}
      </td>
      <td className="px-4 py-3">
        {isWaste(cpu, ram, uptimeHours, disk) ? (
          <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded-full text-xs font-medium">
            {LABELS.STATUS_WASTE}
          </span>
        ) : (
          <span className="px-2 py-1 bg-teal-900/50 text-teal-400 rounded-full text-xs font-medium">
            {LABELS.STATUS_HEALTHY}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <RecommendedAction
          cpu={cpu || 0}
          gpu={gpu || 0}
          uptime={uptimeHours || 0}
          instanceId={instance.id}
        />
      </td>
    </tr>
  );
};

export default InstanceRow;