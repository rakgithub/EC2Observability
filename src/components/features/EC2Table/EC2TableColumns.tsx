"use client";

import Tooltip from "@/components/ui/Tooltip";
import { LABELS } from "@/constants/ec2Table";
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
  if (!filterValue) return true;
  const value = row.getValue<string>(columnId);
  return value.toLowerCase() === filterValue.toLowerCase();
};

export const EC2TableColumns: ColumnDef<EC2Instance>[] = [
  {
    header: LABELS.INSTANCE_ID,
    accessorKey: "id",
    enableSorting: true,
  },
  {
    header: LABELS.REGION,
    accessorKey: "region",
    enableSorting: true,
    filterFn: stringFilter,
  },
  { header: LABELS.TYPE, accessorKey: "type", enableSorting: true },
  {
    header: () => (
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-100">{LABELS.CPU_USAGE}</span>
          <Tooltip content={LABELS.CPU_USAGE_TOOLTIP}>
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
          <span className="text-gray-100">{LABELS.RAM_USAGE}</span>
          <Tooltip content={LABELS.RAM_USAGE_TOOLTIP}>
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
          <span className="text-gray-100">{LABELS.GPU_USAGE}</span>
          <Tooltip content={LABELS.GPU_USAGE_TOOLTIP}>
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
          <span className="text-gray-100">{LABELS.UPTIME}</span>
        </div>
      </div>
    ),
    accessorKey: "computedUptimeHours",
    id: "computedUptimeHours",
    enableSorting: true,
    filterFn: numericRangeFilter,
  },
  {
    header: () => (
      <div className="flex items-center justify-between w-full">
        <span className="text-gray-100">{LABELS.COST_PER_HOUR}</span>
      </div>
    ),
    accessorKey: "costPerHour",
    enableSorting: true,
  },
  {
    header: () => (
      <div className="flex items-center justify-between w-full">
        <span className="text-gray-100">{LABELS.STATUS}</span>
      </div>
    ),
    accessorKey: "status",
    enableSorting: true,
  },
  {
    header: () => (
      <div className="flex items-center justify-between w-full">
        <span className="text-gray-100">{LABELS.ACTION}</span>
      </div>
    ),
    accessorKey: "action",
  },
];
