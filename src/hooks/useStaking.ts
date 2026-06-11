"use client";

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACT_ADDRESSES, STAKING_ABI, ERC20_ABI } from "@/lib/contracts";
import { useState, useCallback } from "react";

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
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const approveUsdc = useCallback(async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.USDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.StakingManager, amount],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const approveEurc = useCallback(async (amount: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.EURC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.StakingManager, amount],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const stake = useCallback(async (usdcAmount: string, eurcAmount: string) => {
    const usdc = parseUnits(usdcAmount || "0", 6);
    const eurc = parseUnits(eurcAmount || "0", 6);
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.StakingManager,
      abi: STAKING_ABI,
      functionName: "stake",
      args: [usdc, eurc],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const unstake = useCallback(async (usdcAmount: string, eurcAmount: string) => {
    const usdc = parseUnits(usdcAmount || "0", 6);
    const eurc = parseUnits(eurcAmount || "0", 6);
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.StakingManager,
      abi: STAKING_ABI,
      functionName: "unstake",
      args: [usdc, eurc],
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  const claimRewards = useCallback(async () => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.StakingManager,
      abi: STAKING_ABI,
      functionName: "claimRewards",
    });
    setTxHash(hash);
    return hash;
  }, [writeContractAsync]);

  return { approveUsdc, approveEurc, stake, unstake, claimRewards, txHash, isWaiting, isSuccess };
}
