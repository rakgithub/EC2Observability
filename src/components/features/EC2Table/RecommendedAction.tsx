"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface RecommendedActionProps {
  cpu: number;
  gpu: number;
  uptime: number;
  instanceId: string;
  className?: string;
}

const getActionLabel = (cpu: number, gpu: number, uptime: number) => {
  if (cpu < 15 && uptime > 24) return "Consider stopping";
  if (gpu > 80) return "Upgrade GPU";
  if (cpu > 80) return "Upgrade instance";
  return "OK";
};

const RecommendedAction: React.FC<RecommendedActionProps> = ({
  cpu,
  gpu,
  uptime,
  instanceId,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const label = getActionLabel(cpu, gpu, uptime);

  const handleAction = (action: string) => {
    setOpen(false);
    console.log(`Action: ${action} on instance ${instanceId}`);
    // TODO: connect to API
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative flex items-center gap-2">
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          label === "OK"
            ? "bg-teal-900/50 text-teal-400"
            : "bg-red-900/50 text-red-400"
        }`}
      >
        {label}
      </span>

      {/* Only show dropdown trigger if an action is needed */}
      {label !== "OK" && (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded text-teal-400 hover:bg-teal-900/50 transition-all duration-200"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {open && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
              {label === "Consider stopping" && (
                <button
                  onClick={() => handleAction("stop")}
                  className={
                    className ||
                    "block w-full text-left px-4 py-2 text-sm bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-md shadow-sm hover:shadow-teal-500/50 transition-all duration-200"
                  }
                >
                  Stop Instance
                </button>
              )}
              {(label === "Upgrade GPU" || label === "Upgrade instance") && (
                <button
                  onClick={() => handleAction("resize")}
                  className={
                    className ||
                    "block w-full text-left px-4 py-2 text-sm bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-md shadow-sm hover:shadow-teal-500/50 transition-all duration-200"
                  }
                >
                  Resize Instance
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendedAction;
