import React, { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <span className="relative group inline-block">
      {children}
      <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out shadow-md z-10 border border-gray-700">
        <div className="whitespace-pre-line">{content}</div>
        <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-t border-l border-gray-700"></span>
      </span>
    </span>
  );
};

export default Tooltip;
