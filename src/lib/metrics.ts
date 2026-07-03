import { createPublicClient, http, parseAbi } from "viem";
import { arcTestnet } from "./chains";
import { CONTRACT_ADDRESSES } from "./contracts";

export interface ProtocolMetrics {
  tvl: number;
  totalDeposits: number;
  rewardsDistributed: number;
  activeUsers: number;
  usdcStakingApy: number;
  eurcStakingApy: number;
  usdcLpApy: number;
  eurcLpApy: number;
  updatedAt: number;
}

export const METRICS_FALLBACK: ProtocolMetrics = {
  tvl: 0,
  totalDeposits: 0,
  rewardsDistributed: 0,
  activeUsers: 0,
  usdcStakingApy: 8.0,
  eurcStakingApy: 7.5,
  usdcLpApy: 9.0,
  eurcLpApy: 8.5,
  updatedAt: 0,
};

const STAKING_ABI = parseAbi([
  "function pool() view returns (uint256 totalUsdcStaked, uint256 totalEurcStaked, uint256 accUsdcRewardPerShare, uint256 accEurcRewardPerShare, uint256 usdcApy, uint256 eurcApy, uint256 lastRewardBlock)",
  "function totalUniqueStakers() view returns (uint256)",
]);

const LIQ_ABI = parseAbi([
  "function liqPool() view returns (uint256 totalUsdcDeposited, uint256 totalEurcDeposited, uint256 totalUsdcShares, uint256 totalEurcShares, uint256 accUsdcRewardPerShare, uint256 accEurcRewardPerShare, uint256 usdcApy, uint256 eurcApy)",
  "function totalProviders() view returns (uint256)",
]);

const DISTRIBUTOR_ABI = parseAbi([
  "function totalUsdcDistributed() view returns (uint256)",
  "function totalEurcDistributed() view returns (uint256)",
]);

// EURC/USD approximation for display purposes on testnet
const EURC_USD_RATE = 1.08;

const client = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

export async function getProtocolMetrics(): Promise<ProtocolMetrics> {
  const div = 1_000_000;

  const [
    stakingPoolResult,
    totalUniqueStakersResult,
    liquidityPoolResult,
    totalProvidersResult,
    distributorUsdcDistributedResult,
    distributorEurcDistributedResult,
  ] = await Promise.allSettled([
    client.readContract({ address: CONTRACT_ADDRESSES.StakingManager, abi: STAKING_ABI, functionName: "pool" }),
    client.readContract({ address: CONTRACT_ADDRESSES.StakingManager, abi: STAKING_ABI, functionName: "totalUniqueStakers" }),
    client.readContract({ address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI, functionName: "liqPool" }),
    client.readContract({ address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI, functionName: "totalProviders" }),
    client.readContract({ address: CONTRACT_ADDRESSES.RewardDistributor, abi: DISTRIBUTOR_ABI, functionName: "totalUsdcDistributed" }),
    client.readContract({ address: CONTRACT_ADDRESSES.RewardDistributor, abi: DISTRIBUTOR_ABI, functionName: "totalEurcDistributed" }),
  ]);

  // Staking pool state
  let totalUsdcStaked = 0, totalEurcStaked = 0;
  let usdcStakingApy = METRICS_FALLBACK.usdcStakingApy;
  let eurcStakingApy = METRICS_FALLBACK.eurcStakingApy;
  if (stakingPoolResult.status === "fulfilled") {
    const p = stakingPoolResult.value as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint];
    // [totalUsdcStaked, totalEurcStaked, accUsdcRPS, accEurcRPS, usdcApy, eurcApy, lastRewardBlock]
    totalUsdcStaked = Number(p[0]) / div;
    totalEurcStaked = Number(p[1]) / div;
    usdcStakingApy = Number(p[4]) / 100;
    eurcStakingApy = Number(p[5]) / 100;
  }

  const stakers = totalUniqueStakersResult.status === "fulfilled" ? Number(totalUniqueStakersResult.value) : 0;

  // Liquidity pool state
  let totalUsdcDeposited = 0, totalEurcDeposited = 0;
  let usdcLpApy = METRICS_FALLBACK.usdcLpApy;
  let eurcLpApy = METRICS_FALLBACK.eurcLpApy;
  if (liquidityPoolResult.status === "fulfilled") {
    const lp = liquidityPoolResult.value as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
    // [totalUsdcDeposited, totalEurcDeposited, totalUsdcShares, totalEurcShares, accUsdcRPS, accEurcRPS, usdcApy, eurcApy]
    totalUsdcDeposited = Number(lp[0]) / div;
    totalEurcDeposited = Number(lp[1]) / div;
    usdcLpApy = Number(lp[6]) / 100;
    eurcLpApy = Number(lp[7]) / 100;
  }

  const providers = totalProvidersResult.status === "fulfilled" ? Number(totalProvidersResult.value) : 0;
  const distributorUsdcDist = distributorUsdcDistributedResult.status === "fulfilled" ? Number(distributorUsdcDistributedResult.value) / div : 0;
  const distributorEurcDist = distributorEurcDistributedResult.status === "fulfilled" ? Number(distributorEurcDistributedResult.value) / div : 0;

  // Arc RPC limits historical log ranges, so totalDeposits mirrors current live capital.
  const tvl =
    totalUsdcStaked + totalUsdcDeposited +
    (totalEurcStaked + totalEurcDeposited) * EURC_USD_RATE;

  const totalDeposits =
    totalUsdcStaked + totalUsdcDeposited +
    (totalEurcStaked + totalEurcDeposited) * EURC_USD_RATE;

  // Cumulative rewards distributed: contract state (totalUsdcDistributed / totalEurcDistributed)
  // uses the distributor totals because manager-level counters advance only on pool settlement.
  const rewardsDistributed =
    distributorUsdcDist + distributorEurcDist * EURC_USD_RATE;

  // Active users = current stakers + current LP providers (simple union approximation)
  const activeUsers = stakers + providers;

  return {
    tvl,
    totalDeposits,
    rewardsDistributed,
    activeUsers,
    usdcStakingApy,
    eurcStakingApy,
    usdcLpApy,
    eurcLpApy,
    updatedAt: Date.now(),
  };
}
