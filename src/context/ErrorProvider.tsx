"use client";

import ErrorToast from "@/components/ui/ErrorToast";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
  };

  const closeError = () => {
    setErrorMessage(null);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {errorMessage && (
        <ErrorToast message={errorMessage} onClose={closeError} />
      )}
    </ErrorContext.Provider>
  );
};
