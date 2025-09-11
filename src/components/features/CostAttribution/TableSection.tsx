import { LABELS } from "@/constants/cloudCost";
import { Dimension } from "@/types/cost";
import { ChartDataItem } from "@/types/ec2";

interface TableSectionProps {
  chartData: ChartDataItem[];
  totalCost: number;
  dimension: Dimension;
}

const TableSection: React.FC<TableSectionProps> = ({
  chartData,
  totalCost,
  dimension,
}) => (
  <table className="min-w-full text-sm border border-gray-700 rounded-xl overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
    <thead className="bg-gradient-to-r from-gray-900 to-gray-950">
      <tr className="text-left">
        <th className="px-3 py-2 text-gray-100 font-bold">
          {dimension === "region"
            ? LABELS.REGION
            : dimension === "type"
            ? LABELS.INSTANCE_TYPE
            : LABELS.JOB_TEAM}
        </th>
        <th className="px-3 py-2 text-gray-100 font-bold">{LABELS.COST}</th>
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
          <td className="px-3 py-2 text-gray-100">${item.cost.toFixed(2)}</td>
          <td className="px-3 py-2 text-gray-100">
            {((item.cost / (totalCost || 1)) * 100).toFixed(1)}%
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TableSection;
