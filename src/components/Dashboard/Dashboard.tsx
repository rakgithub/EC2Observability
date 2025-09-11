import { CheckCircle } from "lucide-react";
import CloudCostOverview from "../features/CloudCost/CloudCostOverview";
import EC2Table from "../features/EC2Table/EC2Table";
import CostAttributionPanel from "../features/CostAttribution/CostAttributionPanel";

const Dashboard: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 p-6 transition-all duration-300 max-w-full overflow-x-hidden">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-teal-500/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-900 rounded-full ring-2 ring-teal-400">
              <CheckCircle className="w-6 h-6 text-teal-400 transition-transform duration-200 hover:scale-110" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100 tracking-tight leading-tight">
                EC2 Cost Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1 uppercase tracking-wide">
                Optimize Your Cloud Resources
              </p>
            </div>
          </div>
        </div>
      </header>
      <section className="mb-6">
        <CloudCostOverview />
      </section>
      <section className="mb-6">
        <CostAttributionPanel />
      </section>
      <section>
        <EC2Table />
      </section>
    </main>
  );
};

export default Dashboard;
