'use client";';

import Sparkline from "@/components/ui/Sparkline";
import { EC2Instance } from "@/types/ec2";
import useSWR from "swr";
import { formatUptime, getRecommendedAction } from "./utils";
import RecommendedAction from "./RecommendedAction";
interface InstanceRowProps {
  instance: EC2Instance;
  index: number;
  isWaste: (cpu: number, uptimeHours: number | undefined) => boolean;
}

interface MetricDatapoint {
  Timestamp: string;
  Average: number;
  Unit: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-300"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`, // Clamp value between 0 and 100
        background: `linear-gradient(to right, ${
          value < 50 ? "#4CAF50" : value < 80 ? "#FFC107" : "#F44336"
        } 0%, ${
          value < 50 ? "#66BB6A" : value < 80 ? "#FFCA28" : "#EF5350"
        } 100%)`,
      }}
    ></div>
  </div>
);

const getInsight = (cpu: number, ram: number, uptime: number) => {
  if (cpu < 10 && uptime > 24) return "Idle candidate – safe to stop";
  if (cpu < 30 && ram < 30) return "Batch-ready – good for lightweight jobs";
  if (cpu > 70 || ram > 70) return "High load – consider scaling";
  return "Healthy utilisation";
};

const InstanceRow: React.FC<InstanceRowProps> = ({
  instance,
  index,
  isWaste,
}) => {
  const { data: cpuMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instance.id}&metric=CPUUtilization`,
    fetcher,
    { refreshInterval: 60000, dedupingInterval: 2000 }
  );
  const { data: ramMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instance.id}&metric=MemoryUtilization`,
    fetcher,
    { refreshInterval: 60000, dedupingInterval: 2000 }
  );
  const { data: gpuMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instance.id}&metric=GPUUtilization`,
    fetcher,
    { refreshInterval: 60000, dedupingInterval: 2000 }
  );

  const cpu =
    cpuMetrics && cpuMetrics.length > 0
      ? cpuMetrics.sort(
          (a, b) =>
            new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        )[0].Average
      : instance.cpu;

  const ram =
    ramMetrics && ramMetrics.length > 0
      ? ramMetrics.sort(
          (a, b) =>
            new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        )[0].Average
      : instance.ram;

  const gpu =
    gpuMetrics && gpuMetrics.length > 0
      ? gpuMetrics.sort(
          (a, b) =>
            new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
        )[0].Average
      : instance.gpu;

  const uptimeHours = instance.launchTime
    ? (new Date().getTime() - new Date(instance.launchTime).getTime()) /
      (1000 * 60 * 60)
    : instance.uptimeHours;

  const costPerHour =
    instance.type === "t2.micro" ? 0.0116 : instance.costPerHour;

  const formatPercentage = (value: number) => {
    if (value === undefined || isNaN(value)) return "N/A";
    return `${value.toFixed(2)}%`;
  };
  return (
    <tr
      className={`border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 ${
        index % 2 === 0
          ? "bg-white dark:bg-gray-800"
          : "bg-gray-50 dark:bg-gray-900"
      } hover:bg-gray-100 dark:hover:bg-gray-700`}
    >
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
        {instance.id}
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
        {instance.region}
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
        {instance.type}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={cpu || 0} />
            <span className="text-sm font-semibold text-gray-300">
              {formatPercentage(cpu || 0)}
            </span>
          </div>
          {cpuMetrics && <Sparkline data={cpuMetrics} color="#4CAF50" />}
        </div>
      </td>

      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={ram || 0} />
            <span className="text-sm font-semibold text-gray-300">
              {formatPercentage(ram || 0)}
            </span>
          </div>
          {ramMetrics && <Sparkline data={ramMetrics} color="#2196F3" />}
        </div>
      </td>

      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={gpu || 0} />
            <span className="text-sm font-semibold text-gray-300">
              {formatPercentage(gpu || 0)}
            </span>
          </div>
          {gpuMetrics && <Sparkline data={gpuMetrics} color="#FF9800" />}
        </div>
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
        {formatUptime(uptimeHours)}
      </td>
      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
        {costPerHour !== undefined ? `$${costPerHour.toFixed(4)}` : "N/A"}
      </td>
      <td className="px-4 py-3">
        {isWaste(cpu, uptimeHours) ? (
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
            Waste
          </span>
        ) : (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            Healthy
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
