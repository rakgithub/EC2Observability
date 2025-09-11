export const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-300"
      style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        background: `linear-gradient(to right, ${
          value < 50 ? "#14b8a6" : value < 80 ? "#f59e0b" : "#ef4444"
        } 0%, ${
          value < 50 ? "#2dd4bf" : value < 80 ? "#fbbf24" : "#f87171"
        } 100%)`,
      }}
    ></div>
  </div>
);
