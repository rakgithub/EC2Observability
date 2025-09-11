import { AlertTriangle } from "lucide-react";
import React from "react";
import clsx from "clsx";

interface ErrorMessageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  description,
  icon = <AlertTriangle className="w-6 h-6 text-red-500" />,
  className = "",
}) => {
  return (
    <div
      className={clsx(
        "p-6 mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-center shadow-lg",
        className
      )}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <h2 className="text-xl font-semibold text-red-800 dark:text-red-300">
        {title}
      </h2>
      {description && (
        <p className="text-sm mt-2 text-red-600 dark:text-red-200">
          {description}
        </p>
      )}
    </div>
  );
};

export default ErrorMessage;
