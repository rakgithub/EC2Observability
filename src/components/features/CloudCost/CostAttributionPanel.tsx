"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import ToggleGroup from "@/components/ui/ToggleGroup";
import { BarCostChart } from "@/components/charts/BarCostChart";
import { PieCostChart } from "@/components/charts/PieCostChart";
import { CustomTooltip } from "@/components/charts/CustomTooltip";
import { useError } from "@/context/ErrorProvider";

const LoadingOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-xl z-[1000]">
    <div className="w-1/2 h-2 bg-gray-700 rounded-full overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400 to-teal-600 animate-[loading_1.5s_infinite]" />
    </div>
  </div>
);

const CostAttributionPanel: React.FC = () => {
  const [dimension, setDimension] = useState<"region" | "type" | "job">(
    "region"
  );
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "lastMonth">("7d");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { showError } = useError();
  const { data, error, isLoading } = useCosts(timeRange);

  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    if (!initialLoad.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }
  }, [timeRange]);

  const byRegion = data?.byRegion ?? [];
  const byType = data?.byType ?? [];
  const byJob = data?.byJob ?? [];
  const totalSpend = data?.totalSpend ?? 0;

  const attributedCost = useMemo(() => {
    const currentData =
      dimension === "region" ? byRegion : dimension === "type" ? byType : byJob;
    return currentData.reduce((sum, item) => sum + item.cost, 0);
  }, [dimension, byRegion, byType, byJob]);

  const unaccountedCost = totalSpend - attributedCost;
  const isUnaccounted = unaccountedCost > 0.01;

  const chartData = useMemo(() => {
    const baseData =
      dimension === "region" ? byRegion : dimension === "type" ? byType : byJob;

    // Filter out groups with zero or very low cost to keep the chart clean.
    // const filteredData = baseData.filter((item) => item.cost > 0.01);

    // Add the "Unattributed" slice to the data array if it exists.
    if (isUnaccounted) {
      // Ensure "Unattributed" is the last entry for consistent coloring.
      return [...baseData, { name: "Unattributed", cost: unaccountedCost }];
    }
    return baseData;
  }, [dimension, byRegion, byType, byJob, unaccountedCost, isUnaccounted]);

  const chartColors = [
    "#14b8a6", // Tailwind teal-500
    "#60a5fa", // Tailwind blue-400
    "#34d399", // Tailwind emerald-400
    "#facc15", // Tailwind yellow-400
    "#f87171", // Tailwind red-400
    "#a3a3a3", // A neutral gray for unaccounted costs
    "#8b5cf6", // Tailwind violet-500
    "#ec4899", // Tailwind pink-500
    "#22d3ee", // Tailwind cyan-400
    "#e879f9", // Tailwind fuchsia-400
  ];
  const totalCost = useMemo(
    () => chartData.reduce((sum, item) => sum + item.cost, 0),
    [chartData]
  );
  const attributed = totalCost;
  const unaccounted = totalCost - attributed;

  if (initialLoad.current && isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6">
        <Skeleton className="h-8 w-40 mb-4 bg-gray-700" />
        <Skeleton className="h-80 w-full rounded-xl bg-gray-700" />
      </div>
    );
  }
  if (error) {
    showError(`Failed to load costs: ${error.message}`);
    return (
      <div className="mb-6 p-6 bg-gray-800 dark:bg-gray-900 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          Unable to Load Cloud Attribution
        </h2>
        <p className="text-gray-300 mb-4">
          Something went wrong while fetching the data. Please try again.
        </p>
      </div>
    );
  }
  const showOverlay =
    isTransitioning || (!data && !error && !initialLoad.current);
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-teal-500/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-teal-400 transition-transform duration-200 hover:scale-110" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">
              Cost Attribution
            </h2>
            <p className="text-sm text-gray-400">
              {dimension === "region"
                ? "Breakdown of EC2 costs by AWS region."
                : dimension === "type"
                ? "Breakdown of EC2 costs by instance type."
                : "Breakdown of EC2 costs by research job/team (tags)."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 transition-all duration-200 hover:bg-teal-900/50">
            <ToggleGroup
              value={dimension}
              onChange={setDimension}
              options={[
                { value: "region", label: "Region" },
                { value: "type", label: "Instance" },
                { value: "job", label: "Job/Team" },
              ]}
            />
          </div>

          <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 transition-all duration-200 hover:bg-teal-900/50">
            <ToggleGroup
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: "chart", label: "Chart" },
                { value: "table", label: "Table" },
              ]}
            />
          </div>

          <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 transition-all duration-200 hover:bg-teal-900/50">
            <ToggleGroup
              value={chartType}
              onChange={setChartType}
              options={[
                {
                  value: "bar",
                  label: "Bar",
                  icon: <BarChart3 className="w-4 h-4 text-teal-400" />,
                  disabled: viewMode === "table",
                },
                {
                  value: "pie",
                  label: "Pie",
                  icon: <PieChartIcon className="w-4 h-4 text-teal-400" />,
                  disabled: viewMode === "table",
                },
              ]}
            />
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 rounded-md text-sm font-medium border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 hover:bg-teal-900/50"
          >
            <option value="7d" className="bg-gray-900 text-gray-100">
              Last 7 days
            </option>
            <option value="30d" className="bg-gray-900 text-gray-100">
              This Month
            </option>
            <option value="lastMonth" className="bg-gray-900 text-gray-100">
              Last Month
            </option>
          </select>
        </div>
      </div>

      {viewMode === "chart" ? (
        <div className="relative h-[360px] w-full bg-gray-900 rounded-xl shadow-md">
          {showOverlay && <LoadingOverlay />}
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis
                  tickFormatter={(v) => `$${v.toFixed(2)}`}
                  stroke="#9CA3AF"
                />
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
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip isPie={true} />}
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
      ) : (
        <table className="min-w-full text-sm border border-gray-700 rounded-xl overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
          <thead className="bg-gradient-to-r from-gray-900 to-gray-950">
            <tr className="text-left">
              <th className="px-3 py-2 text-gray-100 font-bold">
                {dimension === "region"
                  ? "Region"
                  : dimension === "type"
                  ? "Instance Type"
                  : "Job/Team"}
              </th>
              <th className="px-3 py-2 text-gray-100 font-bold">Cost</th>
              <th className="px-3 py-2 text-gray-100 font-bold">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item) => (
              <tr
                key={item.name}
                className="border-t border-gray-700 hover:bg-teal-900/30 transition-all duration-200"
              >
                <td className="px-3 py-2 text-gray-100">{item.name}</td>
                <td className="px-3 py-2 text-gray-100">
                  ${item.cost.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-gray-100">
                  {((item.cost / (totalCost || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!showOverlay && (
        <div className="mt-1 text-xs text-gray-400">
          Total: ${totalCost.toFixed(2)} (Attributed: ${attributed.toFixed(2)},
          Unaccounted: ${unaccounted.toFixed(2)})
        </div>
      )}
      {chartData.length > 0 && (
        <div className="mt-1 text-sm text-teal-400">
          {dimension === "region"
            ? `Highest spend is in ${chartData[0].name}, likely where most jobs ran.`
            : `Most costs are from ${chartData[0].name} instances, likely reflecting compute needs.`}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {chartData.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-lg transition-all duration-300 hover:shadow-teal-500/50"
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
