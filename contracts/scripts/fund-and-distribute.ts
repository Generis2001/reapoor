import { ethers } from "hardhat";

const ADDRS = {
  usdc: "0x3600000000000000000000000000000000000000",
  eurc: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  treasury: "0x1d28471bbDf6e33618b04D99041a9a27C4568141",
  distributor: "0xf0c4fbd10b53a607D8A5EeF15696c3fD4b850a3c",
} as const;

const DEPOSIT_USDC = "10";
const DEPOSIT_EURC = "10";
const DISTRIBUTE_USDC = "4";
const DISTRIBUTE_EURC = "4";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const treasury = await ethers.getContractAt("TreasuryVault", ADDRS.treasury);
  const distributor = await ethers.getContractAt("RewardDistributor", ADDRS.distributor);
  const usdc = new ethers.Contract(ADDRS.usdc, ERC20_ABI, signer);
  const eurc = new ethers.Contract(ADDRS.eurc, ERC20_ABI, signer);

  const depositUsdc = ethers.parseUnits(DEPOSIT_USDC, 6);
  const depositEurc = ethers.parseUnits(DEPOSIT_EURC, 6);
  const distributeUsdc = ethers.parseUnits(DISTRIBUTE_USDC, 6);
  const distributeEurc = ethers.parseUnits(DISTRIBUTE_EURC, 6);

  console.log("Funding treasury and distributing rewards...");
  console.log("Signer:", signer.address);

  await ensureAllowance(usdc, signer.address, ADDRS.treasury, depositUsdc, "USDC");
  await ensureAllowance(eurc, signer.address, ADDRS.treasury, depositEurc, "EURC");

  await (await treasury.depositUsdc(depositUsdc)).wait();
  console.log(`✓ Deposited ${DEPOSIT_USDC} USDC to treasury`);

  await (await treasury.depositEurc(depositEurc)).wait();
  console.log(`✓ Deposited ${DEPOSIT_EURC} EURC to treasury`);

  await (await distributor.distribute(distributeUsdc, distributeEurc)).wait();
  console.log(`✓ Distributed ${DISTRIBUTE_USDC} USDC + ${DISTRIBUTE_EURC} EURC`);
}

async function ensureAllowance(
  token: ethers.Contract,
  owner: string,
  spender: string,
  amount: bigint,
  symbol: string,
) {
  const allowance = (await token.allowance(owner, spender)) as bigint;
  if (allowance >= amount) {
    return;
  }

  await (await token.approve(spender, amount)).wait();
  console.log(`✓ Approved ${symbol} for treasury deposit`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
