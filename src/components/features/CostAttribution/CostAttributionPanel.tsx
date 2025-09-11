"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCosts } from "@/hooks/useCosts";
import Skeleton from "../../ui/Skeleton";
import { useError } from "@/context/ErrorProvider";
import { ERROR_MESSAGES, LABELS } from "@/constants/cloudCost";
import ErrorMessage from "@/components/ui/ErrorMessage";
import CostAttributionHeader from "./CostAttributionHeader";
import { ChartType, Dimension, TimeRange, ViewMode } from "@/types/cost";
import TableSection from "./TableSection";
import FooterSection from "./FooterSection";
import ChartSection from "./ChartSection";

const CostAttributionPanel: React.FC = () => {
  const [dimension, setDimension] = useState<"region" | "type" | "job">(
    "region"
  );
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
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

  const byRegion = useMemo(() => data?.byRegion ?? [], [data]);
  const byType = useMemo(() => data?.byType ?? [], [data]);
  const byJob = useMemo(() => data?.byJob ?? [], [data]);
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

    if (isUnaccounted) {
      return [
        ...baseData,
        { name: LABELS.UNATTRIBUTED, cost: unaccountedCost },
      ];
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

  const showOverlay =
    isTransitioning || (!data && !error && !initialLoad.current);

  const onDimensionChange = useCallback(
    (val: Dimension) => setDimension(val),
    []
  );
  const onViewModeChange = useCallback((val: ViewMode) => setViewMode(val), []);
  const onChartTypeChange = useCallback(
    (val: ChartType) => setChartType(val),
    []
  );
  const onTimeRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setTimeRange(e.target.value as TimeRange),
    []
  );

  if (initialLoad.current && isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6">
        <Skeleton className="h-8 w-40 mb-4 bg-gray-700" />
        <Skeleton className="h-80 w-full rounded-xl bg-gray-700" />
      </div>
    );
  }

  if (error) {
    showError(
      ERROR_MESSAGES.LOAD_COSTS.replace("{errorMessage}", error.message)
    );
    return (
      <ErrorMessage
        title={LABELS.UNABLE_TO_LOAD_COSTS}
        description={LABELS.ERROR_MESSAGE}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-teal-500/50">
      <CostAttributionHeader
        dimension={dimension}
        viewMode={viewMode}
        chartType={chartType}
        timeRange={timeRange}
        onDimensionChange={onDimensionChange}
        onViewModeChange={onViewModeChange}
        onChartTypeChange={onChartTypeChange}
        onTimeRangeChange={onTimeRangeChange}
      />

      {viewMode === "chart" ? (
        <ChartSection
          chartData={chartData}
          chartColors={chartColors}
          chartType={chartType}
          showOverlay={showOverlay}
        />
      ) : (
        <TableSection
          chartData={chartData}
          totalCost={totalCost}
          dimension={dimension}
        />
      )}
      <FooterSection
        viewMode={viewMode}
        showOverlay={showOverlay}
        totalCost={totalCost}
        attributed={totalCost}
        unaccounted={unaccountedCost}
        chartData={chartData}
        dimension={dimension}
      />
    </div>
  );
};

export default CostAttributionPanel;
