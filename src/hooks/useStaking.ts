"use client";

import { useReadContract, useWriteContract, useAccount, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACT_ADDRESSES, STAKING_ABI, ERC20_ABI } from "@/lib/contracts";
import { useState, useCallback } from "react";
import { MAX_UINT256, TxState, parseTxError } from "@/lib/txUtils";

export function useStakingPosition() {
  const { address } = useAccount();

  const { data: position, refetch: refetchPosition } = useReadContract({
    address: CONTRACT_ADDRESSES.StakingManager,
    abi: STAKING_ABI,
    functionName: "positions",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.StakingManager,
    abi: STAKING_ABI,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: pool } = useReadContract({
    address: CONTRACT_ADDRESSES.StakingManager,
    abi: STAKING_ABI,
    functionName: "pool",
  });

  const { data: lifetimeUsdc } = useReadContract({
    address: CONTRACT_ADDRESSES.StakingManager,
    abi: STAKING_ABI,
    functionName: "lifetimeUsdcEarned",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: lifetimeEurc } = useReadContract({
    address: CONTRACT_ADDRESSES.StakingManager,
    abi: STAKING_ABI,
    functionName: "lifetimeEurcEarned",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalStakers } = useReadContract({
    address: CONTRACT_ADDRESSES.StakingManager,
    abi: STAKING_ABI,
    functionName: "totalUniqueStakers",
  });

  const refetch = useCallback(() => {
    refetchPosition();
    refetchRewards();
  }, [refetchPosition, refetchRewards]);

  return {
    usdcStaked: position?.[0] ?? BigInt(0),
    eurcStaked: position?.[1] ?? BigInt(0),
    pendingUsdc: pendingRewards?.[0] ?? BigInt(0),
    pendingEurc: pendingRewards?.[1] ?? BigInt(0),
    totalUsdcStaked: pool?.[0] ?? BigInt(0),
    totalEurcStaked: pool?.[1] ?? BigInt(0),
    usdcApy: pool?.[4] ?? BigInt(800),
    eurcApy: pool?.[5] ?? BigInt(750),
    lifetimeUsdc: lifetimeUsdc ?? BigInt(0),
    lifetimeEurc: lifetimeEurc ?? BigInt(0),
    totalStakers: totalStakers ?? BigInt(0),
    refetch,
  };
}

export function useStakeActions() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const { data: usdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.StakingManager] : undefined,
    query: { enabled: !!address },
  });

  const { data: eurcAllowance, refetch: refetchEurcAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.EURC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.StakingManager] : undefined,
    query: { enabled: !!address },
  });

  const stake = useCallback(async (usdcInput: string, eurcInput: string) => {
    const usdc = parseUnits(usdcInput || "0", 6);
    const eurc = parseUnits(eurcInput || "0", 6);
    try {
      if (usdc > BigInt(0) && (usdcAllowance ?? BigInt(0)) < usdc) {
        setTxState({ status: "approving_usdc" });
        const h = await writeContractAsync({
          address: CONTRACT_ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.StakingManager, MAX_UINT256],
        });
        await publicClient!.waitForTransactionReceipt({ hash: h });
        await refetchUsdcAllowance();
      }

      if (eurc > BigInt(0) && (eurcAllowance ?? BigInt(0)) < eurc) {
        setTxState({ status: "approving_eurc" });
        const h = await writeContractAsync({
          address: CONTRACT_ADDRESSES.EURC,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.StakingManager, MAX_UINT256],
        });
        await publicClient!.waitForTransactionReceipt({ hash: h });
        await refetchEurcAllowance();
      }

      setTxState({ status: "submitting" });
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.StakingManager,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [usdc, eurc],
      });

      setTxState({ status: "confirming", hash });
      await publicClient!.waitForTransactionReceipt({ hash });
      setTxState({ status: "success", hash });
      return hash;
    } catch (e) {
      setTxState({ status: "idle" });
      throw e;
    }
  }, [writeContractAsync, publicClient, usdcAllowance, eurcAllowance, refetchUsdcAllowance, refetchEurcAllowance]);

  const unstake = useCallback(async (usdcInput: string, eurcInput: string) => {
    const usdc = parseUnits(usdcInput || "0", 6);
    const eurc = parseUnits(eurcInput || "0", 6);
    try {
      setTxState({ status: "submitting" });
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.StakingManager,
        abi: STAKING_ABI,
        functionName: "unstake",
        args: [usdc, eurc],
      });
      setTxState({ status: "confirming", hash });
      await publicClient!.waitForTransactionReceipt({ hash });
      setTxState({ status: "success", hash });
      return hash;
    } catch (e) {
      setTxState({ status: "idle" });
      throw e;
    }
  }, [writeContractAsync, publicClient]);

  const claimRewards = useCallback(async () => {
    try {
      setTxState({ status: "submitting" });
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.StakingManager,
        abi: STAKING_ABI,
        functionName: "claimRewards",
      });
      setTxState({ status: "confirming", hash });
      await publicClient!.waitForTransactionReceipt({ hash });
      setTxState({ status: "success", hash });
      return hash;
    } catch (e) {
      setTxState({ status: "idle" });
      throw e;
    }
  }, [writeContractAsync, publicClient]);

  const resetTxState = useCallback(() => setTxState({ status: "idle" }), []);
  const isLoading = txState.status !== "idle";

  return { stake, unstake, claimRewards, txState, isLoading, resetTxState };
}

export { parseTxError };
