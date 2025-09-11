"use client";

import { EC2Instance } from "@/types/ec2";
import useSWR from "swr";
import {
  ArrowUp,
  ArrowDown,
  ChartNoAxesColumn,
  AlertCircle,
  Activity,
  CheckCircle,
} from "lucide-react";
import Skeleton from "../../ui/Skeleton";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import InstanceRow from "./InstanceRow";
import { useMemo, useState } from "react";
import { EC2TableColumns as columns } from "./EC2TableColumns";
import { useError } from "@/context/ErrorProvider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fetchMetricsForInstance = async (
  instance: EC2Instance
): Promise<EC2Instance> => {
  const [cpuMetrics, ramMetrics, gpuMetrics] = await Promise.all([
    fetcher(`/api/metrics?id=${instance.id}&metric=CPUUtilization`),
    fetcher(`/api/metrics?id=${instance.id}&metric=MemoryUtilization`),
    fetcher(`/api/metrics?id=${instance.id}&metric=GPUUtilization`),
  ]);

  const getLatestMetric = (metrics: MetricDatapoint[]) => {
    if (!metrics || metrics.length === 0) return undefined;
    const latest = metrics.sort(
      (a, b) =>
        new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
    )[0];
    return latest?.Average;
  };

  return {
    ...instance,
    cpu: getLatestMetric(cpuMetrics),
    ram: getLatestMetric(ramMetrics),
    gpu: getLatestMetric(gpuMetrics),
  };
};

const preprocessInstances = async (
  instances: EC2Instance[]
): Promise<EC2Instance[]> => {
  const instancesWithMetrics = await Promise.all(
    instances.map(async (instance) => {
      const now = new Date().getTime();
      const uptimeHours = instance.launchTime
        ? (now - new Date(instance.launchTime).getTime()) / (1000 * 60 * 60)
        : instance.uptimeHours || 0;

      const instanceWithUptime = {
        ...instance,
        computedUptimeHours: uptimeHours,
      };
      return fetchMetricsForInstance(instanceWithUptime);
    })
  );
  return instancesWithMetrics;
};

interface RangeOption {
  label: string;
  value: string;
}

interface RangeOptions {
  "cpu-usage": RangeOption[];
  "ram-usage": RangeOption[];
  "gpu-usage": RangeOption[];
  computedUptimeHours: RangeOption[];
}

