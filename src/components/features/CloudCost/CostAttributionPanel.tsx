"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
  TrendingUp,
} from "lucide-react";
import { useCosts } from "@/hooks/useCosts";
import Skeleton from "../../ui/Skeleton";
import { TimeRange } from "@/types/cost";

const CostAttributionPanel: React.FC = () => {
  const [dimension, setDimension] = useState<"region" | "type">("region");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const { data, error, isLoading } = useCosts(timeRange);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-md p-6">
        <Skeleton className="h-8 w-40 mb-4 bg-gray-700" />
        <Skeleton className="h-80 w-full rounded-xl bg-gray-700" />
      </div>
    );
  }
  if (error)
    return <div className="text-red-400">Failed to load cost attribution</div>;

  const byRegion = data?.byRegion ?? [];
  const byType = data?.byType ?? [];
  const chartData = dimension === "region" ? byRegion : byType;
  const chartColors = ["#60a5fa", "#34d399", "#facc15", "#f87171", "#a78bfa"];
  const totalCost = chartData.reduce((sum, item) => sum + item.cost, 0);
  const attributed = chartData.reduce((sum, item) => sum + item.cost, 0);
  const unaccounted = totalCost - attributed;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const barColor =
        chartColors[
          chartData.findIndex((d) => d.name === label) % chartColors.length
        ];
      return (
        <div
          className="border border-gray-600 rounded-lg p-3 shadow-md"
          style={{ backgroundColor: barColor + "40", color: "#ffffff" }}
        >
          <p className="text-white font-medium">{label}</p>
          <p className="text-white text-sm">{`Cost: $${payload[0].value.toLocaleString()}`}</p>
          <p className="text-white text-xs">{`${(
            (payload[0].value / totalCost) *
            100
          ).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const sliceColor =
        chartColors[
          chartData.findIndex((d) => d.name === payload[0].name) %
            chartColors.length
        ];
      return (
        <div
          className="border border-gray-600 rounded-lg p-3 shadow-md"
          style={{ backgroundColor: sliceColor + "40", color: "#ffffff" }}
        >
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-white text-sm">{`Cost: $${payload[0].value.toLocaleString()}`}</p>
          <p className="text-white text-xs">{`${(
            (payload[0].value / totalCost) *
            100
          ).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500 rounded-full">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Cost Attribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dimension === "region"
                ? "Breakdown of your EC2 costs by AWS region."
                : "Breakdown of your EC2 costs by instance type."}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {dimension === "region"
                ? "Helps you see which data centers your compute jobs are running in."
                : "Helps you see which machine types (CPU/GPU) are driving costs."}
            </p>
          </div>
        </div>
        {/* Toggles */}
        <div className="flex gap-3">
          {/* Dimension toggle */}
          <div className="flex bg-gray-700 border border-gray-600 rounded-lg p-1">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                dimension === "region"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setDimension("region")}
            >
              <BarChart3 className="w-4 h-4" />
              Region
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                dimension === "type"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setDimension("type")}
            >
              <PieChartIcon className="w-4 h-4" />
              Instance
            </button>
          </div>
          {/* View mode toggle */}
          <div className="flex bg-gray-700 border border-gray-600 rounded-lg p-1">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                viewMode === "chart"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setViewMode("chart")}
            >
              <BarChart3 className="w-4 h-4" />
              Chart
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                viewMode === "table"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="w-4 h-4" />
              Table
            </button>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
      </div>
      {viewMode === "chart" ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 h-80">
          {dimension === "region" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#4b5563"
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v.toFixed(2)}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{ zIndex: 1000 }}
                />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  dataKey="cost"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={chartColors[i % chartColors.length]}
                      stroke={chartColors[i % chartColors.length]}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<PieTooltip />}
                  wrapperStyle={{ zIndex: 1000 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <table className="min-w-full text-sm text-gray-100">
            <thead className="bg-gray-800">
              <tr className="text-left">
                <th className="px-4 py-2 font-semibold">
                  {dimension === "region" ? "Region" : "Instance Type"}
                </th>
                <th className="px-4 py-2 font-semibold">Cost</th>
                <th className="px-4 py-2 font-semibold">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr
                  key={item.name}
                  className="border-t border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">${item.cost.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {((item.cost / (totalCost || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Totals and Insight */}
      <div className="mt-1 text-xs text-gray-300">
        Total: ${totalCost.toFixed(2)} (Attributed: ${attributed.toFixed(2)},
        Unaccounted: ${unaccounted.toFixed(2)})
      </div>
      {chartData.length > 0 && (
        <div className="mt-1 text-sm text-teal-400">
          {dimension === "region"
            ? `Highest spend is in ${chartData[0].name}, likely where most jobs ran.`
            : `Most costs are from ${chartData[0].name} instances, likely reflecting compute needs.`}
        </div>
      )}
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {chartData.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-2 p-3 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColors[i % chartColors.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-400">${item.cost.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostAttributionPanel;
