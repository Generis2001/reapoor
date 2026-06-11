import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "../../src/lib/chains";

// Arc Testnet contract addresses — update as needed
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as `0x${string}`;
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`;

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY env var required");

  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({ account, chain: arcTestnet, transport: http() });
  const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });

  console.log("Deploying Reapoor contracts to Arc Testnet...");
  console.log("Deployer:", account.address);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", balance.toString());

  // NOTE: Full deployment requires Hardhat or Foundry with OpenZeppelin upgrades plugin.
  // This script outlines the deployment sequence:
  //
  // 1. Deploy TreasuryVault proxy
  // 2. Deploy RewardDistributor proxy
  // 3. Deploy ReapoorStakingManager proxy
  // 4. Deploy ReapoorLiquidityManager proxy
  // 5. Wire up roles: grant DISTRIBUTOR_ROLE to RewardDistributor on both managers
  // 6. Fund TreasuryVault with initial reward reserves

  console.log("\nDeployment sequence:");
  console.log("1. TreasuryVault");
  console.log("2. RewardDistributor");
  console.log("3. ReapoorStakingManager");
  console.log("4. ReapoorLiquidityManager");
  console.log("\nUsing:");
  console.log("  USDC:", USDC_ADDRESS);
  console.log("  EURC:", EURC_ADDRESS);
  console.log("\nRun with Hardhat for full proxy deployment:");
  console.log("  npx hardhat run scripts/deploy.ts --network arcTestnet");
}

main().catch(console.error);
