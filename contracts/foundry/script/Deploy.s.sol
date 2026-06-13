// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/ReapoorStakingManager.sol";
import "../src/ReapoorLiquidityManager.sol";
import "../src/RewardDistributor.sol";
import "../src/TreasuryVault.sol";

contract Deploy is Script {
    address constant USDC = 0x3600000000000000000000000000000000000000;
    address constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;

    // Staking APYs in basis points (800 = 8%, 750 = 7.5%)
    uint256 constant STAKING_USDC_APY = 800;
    uint256 constant STAKING_EURC_APY = 750;

    // Liquidity APYs in basis points (900 = 9%, 850 = 8.5%)
    uint256 constant LIQ_USDC_APY = 900;
    uint256 constant LIQ_EURC_APY = 850;

    bytes32 constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerKey);

        // ── 1. TreasuryVault ────────────────────────────────────────────────
        TreasuryVault vaultImpl = new TreasuryVault();
        ERC1967Proxy vaultProxy = new ERC1967Proxy(
            address(vaultImpl),
            abi.encodeCall(TreasuryVault.initialize, (USDC, EURC, deployer))
        );
        console.log("TreasuryVault impl: ", address(vaultImpl));
        console.log("TreasuryVault proxy:", address(vaultProxy));

        // ── 2. StakingManager ───────────────────────────────────────────────
        // deployer is initial distributor; real distributor role granted after
        ReapoorStakingManager stakingImpl = new ReapoorStakingManager();
        ERC1967Proxy stakingProxy = new ERC1967Proxy(
            address(stakingImpl),
            abi.encodeCall(
                ReapoorStakingManager.initialize,
                (USDC, EURC, deployer, deployer, STAKING_USDC_APY, STAKING_EURC_APY)
            )
        );
        console.log("StakingManager impl: ", address(stakingImpl));
        console.log("StakingManager proxy:", address(stakingProxy));

        // ── 3. LiquidityManager ─────────────────────────────────────────────
        ReapoorLiquidityManager liqImpl = new ReapoorLiquidityManager();
        ERC1967Proxy liqProxy = new ERC1967Proxy(
            address(liqImpl),
            abi.encodeCall(
                ReapoorLiquidityManager.initialize,
                (USDC, EURC, deployer, deployer, LIQ_USDC_APY, LIQ_EURC_APY)
            )
        );
        console.log("LiquidityManager impl: ", address(liqImpl));
        console.log("LiquidityManager proxy:", address(liqProxy));

        // ── 4. RewardDistributor ────────────────────────────────────────────
        RewardDistributor distImpl = new RewardDistributor();
        ERC1967Proxy distProxy = new ERC1967Proxy(
            address(distImpl),
            abi.encodeCall(
                RewardDistributor.initialize,
                (USDC, EURC, deployer, address(stakingProxy), address(liqProxy), address(vaultProxy))
            )
        );
        console.log("RewardDistributor impl: ", address(distImpl));
        console.log("RewardDistributor proxy:", address(distProxy));

        // ── 5. Grant DISTRIBUTOR_ROLE to RewardDistributor on both managers ─
        ReapoorStakingManager(address(stakingProxy)).grantRole(DISTRIBUTOR_ROLE, address(distProxy));
        ReapoorLiquidityManager(address(liqProxy)).grantRole(DISTRIBUTOR_ROLE, address(distProxy));
        console.log("DISTRIBUTOR_ROLE granted to RewardDistributor on both managers");

        vm.stopBroadcast();

        console.log("\n=== Deployed Proxy Addresses ===");
        console.log("StakingManager:    ", address(stakingProxy));
        console.log("LiquidityManager:  ", address(liqProxy));
        console.log("RewardDistributor: ", address(distProxy));
        console.log("TreasuryVault:     ", address(vaultProxy));
    }
}
