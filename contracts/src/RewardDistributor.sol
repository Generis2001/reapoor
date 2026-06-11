// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IReapoorManager {
    function addRewards(uint256 usdcAmount, uint256 eurcAmount) external;
}

/// @title RewardDistributor
/// @notice Orchestrates reward distribution to staking and liquidity managers
contract RewardDistributor is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public usdc;
    IERC20 public eurc;

    address public stakingManager;
    address public liquidityManager;
    address public treasuryVault;

    uint256 public stakingUsdcAllocation;  // basis points of total usdc to staking
    uint256 public stakingEurcAllocation;
    uint256 public liquidityUsdcAllocation;
    uint256 public liquidityEurcAllocation;

    uint256 public distributionEpoch;
    uint256 public lastDistributionTimestamp;
    uint256 public minDistributionInterval; // seconds

    uint256 public totalUsdcDistributed;
    uint256 public totalEurcDistributed;

    event RewardsDistributed(
        uint256 epoch,
        uint256 stakingUsdc,
        uint256 stakingEurc,
        uint256 liqUsdc,
        uint256 liqEurc
    );
    event AllocationUpdated(
        uint256 stakingUsdc,
        uint256 stakingEurc,
        uint256 liqUsdc,
        uint256 liqEurc
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address _usdc,
        address _eurc,
        address _admin,
        address _staking,
        address _liquidity,
        address _treasury
    ) external initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        stakingManager = _staking;
        liquidityManager = _liquidity;
        treasuryVault = _treasury;

        stakingUsdcAllocation = 5000;     // 50%
        stakingEurcAllocation = 5000;
        liquidityUsdcAllocation = 5000;   // 50%
        liquidityEurcAllocation = 5000;

        minDistributionInterval = 1 days;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
    }

    function distribute(uint256 totalUsdc, uint256 totalEurc)
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
    {
        require(
            block.timestamp >= lastDistributionTimestamp + minDistributionInterval,
            "Too soon"
        );

        uint256 stakingUsdc = (totalUsdc * stakingUsdcAllocation) / 10000;
        uint256 liqUsdc = totalUsdc - stakingUsdc;
        uint256 stakingEurc = (totalEurc * stakingEurcAllocation) / 10000;
        uint256 liqEurc = totalEurc - stakingEurc;

        if (totalUsdc > 0) usdc.safeTransferFrom(msg.sender, address(this), totalUsdc);
        if (totalEurc > 0) eurc.safeTransferFrom(msg.sender, address(this), totalEurc);

        if (stakingUsdc > 0) usdc.approve(stakingManager, stakingUsdc);
        if (stakingEurc > 0) eurc.approve(stakingManager, stakingEurc);
        if (stakingUsdc > 0 || stakingEurc > 0) {
            IReapoorManager(stakingManager).addRewards(stakingUsdc, stakingEurc);
        }

        if (liqUsdc > 0) usdc.approve(liquidityManager, liqUsdc);
        if (liqEurc > 0) eurc.approve(liquidityManager, liqEurc);
        if (liqUsdc > 0 || liqEurc > 0) {
            IReapoorManager(liquidityManager).addRewards(liqUsdc, liqEurc);
        }

        totalUsdcDistributed += totalUsdc;
        totalEurcDistributed += totalEurc;
        lastDistributionTimestamp = block.timestamp;
        distributionEpoch++;

        emit RewardsDistributed(distributionEpoch, stakingUsdc, stakingEurc, liqUsdc, liqEurc);
    }

    function updateAllocations(
        uint256 _stakingUsdc,
        uint256 _stakingEurc,
        uint256 _liqUsdc,
        uint256 _liqEurc
    ) external onlyRole(ADMIN_ROLE) {
        require(_stakingUsdc + _liqUsdc == 10000, "USDC alloc must sum to 10000");
        require(_stakingEurc + _liqEurc == 10000, "EURC alloc must sum to 10000");
        stakingUsdcAllocation = _stakingUsdc;
        stakingEurcAllocation = _stakingEurc;
        liquidityUsdcAllocation = _liqUsdc;
        liquidityEurcAllocation = _liqEurc;
        emit AllocationUpdated(_stakingUsdc, _stakingEurc, _liqUsdc, _liqEurc);
    }

    function setMinDistributionInterval(uint256 interval) external onlyRole(ADMIN_ROLE) {
        minDistributionInterval = interval;
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function _authorizeUpgrade(address newImpl) internal override onlyRole(UPGRADER_ROLE) {}
}
