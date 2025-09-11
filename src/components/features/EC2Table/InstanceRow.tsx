"use client";

import Sparkline from "@/components/ui/Sparkline";
import { EC2Instance, MetricDatapoint } from "@/types/ec2";
import useSWR from "swr";
import { formatUptime } from "./utils";
import RecommendedAction from "./RecommendedAction";
import { LABELS } from "@/constants/ec2Table";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface InstanceRowProps {
  instance: EC2Instance;
  index: number;
  isWaste: (
    cpu: number | undefined,
    uptimeHours: number | undefined
  ) => boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
    if (value === undefined || isNaN(value)) return LABELS.NA;
    return `${value.toFixed(2)}%`;
  };

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

      {/* CPU */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={cpu || 0} />
            <span className="text-sm font-medium text-gray-300">
              {formatPercentage(cpu || 0)}
            </span>
          </div>
          {cpuMetrics && <Sparkline data={cpuMetrics} color="#14b8a6" />}
        </div>
      </td>

      {/* RAM */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={ram || 0} />
            <span className="text-sm font-medium text-gray-300">
              {formatPercentage(ram || 0)}
            </span>
          </div>
          {ramMetrics && <Sparkline data={ramMetrics} color="#60a5fa" />}
        </div>
      </td>

      {/* GPU */}
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={gpu || 0} />
            <span className="text-sm font-medium text-gray-300">
              {formatPercentage(gpu || 0)}
            </span>
          </div>
          {gpuMetrics && <Sparkline data={gpuMetrics} color="#f59e0b" />}
        </div>
      </td>

      {/* Uptime */}
      <td className="px-4 py-3 text-gray-100">{formatUptime(uptimeHours)}</td>

      {/* Cost/hr */}
      <td className="px-4 py-3 text-gray-100">
        {costPerHour !== undefined ? `$${costPerHour.toFixed(4)}` : LABELS.NA}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {isWaste(cpu, uptimeHours) ? (
          <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded-full text-xs font-medium">
            {LABELS.STATUS_WASTE}
          </span>
        ) : (
          <span className="px-2 py-1 bg-teal-900/50 text-teal-400 rounded-full text-xs font-medium">
            {LABELS.STATUS_HEALTHY}
          </span>
        )}
      </td>

      {/* Action */}
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
