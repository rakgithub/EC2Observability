import { Table, flexRender } from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { EC2Instance } from "@/types/ec2";
import { useMemo } from "react";

// Define interfaces for range options
interface RangeOption {
  label: string;
  value: string;
}

interface RangeOptions {
  "cpu-usage": RangeOption[];
  "ram-usage": RangeOption[];
  "gpu-usage": RangeOption[];
  computedUptimeHours: RangeOption[];
}

interface EC2TableHeadProps {
  table: Table<EC2Instance>;
  preprocessedInstances: EC2Instance[];
  numericColumnIds: (keyof RangeOptions)[];
  rangeOptions: RangeOptions;
}

const RegionFilter = ({
  header,
  regionOptions,
}: {
  header: any;
  regionOptions: string[];
}) => {
  const filterValue = useMemo(
    () => (header.column.getFilterValue() as string | undefined) ?? "",
    [header.column.getFilterValue()]
  );
  return (
    <select
      className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 hover:bg-teal-900/50"
      value={filterValue}
      onChange={(e) =>
        header.column.setFilterValue(e.target.value || undefined)
      }
    >
      <option value="">All</option>
      {regionOptions.map((region) => (
        <option key={region} value={region}>
          {region}
        </option>
      ))}
    </select>
  );
};

const NumericFilter = ({
  header,
  rangeOptions,
}: {
  header: any;
  rangeOptions: RangeOption[];
}) => {
  const filterValue = useMemo(() => {
    const value = header.column.getFilterValue();
    if (typeof value === "object" && value !== null) {
      const { from, to } = value as { from?: number; to?: number };
      return from !== undefined && to !== undefined ? `${from},${to}` : "";
    }
    return (value as string) ?? "";
  }, [header.column.getFilterValue()]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      header.column.setFilterValue(undefined);
    } else {
      const [from, to] = value.split(",").map(Number);
      header.column.setFilterValue({ from, to });
    }
  };

  return (
    <select
      className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 hover:bg-teal-900/50"
      value={filterValue}
      onChange={handleChange}
    >
      {rangeOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const EC2TableHead: React.FC<EC2TableHeadProps> = ({
  table,
  preprocessedInstances,
  numericColumnIds,
  rangeOptions,
}) => {
  // Memoize regionOptions to prevent recomputation on every render
  const regionOptions = useMemo(
    () =>
      Array.from(new Set(preprocessedInstances.map((i) => i.region))).sort(),
    [preprocessedInstances]
  );

  return (
    <thead className="bg-gradient-to-r from-gray-900 to-gray-950 text-left">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className={`px-6 py-4 font-semibold text-gray-100 cursor-pointer hover:bg-teal-900/50 transition-all duration-200 ${
                header.column.getCanSort() ? "hover:bg-opacity-80" : ""
              }`}
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center flex-1 min-w-0">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </div>
                {header.column.getCanSort() && (
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <div className="relative w-4 h-4">
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="w-4 h-4 text-teal-400 absolute inset-0 transition-transform duration-200 hover:scale-110" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="w-4 h-4 text-teal-400 absolute inset-0 transition-transform duration-200 hover:scale-110" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-teal-400 opacity-30 absolute inset-0 rotate-180 transform transition-transform duration-200 hover:scale-110" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </th>
          ))}
        </tr>
      ))}
      <tr>
        {table.getHeaderGroups()[0].headers.map((header) => (
          <th key={header.id} className="px-6 py-3 border-t border-gray-700">
            {header.id === "region" ? (
              <RegionFilter header={header} regionOptions={regionOptions} />
            ) : numericColumnIds.includes(header.id) ? (
              <NumericFilter
                header={header}
                rangeOptions={rangeOptions[header.id as keyof RangeOptions]}
              />
            ) : null}
          </th>
        ))}
      </tr>
    </thead>
  );
};
