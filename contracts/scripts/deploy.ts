import { ethers, upgrades } from "hardhat";

// Arc Testnet token addresses
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

// Initial APYs in basis points (800 = 8%)
const USDC_STAKING_APY = 800n;
const EURC_STAKING_APY = 750n;
const USDC_LIQ_APY = 900n;
const EURC_LIQ_APY = 850n;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\nDeploying Reapoor contracts...");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 1. TreasuryVault
  console.log("\n[1/4] Deploying TreasuryVault...");
  const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
  const treasury = await upgrades.deployProxy(
    TreasuryVault,
    [USDC, EURC, deployer.address],
    { initializer: "initialize", kind: "uups" }
  );
  await treasury.waitForDeployment();
  const treasuryAddr = await treasury.getAddress();
  console.log("✓ TreasuryVault:", treasuryAddr);

  // 2. RewardDistributor (temp addresses, wired after staking/liquidity deploy)
  console.log("\n[2/4] Deploying RewardDistributor...");
  const RewardDistributor = await ethers.getContractFactory("RewardDistributor");
  const distributor = await upgrades.deployProxy(
    RewardDistributor,
    [USDC, EURC, deployer.address, ethers.ZeroAddress, ethers.ZeroAddress, treasuryAddr],
    { initializer: "initialize", kind: "uups" }
  );
  await distributor.waitForDeployment();
  const distributorAddr = await distributor.getAddress();
  console.log("✓ RewardDistributor:", distributorAddr);

  // 3. ReapoorStakingManager
  console.log("\n[3/4] Deploying ReapoorStakingManager...");
  const StakingManager = await ethers.getContractFactory("ReapoorStakingManager");
  const staking = await upgrades.deployProxy(
    StakingManager,
    [USDC, EURC, deployer.address, distributorAddr, USDC_STAKING_APY, EURC_STAKING_APY],
    { initializer: "initialize", kind: "uups" }
  );
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("✓ ReapoorStakingManager:", stakingAddr);

  // 4. ReapoorLiquidityManager
  console.log("\n[4/4] Deploying ReapoorLiquidityManager...");
  const LiquidityManager = await ethers.getContractFactory("ReapoorLiquidityManager");
  const liquidity = await upgrades.deployProxy(
    LiquidityManager,
    [USDC, EURC, deployer.address, distributorAddr, USDC_LIQ_APY, EURC_LIQ_APY],
    { initializer: "initialize", kind: "uups" }
  );
  await liquidity.waitForDeployment();
  const liquidityAddr = await liquidity.getAddress();
  console.log("✓ ReapoorLiquidityManager:", liquidityAddr);

  // 5. Wire distributor to staking + liquidity managers
  console.log("\nWiring RewardDistributor to managers...");
  const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
  await (await staking.grantRole(DISTRIBUTOR_ROLE, distributorAddr)).wait();
  await (await liquidity.grantRole(DISTRIBUTOR_ROLE, distributorAddr)).wait();
  console.log("✓ DISTRIBUTOR_ROLE granted");

  console.log("\n============================================");
  console.log("DEPLOYMENT COMPLETE — Update src/lib/contracts.ts:");
  console.log("============================================");
  console.log(`StakingManager:   "${stakingAddr}"`);
  console.log(`LiquidityManager: "${liquidityAddr}"`);
  console.log(`RewardDistributor:"${distributorAddr}"`);
  console.log(`TreasuryVault:    "${treasuryAddr}"`);
  console.log("============================================\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
