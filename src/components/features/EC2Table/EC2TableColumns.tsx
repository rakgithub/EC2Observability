"use client";

import Tooltip from "@/components/ui/Tooltip";
import { EC2Instance } from "@/types/ec2";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { Info } from "lucide-react";

const numericRangeFilter: FilterFn<EC2Instance> = (
  row: Row<EC2Instance>,
  columnId: string,
  filterValue: { from?: number; to?: number }
) => {
  if (!filterValue) return true;
  const value = row.getValue<number | undefined>(columnId);
  if (value === undefined) return false;
  const { from, to } = filterValue;
  if (from !== undefined && value < from) return false;
  if (to !== undefined && value > to) return false;
  return true;
};

const stringFilter: FilterFn<EC2Instance> = (
  row: Row<EC2Instance>,
  columnId: string,
  filterValue: string
) => {
  debugger;
  if (!filterValue) return true;
  const value = row.getValue<string>(columnId);
  return value.toLowerCase() === filterValue.toLowerCase();
};

export const EC2TableColumns: ColumnDef<EC2Instance>[] = [
  { header: "Instance ID", accessorKey: "id", enableSorting: true },
  {
    header: "Region",
    accessorKey: "region",
    enableSorting: true,
    filterFn: stringFilter,
  },
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
    accessorFn: (instance) => instance.cpu,
    id: "cpu-usage",
    enableSorting: true,
    filterFn: numericRangeFilter,
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
    accessorFn: (instance) => instance.ram,
    id: "ram-usage",
    enableSorting: true,
    filterFn: numericRangeFilter,
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
    accessorFn: (instance) => instance.gpu,
    id: "gpu-usage",
    enableSorting: true,
    filterFn: numericRangeFilter,
  },
  {
    header: () => (
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-100">Uptime (h)</span>
        </div>
      </div>
    ),
    // accessorKey: "computedUptimeHours",
    accessorKey: "computedUptimeHours",
    id: "computedUptimeHours",
    enableSorting: true,
    filterFn: numericRangeFilter,
  },
  {
    header: () => (
      <div className="flex items-center justify-between w-full">
        <span className="text-gray-100">Cost/hr</span>
      </div>
    ),
    accessorKey: "costPerHour",
    enableSorting: true,
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
];
