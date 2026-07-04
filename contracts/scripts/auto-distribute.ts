import { ethers } from "hardhat";

const ADDRS = {
  usdc: "0x3600000000000000000000000000000000000000",
  eurc: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  treasury: "0x1d28471bbDf6e33618b04D99041a9a27C4568141",
  distributor: "0xf0c4fbd10b53a607D8A5EeF15696c3fD4b850a3c",
} as const;

const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const latestBlock = await ethers.provider.getBlock("latest");
  const distributor = await ethers.getContractAt("RewardDistributor", ADDRS.distributor);
  const usdc = new ethers.Contract(ADDRS.usdc, ERC20_ABI, signer);
  const eurc = new ethers.Contract(ADDRS.eurc, ERC20_ABI, signer);

  if (!latestBlock) {
    throw new Error("Unable to read latest block");
  }

  const now = BigInt(latestBlock.timestamp);
  const lastDistributionTimestamp = await distributor.lastDistributionTimestamp();
  const minDistributionInterval = await distributor.minDistributionInterval();
  const nextDistributionTimestamp = lastDistributionTimestamp + minDistributionInterval;

  console.log("Auto distribution check");
  console.log("Signer:", signer.address);
  console.log("Last distribution:", lastDistributionTimestamp.toString());
  console.log("Min interval:", minDistributionInterval.toString());
  console.log("Next eligible:", nextDistributionTimestamp.toString());
  console.log("Current time:", now.toString());

  if (now < nextDistributionTimestamp) {
    console.log("Skipping: distribution cooldown still active.");
    return;
  }

  const treasuryUsdc = await usdc.balanceOf(ADDRS.treasury);
  const treasuryEurc = await eurc.balanceOf(ADDRS.treasury);
  const distributorUsdc = await usdc.balanceOf(ADDRS.distributor);
  const distributorEurc = await eurc.balanceOf(ADDRS.distributor);

  const totalUsdc = treasuryUsdc + distributorUsdc;
  const totalEurc = treasuryEurc + distributorEurc;

  console.log("Treasury balances:", {
    usdc: treasuryUsdc.toString(),
    eurc: treasuryEurc.toString(),
  });
  console.log("Distributor balances:", {
    usdc: distributorUsdc.toString(),
    eurc: distributorEurc.toString(),
  });

  if (totalUsdc === 0n && totalEurc === 0n) {
    console.log("Skipping: no reward inventory available.");
    return;
  }

  const tx = await distributor.distribute(totalUsdc, totalEurc);
  console.log("Distribution tx:", tx.hash);
  await tx.wait();
  console.log("Distribution complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
