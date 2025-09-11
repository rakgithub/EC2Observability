"use client";

import React, { useEffect } from "react";
import { XCircle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Auto-closing toast");
      onClose();
    }, 5000); // Automatically close after 5 seconds

    return () => {
      console.log("Cleaning up timer");
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleClose = () => {
    console.log("Close button clicked");
    onClose();
  };

  return (
    <div
      className="fixed bottom-6 left-4 max-w-md w-full p-4 bg-red-500 dark:bg-red-800 text-white dark:text-gray-100 rounded-lg shadow-xl flex items-center space-x-3 z-50 animate-slide-up transition-all duration-300 ease-in-out"
      role="alert"
    >
      <XCircle className="h-6 w-6 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-red-600 dark:hover:bg-red-900 transition-colors duration-200"
        aria-label="Close toast"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ErrorToast;
