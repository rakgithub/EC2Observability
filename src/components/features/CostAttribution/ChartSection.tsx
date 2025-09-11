"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { chartColors } from "./utils";

interface ChartDataItem {
  name: string;
  cost: number;
}

interface ChartSectionProps {
  chartData: ChartDataItem[];
  chartType: "bar" | "pie";
  showOverlay: boolean;
  chartColors?: string[];
}

const LoadingOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-xl z-[1000]">
    <div className="w-1/2 h-2 bg-gray-700 rounded-full overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400 to-teal-600 animate-[loading_1.5s_infinite]" />
    </div>
  </div>
);

const ChartSection: React.FC<ChartSectionProps> = ({
  chartData,
  chartType,
  showOverlay,
}) => {
  return (
    <div className="relative h-[360px] w-full">
      {showOverlay && <LoadingOverlay />}

      <ResponsiveContainer width="100%" height="100%">
        {chartType === "bar" ? (
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis tickFormatter={(v) => `$${v.toFixed(2)}`} stroke="#9CA3AF" />
            <Tooltip
              content={<CustomTooltip />}
              contentStyle={{
                border: "1px solid #374151",
                backgroundColor: "#111827",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#F3F4F6" }}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="cost">
              {chartData.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              dataKey="cost"
              label={({ name, percent }) =>
                `${name} ${(percent ?? 0 * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={chartColors[i % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip isPie />}
              contentStyle={{
                border: "1px solid #374151",
                backgroundColor: "#111827",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#F3F4F6" }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartSection;
