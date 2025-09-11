"use client";

import { Table } from "@tanstack/react-table";

interface FilterBarProps {
  table: Table<any>;
}

const FilterBar: React.FC<FilterBarProps> = ({ table }) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = e.target.value ? Number(e.target.value) : undefined;
    table.getColumn("cpu-usage")?.setFilterValue((old: any = {}) => ({
      ...old,
      min,
    }));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = e.target.value ? Number(e.target.value) : undefined;
    table.getColumn("cpu-usage")?.setFilterValue((old: any = {}) => ({
      ...old,
      max,
    }));
  };
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* CPU Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-200">CPU %</label>
        <input type="number" placeholder="Min" onChange={handleMinChange} />
        <input type="number" placeholder="Max" onChange={handleMaxChange} />
      </div>

      {/* RAM Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-200">RAM %</label>
        <input
          type="number"
          placeholder="Min"
          className="bg-gray-700 text-white px-2 py-1 rounded w-16"
          onChange={(e) =>
            table.getColumn("ram")?.setFilterValue((old: any = {}) => ({
              ...old,
              min: e.target.value ? Number(e.target.value) : 0,
            }))
          }
        />
        <input
          type="number"
          placeholder="Max"
          className="bg-gray-700 text-white px-2 py-1 rounded w-16"
          onChange={(e) =>
            table.getColumn("ram")?.setFilterValue((old: any = {}) => ({
              ...old,
              max: e.target.value ? Number(e.target.value) : 100,
            }))
          }
        />
      </div>

      {/* Uptime Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-200">Uptime (h)</label>
        <input
          type="number"
          placeholder="Min"
          className="bg-gray-700 text-white px-2 py-1 rounded w-16"
          onChange={(e) =>
            table
              .getColumn("computedUptimeHours")
              ?.setFilterValue((old: any = {}) => ({
                ...old,
                min: Number(e.target.value),
              }))
          }
        />
        <input
          type="number"
          placeholder="Max"
          className="bg-gray-700 text-white px-2 py-1 rounded w-16"
          onChange={(e) =>
            table
              .getColumn("computedUptimeHours")
              ?.setFilterValue((old: any = {}) => ({
                ...old,
                max: Number(e.target.value),
              }))
          }
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-200">Status</label>
        <select
          className="bg-gray-700 text-white px-2 py-1 rounded"
          onChange={(e) =>
            table.getColumn("status")?.setFilterValue(e.target.value)
          }
        >
          <option value="">All</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
