"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface RecommendedActionProps {
  cpu: number;
  gpu: number;
  uptime: number;
  instanceId: string;
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
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const label = getActionLabel(cpu, gpu, uptime);

  const handleAction = (action: string) => {
    setOpen(false);
    console.log(`Action: ${action} on instance ${instanceId}`);
    // TODO: connect to API
  };

  // 🔑 Close dropdown when clicking outside
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
      <span className="px-2 py-1 bg-gray-700 text-gray-200 rounded-full text-xs font-medium">
        {label}
      </span>

      {/* Only show dropdown trigger if an action is needed */}
      {label !== "OK" && (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded hover:bg-gray-700 transition"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
              {label === "Consider stopping" && (
                <button
                  onClick={() => handleAction("stop")}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Stop Instance
                </button>
              )}
              {(label === "Upgrade GPU" || label === "Upgrade instance") && (
                <button
                  onClick={() => handleAction("resize")}
                  className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
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
