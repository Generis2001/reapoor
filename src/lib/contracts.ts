// Deployed contract addresses on Arc Testnet
// Update these after running the deployment script
export const CONTRACT_ADDRESSES = {
  USDC: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`,
  StakingManager: "0xfFf31a3c3A27e6A0C8AeA62aE5EB4dDeB7e37909" as `0x${string}`,
  LiquidityManager: "0xeA846188162E2Df3bB18c474CBB0C90aad443E3f" as `0x${string}`,
  RewardDistributor: "0xf0c4fbd10b53a607D8A5EeF15696c3fD4b850a3c" as `0x${string}`,
  TreasuryVault: "0x1d28471bbDf6e33618b04D99041a9a27C4568141" as `0x${string}`,
} as const;

export const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
] as const;

export const STAKING_ABI = [
  { name: "stake", type: "function", stateMutability: "nonpayable", inputs: [{ name: "usdcAmount", type: "uint256" }, { name: "eurcAmount", type: "uint256" }], outputs: [] },
  { name: "unstake", type: "function", stateMutability: "nonpayable", inputs: [{ name: "usdcAmount", type: "uint256" }, { name: "eurcAmount", type: "uint256" }], outputs: [] },
  { name: "claimRewards", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "emergencyWithdraw", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "positions", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "usdcAmount", type: "uint256" }, { name: "eurcAmount", type: "uint256" }, { name: "usdcRewardDebt", type: "uint256" }, { name: "eurcRewardDebt", type: "uint256" }, { name: "stakedAt", type: "uint256" }, { name: "lastClaimAt", type: "uint256" }] },
  { name: "getPendingRewards", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "pendingUsdc", type: "uint256" }, { name: "pendingEurc", type: "uint256" }] },
  { name: "pool", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "totalUsdcStaked", type: "uint256" }, { name: "totalEurcStaked", type: "uint256" }, { name: "accUsdcRewardPerShare", type: "uint256" }, { name: "accEurcRewardPerShare", type: "uint256" }, { name: "usdcApy", type: "uint256" }, { name: "eurcApy", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }] },
  { name: "lifetimeUsdcEarned", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "lifetimeEurcEarned", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "totalUniqueStakers", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

export const LIQUIDITY_ABI = [
  { name: "addLiquidity", type: "function", stateMutability: "nonpayable", inputs: [{ name: "usdcAmount", type: "uint256" }, { name: "eurcAmount", type: "uint256" }], outputs: [] },
  { name: "removeLiquidity", type: "function", stateMutability: "nonpayable", inputs: [{ name: "usdcShareAmount", type: "uint256" }, { name: "eurcShareAmount", type: "uint256" }], outputs: [] },
  { name: "claimRewards", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "emergencyWithdraw", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "positions", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "usdcShares", type: "uint256" }, { name: "eurcShares", type: "uint256" }, { name: "usdcRewardDebt", type: "uint256" }, { name: "eurcRewardDebt", type: "uint256" }, { name: "depositedAt", type: "uint256" }] },
  { name: "getPendingRewards", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }] },
  { name: "getUserDeposits", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "usdcDeposit", type: "uint256" }, { name: "eurcDeposit", type: "uint256" }] },
  { name: "liqPool", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "totalUsdcDeposited", type: "uint256" }, { name: "totalEurcDeposited", type: "uint256" }, { name: "totalUsdcShares", type: "uint256" }, { name: "totalEurcShares", type: "uint256" }, { name: "accUsdcRewardPerShare", type: "uint256" }, { name: "accEurcRewardPerShare", type: "uint256" }, { name: "usdcApy", type: "uint256" }, { name: "eurcApy", type: "uint256" }] },
  { name: "lifetimeUsdcEarned", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "lifetimeEurcEarned", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "totalProviders", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;
