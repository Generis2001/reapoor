"use client";

import { useAccount, useChainId } from "wagmi";
import { useSwitchChain } from "wagmi";
import { arcTestnet } from "@/lib/chains";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Wifi } from "lucide-react";

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id;

  if (!isWrongNetwork) return <>{children}</>;

  return (
    <>
      {/* Overlay banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          You are connected to the wrong network. Reapoor requires Arc Testnet (Chain ID: {arcTestnet.id}).
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white text-amber-700 border-0 hover:bg-amber-50 flex-shrink-0"
          loading={isPending}
          onClick={() => switchChain({ chainId: arcTestnet.id })}
        >
          <Wifi className="w-4 h-4" />
          Switch to Arc Testnet
        </Button>
      </div>
      {/* Push content down */}
      <div className="h-12" />
      {children}
    </>
  );
}

export function AddArcNetworkButton() {
  const { switchChain, isPending } = useSwitchChain();

  const handleAddNetwork = () => {
    switchChain({ chainId: arcTestnet.id });
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={isPending}
      onClick={handleAddNetwork}
      className="gap-1.5"
    >
      <Wifi className="w-4 h-4" />
      Add Arc Testnet
    </Button>
  );
}
