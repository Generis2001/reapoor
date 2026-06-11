"use client";

import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESSES, ERC20_ABI } from "@/lib/contracts";

export function useWalletBalances() {
  const { address } = useAccount();

  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: eurcBalance, refetch: refetchEurc } = useReadContract({
    address: CONTRACT_ADDRESSES.EURC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    usdcBalance: usdcBalance ?? BigInt(0),
    eurcBalance: eurcBalance ?? BigInt(0),
    refetch: () => { refetchUsdc(); refetchEurc(); },
  };
}
