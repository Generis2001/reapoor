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
    stakingPool,
    totalUniqueStakers,
    liquidityPool,
    totalProviders,
    distributorUsdcDistributed,
    distributorEurcDistributed,
  ] = await Promise.all([
    client.readContract({ address: CONTRACT_ADDRESSES.StakingManager, abi: STAKING_ABI, functionName: "pool" }),
    client.readContract({ address: CONTRACT_ADDRESSES.StakingManager, abi: STAKING_ABI, functionName: "totalUniqueStakers" }),
    client.readContract({ address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI, functionName: "liqPool" }),
    client.readContract({ address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI, functionName: "totalProviders" }),
    client.readContract({ address: CONTRACT_ADDRESSES.RewardDistributor, abi: DISTRIBUTOR_ABI, functionName: "totalUsdcDistributed" }),
    client.readContract({ address: CONTRACT_ADDRESSES.RewardDistributor, abi: DISTRIBUTOR_ABI, functionName: "totalEurcDistributed" }),
  ]);

  const staking = stakingPool as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint];
  const liquidity = liquidityPool as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

  const totalUsdcStaked = Number(staking[0]) / div;
  const totalEurcStaked = Number(staking[1]) / div;
  const usdcStakingApy = Number(staking[4]) / 100;
  const eurcStakingApy = Number(staking[5]) / 100;

  const totalUsdcDeposited = Number(liquidity[0]) / div;
  const totalEurcDeposited = Number(liquidity[1]) / div;
  const usdcLpApy = Number(liquidity[6]) / 100;
  const eurcLpApy = Number(liquidity[7]) / 100;

  const stakers = Number(totalUniqueStakers);
  const providers = Number(totalProviders);
  const distributorUsdcDist = Number(distributorUsdcDistributed) / div;
  const distributorEurcDist = Number(distributorEurcDistributed) / div;

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

  // Current on-chain position count: active staking positions plus active LP positions.
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
