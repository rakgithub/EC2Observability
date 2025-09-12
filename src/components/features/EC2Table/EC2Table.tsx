"use client";

import Skeleton from "../../ui/Skeleton";
import { useError } from "@/context/ErrorProvider";
import { LABELS } from "@/constants/ec2Table";
import TableHeader from "./TableHeader";
import InstanceStatsCards from "./InstanceStatsCards";
import { useEC2Table } from "@/hooks/useEC2Table";
import { useMemo } from "react";
import { EC2TableBody } from "./EC2TableBody";
import { EC2TableHead } from "./EC2TableHeader";
import { useEC2Instances } from "@/hooks/useEC2Instances";
import { rangeOptions, RangeOptions } from "./utils";

const EC2Table: React.FC = () => {
  const { instances, totalCount, error, isLoading } = useEC2Instances();
  const table = useEC2Table(instances);
  const { showError } = useError();

  const { idleCount, busyCount, healthyCount } = useMemo(() => {
    const idle = instances.filter((i) => i.cpu && i.cpu < 15).length;
    const busy = instances.filter((i) => i.cpu && i.cpu > 70).length;
    const healthy = instances.length - idle - busy;
    return { idleCount: idle, busyCount: busy, healthyCount: healthy };
  }, [instances]);

  const numericColumnIds: (keyof RangeOptions)[] = [
    "cpu-usage",
    "ram-usage",
    "gpu-usage",
    "computedUptimeHours",
  ];

  if (isLoading)
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-md p-6">
        <Skeleton className="h-10 w-64 mb-6 bg-gray-700" />
        <Skeleton className="h-64 w-full rounded-xl bg-gray-700" />
      </div>
    );

  if (error) {
    showError(`Failed to load costs: ${error.message}`);
    return (
      <div className="mb-6 p-6 bg-gray-800 dark:bg-gray-900 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          Unable to Load EC2 Table
        </h2>
        <p className="text-gray-300 mb-4">{LABELS.ERROR_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-teal-500/50">
      <TableHeader totalCount={totalCount} />
      <InstanceStatsCards
        idleCount={idleCount}
        busyCount={busyCount}
        healthyCount={healthyCount}
      />
      <div className="overflow-x-auto scrollbar scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-teal-400 hover:scrollbar-thumb-teal-300 scrollbar-track-rounded scrollbar-thumb-rounded">
        <table className="min-w-full border border-gray-700 rounded-xl text-sm bg-gray-800">
          <EC2TableHead
            table={table}
            preprocessedInstances={instances}
            numericColumnIds={numericColumnIds}
            rangeOptions={rangeOptions}
          />
          <EC2TableBody table={table} />
        </table>
      </div>
    </div>
  );
};

export default EC2Table;
