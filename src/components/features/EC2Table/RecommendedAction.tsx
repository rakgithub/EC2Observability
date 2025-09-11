"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { getActionLabel } from "./utils";
import ECTooltip from "@/components/ui/Tooltip";
interface RecommendedActionProps {
  cpu: number;
  gpu: number;
  uptime: number;
  instanceId: string;
  className?: string;
}

const RecommendedAction: React.FC<RecommendedActionProps> = ({
  cpu,
  gpu,
  uptime,
  instanceId,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { label, tooltip } = getActionLabel(cpu, gpu, uptime);

  const handleAction = (action: string) => {
    setOpen(false);
    console.log(`Action: ${action} on instance ${instanceId}`);
    // TODO: connect to API to perform the action (e.g., stop or resize)
  };

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
     
     <ECTooltip content={tooltip}>
       <span
  className={`px-3 py-1 rounded-full text-xs font-medium ${
    label === "All Good"
      ? "bg-teal-900/50 text-teal-400"
      : "bg-red-900/50 text-red-400"
  } whitespace-nowrap`}
>
  {label}
</span>
      </ECTooltip>

      {label !== "All Good" && (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded text-teal-400 hover:bg-teal-900/50 transition-all duration-200"
            aria-label="Show Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {open && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
              {label === "Stop Instance" && (
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
              {(label === "Upgrade GPU" || label === "Upgrade Instance") && (
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
