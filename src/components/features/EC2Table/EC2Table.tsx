"use client";

import { EC2Instance } from "@/types/ec2";
import useSWR from "swr";
import { TrendingUp } from "lucide-react";
import InstanceRow from "./InstanceRow";
import Skeleton from "../../ui/Skeleton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EC2Table: React.FC = () => {
  const { data, error, isLoading } = useSWR<{ instances: EC2Instance[] }>(
    "/api/instances",
    fetcher,
    {
      refreshInterval: 30000, // auto-refresh every 30 seconds
    }
  );

  if (isLoading)
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 dark:text-red-400">
        Failed to load instances
      </div>
    );

  const instances = data?.instances || [];

  const isWaste = (cpu: number, uptimeHours: number | undefined): boolean => {
    if (cpu === undefined || uptimeHours === undefined) return false;
    return cpu < 15 && uptimeHours < 24;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <TrendingUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            EC2 Instance Utilisation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {instances.length} instances
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm shadow-md">
          <thead className="bg-gray-100 dark:bg-gray-900 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                Instance ID
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                Region
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                Type
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                CPU %
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                RAM %
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                Uptime (h)
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                Cost/hr
              </th>
              <th className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {instances?.map((inst: EC2Instance, index) => (
              <InstanceRow
                key={inst.id}
                instance={inst}
                index={index}
                isWaste={isWaste}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EC2Table;
