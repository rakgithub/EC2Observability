"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

interface SparklineProps {
  data: { Timestamp: string; Average: number }[];
  color?: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color = "#4CAF50" }) => {
  const chartData =
    data?.slice(-20).map((d) => ({
      value: d.Average,
      ts: new Date(d.Timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })) || [];

  let label = "Collecting data...";
  let labelColor = "text-gray-400";
  if (chartData.length >= 3) {
    const values = chartData.map((d) => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
    const slope = values[values.length - 1] - values[0];

    if (avg < 10 && variance < 5) {
      label = "Idle (flat)";
      labelColor = "text-red-400";
    } else if (variance > 50) {
      label = "Bursty workload";
      labelColor = "text-yellow-400";
    } else if (avg > 70) {
      label = "Consistently high load";
      labelColor = "text-orange-400";
    } else {
      label = slope > 0 ? "Rising usage" : "Stable";
      labelColor = "text-green-400";
    }
  }

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
            {/* Tooltip with timestamp + value */}
            <RechartsTooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-gray-800 text-gray-100 px-2 py-1 rounded text-xs shadow">
                      <div>{p.ts}</div>
                      <div>{p.value.toFixed(2)}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span className={`text-[10px] mt-1 ${labelColor}`}>{label}</span>
    </div>
  );
};

export default Sparkline;
