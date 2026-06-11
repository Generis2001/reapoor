import { createPublicClient, http, parseAbi, parseAbiItem } from "viem";
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
  "function totalUsdcDistributed() view returns (uint256)",
  "function totalEurcDistributed() view returns (uint256)",
]);

const LIQ_ABI = parseAbi([
  "function liqPool() view returns (uint256 totalUsdcDeposited, uint256 totalEurcDeposited, uint256 totalUsdcShares, uint256 totalEurcShares, uint256 accUsdcRewardPerShare, uint256 accEurcRewardPerShare, uint256 usdcApy, uint256 eurcApy)",
  "function totalProviders() view returns (uint256)",
  "function totalUsdcDistributed() view returns (uint256)",
  "function totalEurcDistributed() view returns (uint256)",
]);

const ERC20_DEC_ABI = parseAbi(["function decimals() view returns (uint8)"]);

// EURC/USD approximation for display purposes on testnet
const EURC_USD_RATE = 1.08;

const client = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

export async function getProtocolMetrics(): Promise<ProtocolMetrics> {
  // ── 1. Multicall: all contract state reads in one round-trip ──────────────
  const [r0, r1, r2, r3, r4, r5, r6, r7, r8] = await client.multicall({
    contracts: [
      { address: CONTRACT_ADDRESSES.USDC,             abi: ERC20_DEC_ABI, functionName: "decimals" },
      { address: CONTRACT_ADDRESSES.StakingManager,   abi: STAKING_ABI,   functionName: "pool" },
      { address: CONTRACT_ADDRESSES.StakingManager,   abi: STAKING_ABI,   functionName: "totalUniqueStakers" },
      { address: CONTRACT_ADDRESSES.StakingManager,   abi: STAKING_ABI,   functionName: "totalUsdcDistributed" },
      { address: CONTRACT_ADDRESSES.StakingManager,   abi: STAKING_ABI,   functionName: "totalEurcDistributed" },
      { address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI,       functionName: "liqPool" },
      { address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI,       functionName: "totalProviders" },
      { address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI,       functionName: "totalUsdcDistributed" },
      { address: CONTRACT_ADDRESSES.LiquidityManager, abi: LIQ_ABI,       functionName: "totalEurcDistributed" },
    ],
    allowFailure: true,
  });

  const decimals = r0.status === "success" ? Number(r0.result) : 6;
  const div = 10 ** decimals;

  // Staking pool state
  let totalUsdcStaked = 0, totalEurcStaked = 0;
  let usdcStakingApy = METRICS_FALLBACK.usdcStakingApy;
  let eurcStakingApy = METRICS_FALLBACK.eurcStakingApy;
  if (r1.status === "success") {
    const p = r1.result as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint];
    // [totalUsdcStaked, totalEurcStaked, accUsdcRPS, accEurcRPS, usdcApy, eurcApy, lastRewardBlock]
    totalUsdcStaked = Number(p[0]) / div;
    totalEurcStaked = Number(p[1]) / div;
    usdcStakingApy = Number(p[4]) / 100;
    eurcStakingApy = Number(p[5]) / 100;
  }

  const stakers            = r2.status === "success" ? Number(r2.result)          : 0;
  const stakingUsdcDist    = r3.status === "success" ? Number(r3.result) / div     : 0;
  const stakingEurcDist    = r4.status === "success" ? Number(r4.result) / div     : 0;

  // Liquidity pool state
  let totalUsdcDeposited = 0, totalEurcDeposited = 0;
  let usdcLpApy = METRICS_FALLBACK.usdcLpApy;
  let eurcLpApy = METRICS_FALLBACK.eurcLpApy;
  if (r5.status === "success") {
    const lp = r5.result as unknown as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
    // [totalUsdcDeposited, totalEurcDeposited, totalUsdcShares, totalEurcShares, accUsdcRPS, accEurcRPS, usdcApy, eurcApy]
    totalUsdcDeposited = Number(lp[0]) / div;
    totalEurcDeposited = Number(lp[1]) / div;
    usdcLpApy = Number(lp[6]) / 100;
    eurcLpApy = Number(lp[7]) / 100;
  }

  const providers       = r6.status === "success" ? Number(r6.result)         : 0;
  const liqUsdcDist     = r7.status === "success" ? Number(r7.result) / div   : 0;
  const liqEurcDist     = r8.status === "success" ? Number(r8.result) / div   : 0;

  // ── 2. Event log scan: historical deposit totals ──────────────────────────
  // Scan Staked + LiquidityAdded events from contract deployment onwards.
  let histUsdcDeposited = 0, histEurcDeposited = 0;
  try {
    const [stakedLogs, liqLogs] = await Promise.all([
      client.getLogs({
        address: CONTRACT_ADDRESSES.StakingManager,
        event: parseAbiItem(
          "event Staked(address indexed user, uint256 usdcAmount, uint256 eurcAmount)"
        ),
        fromBlock: BigInt(0),
        toBlock: "latest",
      }),
      client.getLogs({
        address: CONTRACT_ADDRESSES.LiquidityManager,
        event: parseAbiItem(
          "event LiquidityAdded(address indexed user, uint256 usdcAmount, uint256 eurcAmount)"
        ),
        fromBlock: BigInt(0),
        toBlock: "latest",
      }),
    ]);

    for (const log of [...stakedLogs, ...liqLogs]) {
      histUsdcDeposited += Number(log.args.usdcAmount ?? BigInt(0)) / div;
      histEurcDeposited += Number(log.args.eurcAmount ?? BigInt(0)) / div;
    }
  } catch {
    // Fall back to current TVL if event scan fails
    histUsdcDeposited = totalUsdcStaked + totalUsdcDeposited;
    histEurcDeposited = totalEurcStaked + totalEurcDeposited;
  }

  // ── 3. Aggregate ──────────────────────────────────────────────────────────
  const tvl =
    totalUsdcStaked + totalUsdcDeposited +
    (totalEurcStaked + totalEurcDeposited) * EURC_USD_RATE;

  const totalDeposits =
    histUsdcDeposited + histEurcDeposited * EURC_USD_RATE;

  // Cumulative rewards distributed: contract state (totalUsdcDistributed / totalEurcDistributed)
  // already tracks all rewards ever pushed via addRewards().
  const rewardsDistributed =
    stakingUsdcDist + liqUsdcDist +
    (stakingEurcDist + liqEurcDist) * EURC_USD_RATE;

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
