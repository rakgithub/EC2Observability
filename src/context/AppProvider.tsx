"use client";

import { ErrorBoundary } from "react-error-boundary";
import React, { ReactNode } from "react";
import { ErrorProvider } from "./ErrorProvider";
import ErrorFallback from "@/components/ui/ErrorFallback";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorProvider>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, info) => console.error("Logged to service:", error, info)}
      >
        {children}
      </ErrorBoundary>
    </ErrorProvider>
  );
};