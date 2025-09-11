"use client";

import { CLASSIFIED_LOAD } from "@/constants/ec2Table";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps,
} from "recharts";
import { TooltipPayload } from "recharts/types/state/tooltipSlice";

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

function classifyLoad(values: number[]): { label: string; color: string } {
  if (values.length < 3) {
    return { label: CLASSIFIED_LOAD.COLLECTING_DATA, color: "text-gray-400" };
  }
  debugger;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  const slope = values[values.length - 1] - values[0];

  if (avg < 10 && variance < 5)
    return { label: CLASSIFIED_LOAD.IDLE, color: "text-red-400" };
  if (variance > 50)
    return { label: CLASSIFIED_LOAD.BUSTY, color: "text-yellow-400" };
  if (avg > 70)
    return { label: CLASSIFIED_LOAD.HIGH, color: "text-orange-400" };
  return {
    label: slope > 0 ? CLASSIFIED_LOAD.RISING : CLASSIFIED_LOAD.STABLE,
    color: "text-green-400",
  };
}

const Sparkline: React.FC<SparklineProps> = ({ data, color = "#4CAF50" }) => {
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

  const { label, color: labelColor } = useMemo(() => {
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
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
            <RechartsTooltip content={<ChartTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span className={`text-[10px] mt-1 ${labelColor}`}>{label}</span>
    </div>
  );
};

export default Sparkline;
