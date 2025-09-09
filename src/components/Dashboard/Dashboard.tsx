import { CheckCircle } from "lucide-react";
import CostAttributionPanel from "../features/CloudCost/CostAttributionPanel";
import CloudCostOverview from "../features/CloudCost/CloudCostOverview";
import EC2Table1 from "../features/EC2Table/EC2Table1";

const Dashboard: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <header className="mb-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-teal-500 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                EC2 Cost Dashboard
              </h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                Optimize Your Cloud Resources
              </p>
            </div>
          </div>
        </div>
      </header>
      <section>
        <CloudCostOverview />
      </section>
      <section>
        <CostAttributionPanel />
      </section>
      <section>
        <EC2Table1 />
      </section>
    </main>
  );
};

export default Dashboard;
