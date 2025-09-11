import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const BarCostChart = ({
  data,
  colors,
}: {
  data: any[];
  colors: string[];
}) => (
  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
    <XAxis dataKey="name" stroke="#D1D5DB" />
    <YAxis tickFormatter={(v) => `$${v.toFixed(2)}`} stroke="#D1D5DB" />
    <Tooltip
      content={<CustomTooltip />}
      contentStyle={{
        border: "none",
        backgroundColor: "transparent",
      }}
      itemStyle={{ color: "#D1D5DB" }}
      cursor={{ fill: "transparent" }}
    />
    <Bar dataKey="cost">
      {data.map((_, i) => (
        <Cell key={i} fill={colors[i % colors.length]} />
      ))}
    </Bar>
  </BarChart>
);
