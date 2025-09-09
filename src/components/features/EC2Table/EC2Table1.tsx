"use client";

import { EC2Instance } from "@/types/ec2";
import useSWR from "swr";
import { ArrowUp, ArrowDown, ChartNoAxesColumn, Info } from "lucide-react";
import Skeleton from "../../ui/Skeleton";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import InstanceRow from "./InstanceRow";
import Tooltip from "@/components/ui/Tooltip";
import { useMemo } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const preprocessInstances = (instances: EC2Instance[]): EC2Instance[] => {
  return instances.map((instance) => {
    const now = new Date().getTime();
    const uptimeHours = instance.launchTime
      ? (now - new Date(instance.launchTime).getTime()) / (1000 * 60 * 60)
      : instance.uptimeHours || 0;
    return { ...instance, computedUptimeHours: uptimeHours };
  });
};

const EC2Table: React.FC = () => {
  const { data, error, isLoading } = useSWR<{ instances: EC2Instance[] }>(
    "/api/instances",
    fetcher,
    {
      refreshInterval: 30000,
      dedupingInterval: 2000,
    }
  );

  const instances = useMemo(
    () => preprocessInstances(data?.instances || []),
    [data?.instances]
  );

  const columns: ColumnDef<EC2Instance>[] = useMemo(
    () => [
      { header: "Instance ID", accessorKey: "id", enableSorting: true },
      { header: "Region", accessorKey: "region", enableSorting: true },
      { header: "Type", accessorKey: "type", enableSorting: true },
      {
        header: () => (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-100">CPU Usage (%)</span>
              <Tooltip content="The percentage of CPU utilized by this instance.">
                <Info className="w-3.5 h-3.5 text-teal-400 cursor-help flex-shrink-0" />
              </Tooltip>
            </div>
          </div>
        ),
        accessorKey: "cpu",
        id: "cpu-usage",
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        header: () => (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-100">RAM Usage (%)</span>
              <Tooltip content="The percentage of RAM utilized by this instance.">
                <Info className="w-3.5 h-3.5 text-teal-400 cursor-help flex-shrink-0" />
              </Tooltip>
            </div>
          </div>
        ),
        accessorKey: "ram",
        id: "ram-usage",
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        header: () => (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-100">GPU Usage (%)</span>
              <Tooltip content="The percentage of GPU utilized by this instance.">
                <Info className="w-3.5 h-3.5 text-teal-400 cursor-help flex-shrink-0" />
              </Tooltip>
            </div>
          </div>
        ),
        accessorKey: "gpu",
        id: "gpu-usage",
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        header: () => (
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-100">Uptime (h)</span>
          </div>
        ),
        accessorKey: "computedUptimeHours",
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        header: () => (
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-100">Cost/hr</span>
          </div>
        ),
        accessorKey: "costPerHour",
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        header: () => (
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-100">Status</span>
          </div>
        ),
        accessorKey: "status",
        enableSorting: true,
      },
      {
        header: () => (
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-100">Action</span>
          </div>
        ),
        accessorKey: "action",
      },
    ],
    []
  );

  const table = useReactTable({
    data: instances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { sorting: [] },
  });

  if (isLoading)
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-2xl shadow-md p-6">
        <Skeleton className="h-10 w-64 mb-6 bg-gray-700" />
        <Skeleton className="h-64 w-full rounded-xl bg-gray-700" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-400 font-medium text-center p-6 bg-gray-900 rounded-2xl">
        Failed to load instances
      </div>
    );

  const isWaste = (cpu: number, uptimeHours: number | undefined): boolean => {
    if (cpu === undefined || uptimeHours === undefined) return false;
    return cpu < 15 && uptimeHours > 24;
  };

  const idleCount = instances.filter((i) => i.cpu && i.cpu < 15).length;
  const busyCount = instances.filter((i) => i.cpu && i.cpu > 70).length;
  const healthyCount = instances.length - idleCount - busyCount;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-colors duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-2 bg-gray-800 rounded-lg">
          <ChartNoAxesColumn className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-100">
            EC2 Instance Utilisation
          </h2>
          <p className="text-sm text-gray-400">
            Total: {instances.length} instances
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-900 rounded-xl shadow text-center">
          <p className="text-sm text-gray-400">Idle Instances</p>
          <p className="text-xl font-semibold text-red-400">{idleCount}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl shadow text-center">
          <p className="text-sm text-gray-400">Busy Instances</p>
          <p className="text-xl font-semibold text-yellow-400">{busyCount}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl shadow text-center">
          <p className="text-sm text-gray-400">Healthy Instances</p>
          <p className="text-xl font-semibold text-green-400">{healthyCount}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 rounded-xl text-sm bg-gray-800">
          <thead className="bg-gray-900 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-4 font-semibold text-gray-100 cursor-pointer hover:bg-gray-700 transition-colors duration-200 ${
                      header.column.getCanSort() ? "hover:bg-opacity-80" : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between w-full h-full">
                      <div className="flex items-center flex-1 min-w-0">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                      {header.column.getCanSort() && (
                        <div className="flex items-center ml-2 flex-shrink-0">
                          <div className="relative w-4 h-4">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="w-4 h-4 text-teal-400 absolute inset-0" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="w-4 h-4 text-teal-400 absolute inset-0" />
                            ) : (
                              <ArrowUp className="w-4 h-4 text-teal-400 opacity-30 absolute inset-0 rotate-180 transform" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <InstanceRow
                key={row.original.id}
                instance={row.original}
                index={row.index}
                isWaste={isWaste}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EC2Table;
