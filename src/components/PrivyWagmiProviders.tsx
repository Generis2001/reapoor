"use client";

import { WagmiProvider } from "@privy-io/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { wagmiConfig } from "@/lib/wagmi";
import { arcTestnet } from "@/lib/chains";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "placeholder-id";

export function PrivyWagmiProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#2563EB",
        },
        defaultChain: arcTestnet,
        supportedChains: [arcTestnet],
        loginMethods: ["wallet"],
        walletConnectCloudProjectId: undefined,
      }}
    >
      <WagmiProvider config={wagmiConfig} reconnectOnMount>
        {children}
      </WagmiProvider>
    </PrivyProvider>
  );
}
