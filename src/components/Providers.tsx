"use client";

import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const PrivyWagmiProviders = dynamic(
  () => import("./PrivyWagmiProviders").then((m) => m.PrivyWagmiProviders),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyWagmiProviders>{children}</PrivyWagmiProviders>
    </QueryClientProvider>
  );
}
