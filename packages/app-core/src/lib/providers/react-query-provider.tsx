"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {false && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};
