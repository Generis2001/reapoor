import { ethers, upgrades } from "hardhat";

const CONTRACTS = {
  staking: "0xfFf31a3c3A27e6A0C8AeA62aE5EB4dDeB7e37909",
  liquidity: "0xeA846188162E2Df3bB18c474CBB0C90aad443E3f",
  distributor: "0xf0c4fbd10b53a607D8A5EeF15696c3fD4b850a3c",
  treasury: "0x1d28471bbDf6e33618b04D99041a9a27C4568141",
} as const;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\nUpgrading Reapoor contracts...");
  console.log("Deployer:", deployer.address);

  const StakingManager = await ethers.getContractFactory("ReapoorStakingManager");
  const LiquidityManager = await ethers.getContractFactory("ReapoorLiquidityManager");
  const RewardDistributor = await ethers.getContractFactory("RewardDistributor");

  await importProxy(CONTRACTS.staking, StakingManager);
  await importProxy(CONTRACTS.liquidity, LiquidityManager);
  await importProxy(CONTRACTS.distributor, RewardDistributor);

  const staking = await upgrades.upgradeProxy(CONTRACTS.staking, StakingManager, { kind: "uups" });
  await staking.waitForDeployment();
  console.log("✓ StakingManager upgraded");

  const liquidity = await upgrades.upgradeProxy(CONTRACTS.liquidity, LiquidityManager, { kind: "uups" });
  await liquidity.waitForDeployment();
  console.log("✓ LiquidityManager upgraded");

  const distributor = await upgrades.upgradeProxy(CONTRACTS.distributor, RewardDistributor, { kind: "uups" });
  await distributor.waitForDeployment();
  console.log("✓ RewardDistributor upgraded");

  const DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE"));
  const TREASURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TREASURER_ROLE"));

  if (!(await staking.hasRole(DISTRIBUTOR_ROLE, CONTRACTS.distributor))) {
    await (await staking.grantRole(DISTRIBUTOR_ROLE, CONTRACTS.distributor)).wait();
    console.log("✓ StakingManager distributor role granted");
  }

  if (!(await liquidity.hasRole(DISTRIBUTOR_ROLE, CONTRACTS.distributor))) {
    await (await liquidity.grantRole(DISTRIBUTOR_ROLE, CONTRACTS.distributor)).wait();
    console.log("✓ LiquidityManager distributor role granted");
  }

  const treasury = await ethers.getContractAt("TreasuryVault", CONTRACTS.treasury);
  if (!(await treasury.hasRole(TREASURER_ROLE, CONTRACTS.distributor))) {
    await (await treasury.grantRole(TREASURER_ROLE, CONTRACTS.distributor)).wait();
    console.log("✓ Treasury distributor role granted");
  }

  const currentStakingManager = await distributor.stakingManager();
  const currentLiquidityManager = await distributor.liquidityManager();
  if (
    currentStakingManager.toLowerCase() !== CONTRACTS.staking.toLowerCase() ||
    currentLiquidityManager.toLowerCase() !== CONTRACTS.liquidity.toLowerCase()
  ) {
    await (await distributor.setManagers(CONTRACTS.staking, CONTRACTS.liquidity)).wait();
    console.log("✓ RewardDistributor manager addresses set");
  } else {
    console.log("✓ RewardDistributor manager addresses already correct");
  }

  console.log("\nUpgrade complete.");
}

async function importProxy(address: string, factory: Awaited<ReturnType<typeof ethers.getContractFactory>>) {
  try {
    await upgrades.forceImport(address, factory, { kind: "uups" });
    console.log(`✓ Imported proxy ${address}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("already been imported") || message.includes("is already registered")) {
      console.log(`✓ Proxy already imported ${address}`);
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
