"use client";

import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null); 
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    // Check if the ref is not null before using it
    if (isVisible && triggerRef.current) { 
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [isVisible]);

  const tooltipContent = (
    <div
      style={{ top: position.top, left: position.left }}
      className="absolute transform -translate-x-1/2 w-max max-w-xs bg-gray-900 text-white text-xs rounded-lg py-2 px-3 transition-opacity duration-200 ease-in-out shadow-md z-50 border border-gray-700 pointer-events-none"
    >
      <div className="whitespace-pre-line">{content}</div>
      <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-t border-l border-gray-700"></span>
    </div>
  );

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={triggerRef}
    >
      {children}
      {isVisible && createPortal(tooltipContent, document.body)}
    </div>
  );
};

export default Tooltip;