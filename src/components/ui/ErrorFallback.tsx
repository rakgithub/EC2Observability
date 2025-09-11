"use client";

import React from 'react';
import { FallbackProps } from "react-error-boundary";
import { TriangleAlert } from "lucide-react";

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white p-4">
      <div className="text-center p-10 bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-inset ring-gray-700 max-w-lg w-full transform transition-all duration-300 hover:shadow-red-500/20">
        
        <TriangleAlert className="mx-auto h-16 w-16 text-red-500 mb-6 animate-shake" />

        <h1 className="text-5xl font-extrabold text-red-400 mb-2">
          Oops!
        </h1>
        <p className="text-xl text-gray-300 mb-2 font-medium">
          Something went wrong.
        </p>

        <pre className="text-sm text-red-300 font-mono my-4 p-4 bg-gray-800 rounded-lg overflow-x-auto border border-gray-700">
          {error.message}
        </pre>

        <p className="text-sm text-gray-500 mb-6">
          We're sorry for the inconvenience. Please try again.
        </p>

        <button
          onClick={resetErrorBoundary}
          className="inline-block px-8 py-3 text-white bg-blue-600 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;