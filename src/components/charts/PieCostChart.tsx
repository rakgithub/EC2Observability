import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const PieCostChart = ({
  data,
  colors,
}: {
  data: any[];
  colors: string[];
}) => (
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      outerRadius={120}
      innerRadius={60}
      dataKey="cost"
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      labelLine={false}
    >
      {data.map((_, i) => (
        <Cell key={i} fill={colors[i % colors.length]} />
      ))}
    </Pie>
    <Tooltip
      content={<CustomTooltip isPie={true} />}
      contentStyle={{
        border: "none",
        backgroundColor: "transparent",
      }}
      itemStyle={{ color: "#D1D5DB" }}
    />
  </PieChart>
);