const EC2Table: React.FC = () => {
  const { data, error, isLoading } = useSWR<{ instances: EC2Instance[] }>(
    "/api/instances",
    fetcher,
    {
      refreshInterval: 30000,
      dedupingInterval: 2000,
    }
  );

  // const instances = useMemo(
  //   () => preprocessInstances(data?.instances || []),
  //   [data?.instances]
  // );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [preprocessedInstances, setPreprocessedInstances] = useState<
    EC2Instance[]
  >([]);
  const [isDataProcessing, setIsDataProcessing] = useState(false);
  const { showError } = useError();

  useMemo(() => {
    if (data?.instances && !isDataProcessing) {
      setIsDataProcessing(true);
      preprocessInstances(data.instances).then((updatedInstances) => {
        setPreprocessedInstances(updatedInstances);
        setIsDataProcessing(false);
      });
    }
  }, [data?.instances]);

  const table = useReactTable({
    data: preprocessedInstances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

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
        <p className="text-gray-300 mb-4">
          Something went wrong while fetching the data. Please try again.
        </p>
      </div>
    );
  }
  const isWaste = (cpu: number, uptimeHours: number | undefined): boolean => {
    if (cpu === undefined || uptimeHours === undefined) return false;
    return cpu < 15 && uptimeHours > 24;
  };

  const idleCount = preprocessedInstances.filter(
    (i) => i.cpu && i.cpu < 15
  ).length;
  const busyCount = preprocessedInstances.filter(
    (i) => i.cpu && i.cpu > 70
  ).length;
  const healthyCount = preprocessedInstances.length - idleCount - busyCount;

  const numericColumnIds: (keyof RangeOptions)[] = [
    "cpu-usage",
    "ram-usage",
    "gpu-usage",
    "computedUptimeHours",
  ];

  const rangeOptions: RangeOptions = {
    "cpu-usage": [
      { label: "All", value: "" },
      { label: "Idle (<15%)", value: "0,15" },
      { label: "Healthy (15–70%)", value: "15,70" },
      { label: "Busy (>70%)", value: "70,100" },
    ],
    "ram-usage": [
      { label: "All", value: "" },
      { label: "Idle (<15%)", value: "0,15" },
      { label: "Healthy (15–70%)", value: "15,70" },
      { label: "Busy (>70%)", value: "70,100" },
    ],
    "gpu-usage": [
      { label: "All", value: "" },
      { label: "Idle (<15%)", value: "0,15" },
      { label: "Healthy (15–70%)", value: "15,70" },
      { label: "Busy (>70%)", value: "70,100" },
    ],
    computedUptimeHours: [
      { label: "All", value: "" },
      { label: "Short-term (<24h)", value: "0,24" },
      { label: "Standard Workload (1-7 days)", value: "24,168" },
      { label: "Long-term (>1 week)", value: "168,999999" },
    ],
  };
  const regionOptions = Array.from(
    new Set(preprocessedInstances.map((i) => i.region))
  ).sort();

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-teal-500/50">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-2 bg-gray-900 rounded-lg">
          <ChartNoAxesColumn className="w-6 h-6 text-teal-400 transition-transform duration-200 hover:scale-110" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            EC2 Instance Utilisation
          </h2>
          <p className="text-sm text-gray-400">
            Total: {data?.instances.length} instances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-md text-center transition-all duration-300 hover:shadow-teal-500/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-gray-400">Idle Instances</p>
          </div>
          <p className="text-xl font-bold text-red-400">{idleCount}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-md text-center transition-all duration-300 hover:shadow-teal-500/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-400">Busy Instances</p>
          </div>
          <p className="text-xl font-bold text-yellow-400">{busyCount}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-xl shadow-md text-center transition-all duration-300 hover:shadow-teal-500/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-400">Healthy Instances</p>
          </div>
          <p className="text-xl font-bold text-green-400">{healthyCount}</p>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-teal-400 hover:scrollbar-thumb-teal-300 scrollbar-track-rounded scrollbar-thumb-rounded">
        <table className="min-w-full border border-gray-700 rounded-xl text-sm bg-gray-800">
          <thead className="bg-gradient-to-r from-gray-900 to-gray-950 text-left">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-4 font-semibold text-gray-100 cursor-pointer hover:bg-teal-900/50 transition-all duration-200 ${
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
                              <ArrowUp className="w-4 h-4 text-teal-400 absolute inset-0 transition-transform duration-200 hover:scale-110" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="w-4 h-4 text-teal-400 absolute inset-0 transition-transform duration-200 hover:scale-110" />
                            ) : (
                              <ArrowUp className="w-4 h-4 text-teal-400 opacity-30 absolute inset-0 rotate-180 transform transition-transform duration-200 hover:scale-110" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
            <tr>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 border-t border-gray-700"
                >
                  {header.id === "region" ? (
                    <select
                      className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 hover:bg-teal-900/50"
                      value={(header.column.getFilterValue() as string) ?? ""}
                      onChange={(e) =>
                        header.column.setFilterValue(
                          e.target.value || undefined
                        )
                      }
                    >
                      <option value="">All</option>
                      {regionOptions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  ) : numericColumnIds.includes(header.id) ? (
                    <select
                      className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 hover:bg-teal-900/50"
                      value={
                        typeof header.column.getFilterValue() === "object"
                          ? (
                              header.column.getFilterValue() as {
                                from?: number;
                                to?: number;
                              }
                            )?.from +
                            "," +
                            (
                              header.column.getFilterValue() as {
                                from?: number;
                                to?: number;
                              }
                            )?.to
                          : (header.column.getFilterValue() as string) ?? ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) {
                          header.column.setFilterValue(undefined);
                        } else {
                          const [from, to] = value.split(",").map(Number);
                          header.column.setFilterValue({ from, to });
                        }
                      }}
                    >
                      {rangeOptions[header.id as keyof RangeOptions].map(
                        (option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preprocessedInstances.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="text-center py-6 text-gray-400 text-lg font-medium bg-gray-800"
                >
                  No data available
                </td>
              </tr>
            ) : (
              table
                .getRowModel()
                .rows.map((row) => (
                  <InstanceRow
                    key={row.original.id}
                    instance={row.original}
                    index={row.index}
                    isWaste={isWaste}
                    actionClassName="bg-teal-500 hover:bg-teal-400 text-white font-medium py-1 px-3 rounded-md shadow-sm hover:shadow-teal-500/50 transition-all duration-200"
                  />
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EC2Table;
