interface LegendItem {
  name: string;
  cost: number;
}

interface LegendProps {
  chartData: LegendItem[];
  chartColors: string[];
}

const Legend: React.FC<LegendProps> = ({ chartData, chartColors }) => {
  return (
    <div className="w-full flex flex-row gap-4 justify-center flex-wrap px-4">
      {chartData.map((item, i) => (
        <div
          key={item.name}
          className="flex items-center gap-2 p-2 bg-gray-900 border border-gray-700 rounded-md transition-all duration-200 hover:bg-teal-900/30 min-w-[120px]"
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
  );
};

export default Legend;
