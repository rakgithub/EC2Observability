import { ChartNoAxesColumn } from "lucide-react";

const TableHeader = ({ totalCount }: { totalCount: number }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="p-2 bg-gray-900 rounded-lg">
      <ChartNoAxesColumn className="w-6 h-6 text-teal-400 transition-transform duration-200 hover:scale-110" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-100">
        EC2 Instance Utilisation
      </h2>
      <p className="text-sm text-gray-400">Total: {totalCount} instances</p>
    </div>
  </div>
);

export default TableHeader;
