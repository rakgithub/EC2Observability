"use client";

import { CLASSIFIED_LOAD, LOAD_TOOLTIP_DETAILS } from "@/constants/ec2Table";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
} from "recharts";
import { TooltipPayload } from "recharts/types/state/tooltipSlice";
import Tooltip from "./Tooltip";
import { Info } from "lucide-react";
import { COLORS } from "../features/cloudCost/utils";

interface SparklineProps {
  data: { Timestamp: string; Average: number }[];
 color?: string;
}

interface ChartPoint {
  value: number;
  ts: string;
}

type MyTooltipPayload = TooltipPayload & { payload: ChartPoint };

// Extend TooltipProps to override payload type
type MyTooltipProps = Omit<TooltipProps<number, string>, "payload"> & {
  payload?: MyTooltipPayload[];
};

const ChartTooltip: React.FC<MyTooltipProps> = ({ payload }) => {
  if (!payload || payload.length === 0) return null;

  const point = payload[0].payload; // strongly typed as ChartPoint

  return (
    <div className="bg-gray-800 text-gray-100 px-2 py-1 rounded text-xs shadow">
      <div>{point.ts}</div>
      <div>{point.value.toFixed(2)}%</div>
    </div>
  );
};


function classifyLoad(values: number[]): { key: string, label: string; color: string } {
  // WHEN NOT ENOUGH DATA
  if (values.length < 3) {
    return { key: "STABLE", label: CLASSIFIED_LOAD.COLLECTING_DATA, color: "text-green-400" };
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length);
  const slope = values[values.length - 1] - values[0];

  // Check for idle state
  if (avg < 5 && stdDev < 2)
    return { key: "IDLE", label: CLASSIFIED_LOAD.IDLE, color: "text-gray-400" };

  // Check for bursty behavior
  if (stdDev > avg * 0.5) 
    return { key: "BUSTY", label: CLASSIFIED_LOAD.BUSTY, color: "text-yellow-400" };

  // Check for high, 
  if (avg > 70) 
    return { key: "HIGH", label: CLASSIFIED_LOAD.HIGH, color: "text-orange-400" };

  // Default to stable,
  return {
    key: "STABLE",
    label: slope > 0 ? CLASSIFIED_LOAD.RISING : CLASSIFIED_LOAD.STABLE,
    color: "text-green-400",
  };
}

const Sparkline: React.FC<SparklineProps> = ({ data}) => {
  const chartData = useMemo<ChartPoint[]>(
    () =>
      data?.slice(-20).map((d) => ({
        value: d.Average,
        ts: new Date(d.Timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })) ?? [],
    [data]
  );

  const { key,label, color: labelColor } = useMemo(() => {
    const values = chartData.map((d) => d.value);
    return classifyLoad(values);
  }, [chartData]);

  return (
    <div className="flex flex-col items-center w-28">
      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS[key]}
              strokeWidth={2}
              dot={false}
            />
            <RechartsTooltip content={<ChartTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
       <div className={`flex items-center gap-1 text-[10px] mt-1 ${labelColor}`}>
         <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
        <Tooltip content={LOAD_TOOLTIP_DETAILS[key as keyof typeof LOAD_TOOLTIP_DETAILS] || "No description available"}>
          <Info className="w-3 h-3 text-gray-400 cursor-help" />
        </Tooltip>
      </div>
    </div>
  );
};

export default Sparkline;
