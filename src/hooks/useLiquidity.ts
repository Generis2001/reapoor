"use client";

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACT_ADDRESSES, LIQUIDITY_ABI, ERC20_ABI } from "@/lib/contracts";
import { useState, useCallback } from "react";

export function useLiquidityPosition() {
  const { address } = useAccount();

  const { data: position, refetch: refetchPosition } = useReadContract({
    address: CONTRACT_ADDRESSES.LiquidityManager,
    abi: LIQUIDITY_ABI,
    functionName: "positions",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: deposits, refetch: refetchDeposits } = useReadContract({
    address: CONTRACT_ADDRESSES.LiquidityManager,
    abi: LIQUIDITY_ABI,
    functionName: "getUserDeposits",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.LiquidityManager,
    abi: LIQUIDITY_ABI,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: pool } = useReadContract({
    address: CONTRACT_ADDRESSES.LiquidityManager,
    abi: LIQUIDITY_ABI,
    functionName: "liqPool",
  });

  const { data: lifetimeUsdc } = useReadContract({
    address: CONTRACT_ADDRESSES.LiquidityManager,
    abi: LIQUIDITY_ABI,
    functionName: "lifetimeUsdcEarned",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: lifetimeEurc } = useReadContract({
    address: CONTRACT_ADDRESSES.LiquidityManager,
    abi: LIQUIDITY_ABI,
    functionName: "lifetimeEurcEarned",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const refetch = useCallback(() => {
    refetchPosition();
    refetchDeposits();
    refetchRewards();
  }, [refetchPosition, refetchDeposits, refetchRewards]);

  return {
    usdcShares: position?.[0] ?? BigInt(0),
    eurcShares: position?.[1] ?? BigInt(0),
    usdcDeposit: deposits?.[0] ?? BigInt(0),
    eurcDeposit: deposits?.[1] ?? BigInt(0),
    pendingUsdc: pendingRewards?.[0] ?? BigInt(0),
    pendingEurc: pendingRewards?.[1] ?? BigInt(0),
    totalUsdcDeposited: pool?.[0] ?? BigInt(0),
    totalEurcDeposited: pool?.[1] ?? BigInt(0),
    usdcApy: pool?.[6] ?? BigInt(900),
    eurcApy: pool?.[7] ?? BigInt(850),
    lifetimeUsdc: lifetimeUsdc ?? BigInt(0),
    lifetimeEurc: lifetimeEurc ?? BigInt(0),
    refetch,
  };
}

export function useLiquidityActions() {
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const approveUsdc = useCallback(async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.USDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.LiquidityManager, amount],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const approveEurc = useCallback(async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.EURC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.LiquidityManager, amount],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const addLiquidity = useCallback(async (usdcAmount: string, eurcAmount: string) => {
    const usdc = parseUnits(usdcAmount || "0", 6);
    const eurc = parseUnits(eurcAmount || "0", 6);
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.LiquidityManager,
      abi: LIQUIDITY_ABI,
      functionName: "addLiquidity",
      args: [usdc, eurc],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const removeLiquidity = useCallback(async (usdcShares: bigint, eurcShares: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.LiquidityManager,
      abi: LIQUIDITY_ABI,
      functionName: "removeLiquidity",
      args: [usdcShares, eurcShares],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const claimRewards = useCallback(async () => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.LiquidityManager,
      abi: LIQUIDITY_ABI,
      functionName: "claimRewards",
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  return { approveUsdc, approveEurc, addLiquidity, removeLiquidity, claimRewards, txHash, isWaiting, isSuccess };
}
