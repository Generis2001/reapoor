// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ReapoorStakingManager
/// @notice Manages USDC and EURC staking with reward distribution on Arc Testnet
contract ReapoorStakingManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public usdc;
    IERC20 public eurc;

    struct StakePosition {
        uint256 usdcAmount;
        uint256 eurcAmount;
        uint256 usdcRewardDebt;
        uint256 eurcRewardDebt;
        uint256 stakedAt;
        uint256 lastClaimAt;
    }

    struct PoolState {
        uint256 totalUsdcStaked;
        uint256 totalEurcStaked;
        uint256 accUsdcRewardPerShare; // scaled by 1e18
        uint256 accEurcRewardPerShare; // scaled by 1e18
        uint256 usdcApy;  // basis points (e.g. 800 = 8%)
        uint256 eurcApy;  // basis points
        uint256 lastRewardBlock;
    }

    PoolState public pool;

    mapping(address => StakePosition) public positions;
    mapping(address => uint256) public pendingUsdcRewards;
    mapping(address => uint256) public pendingEurcRewards;
    mapping(address => uint256) public lifetimeUsdcEarned;
    mapping(address => uint256) public lifetimeEurcEarned;

    address public rewardDistributor;

    uint256 public totalUniqueStakers;
    uint256 public totalUsdcDistributed;
    uint256 public totalEurcDistributed;

    event Staked(address indexed user, uint256 usdcAmount, uint256 eurcAmount);
    event Unstaked(address indexed user, uint256 usdcAmount, uint256 eurcAmount);
    event RewardsClaimed(address indexed user, uint256 usdcReward, uint256 eurcReward);
    event RewardsAdded(uint256 usdcAmount, uint256 eurcAmount);
    event ApyUpdated(uint256 usdcApy, uint256 eurcApy);
    event EmergencyWithdraw(address indexed user, uint256 usdcAmount, uint256 eurcAmount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _usdc,
        address _eurc,
        address _admin,
        address _distributor,
        uint256 _usdcApy,
        uint256 _eurcApy
    ) external initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        rewardDistributor = _distributor;

        pool.usdcApy = _usdcApy;
        pool.eurcApy = _eurcApy;
        pool.lastRewardBlock = block.number;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(DISTRIBUTOR_ROLE, _distributor);
        _grantRole(UPGRADER_ROLE, _admin);
    }

    function stake(uint256 usdcAmount, uint256 eurcAmount)
        external
        nonReentrant
        whenNotPaused
    {
        require(usdcAmount > 0 || eurcAmount > 0, "Zero stake");
        _updatePool();
        _settlePending(msg.sender);

        StakePosition storage pos = positions[msg.sender];

        if (pos.usdcAmount == 0 && pos.eurcAmount == 0) {
            totalUniqueStakers++;
            pos.stakedAt = block.timestamp;
        }

        if (usdcAmount > 0) {
            usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
            pos.usdcAmount += usdcAmount;
            pool.totalUsdcStaked += usdcAmount;
        }
        if (eurcAmount > 0) {
            eurc.safeTransferFrom(msg.sender, address(this), eurcAmount);
            pos.eurcAmount += eurcAmount;
            pool.totalEurcStaked += eurcAmount;
        }

        pos.usdcRewardDebt = (pos.usdcAmount * pool.accUsdcRewardPerShare) / 1e18;
        pos.eurcRewardDebt = (pos.eurcAmount * pool.accEurcRewardPerShare) / 1e18;
        pos.lastClaimAt = block.timestamp;

        emit Staked(msg.sender, usdcAmount, eurcAmount);
    }

    function unstake(uint256 usdcAmount, uint256 eurcAmount)
        external
        nonReentrant
        whenNotPaused
    {
        StakePosition storage pos = positions[msg.sender];
        require(usdcAmount <= pos.usdcAmount && eurcAmount <= pos.eurcAmount, "Insufficient stake");

        _updatePool();
        _settlePending(msg.sender);
        _claimInternal(msg.sender);

        if (usdcAmount > 0) {
            pos.usdcAmount -= usdcAmount;
            pool.totalUsdcStaked -= usdcAmount;
            usdc.safeTransfer(msg.sender, usdcAmount);
        }
        if (eurcAmount > 0) {
            pos.eurcAmount -= eurcAmount;
            pool.totalEurcStaked -= eurcAmount;
            eurc.safeTransfer(msg.sender, eurcAmount);
        }

        if (pos.usdcAmount == 0 && pos.eurcAmount == 0 && totalUniqueStakers > 0) {
            totalUniqueStakers--;
        }

        pos.usdcRewardDebt = (pos.usdcAmount * pool.accUsdcRewardPerShare) / 1e18;
        pos.eurcRewardDebt = (pos.eurcAmount * pool.accEurcRewardPerShare) / 1e18;

        emit Unstaked(msg.sender, usdcAmount, eurcAmount);
    }

    function claimRewards() external nonReentrant whenNotPaused {
        _updatePool();
        _settlePending(msg.sender);
        _claimInternal(msg.sender);

        StakePosition storage pos = positions[msg.sender];
        pos.usdcRewardDebt = (pos.usdcAmount * pool.accUsdcRewardPerShare) / 1e18;
        pos.eurcRewardDebt = (pos.eurcAmount * pool.accEurcRewardPerShare) / 1e18;
        pos.lastClaimAt = block.timestamp;
    }

    function addRewards(uint256 usdcAmount, uint256 eurcAmount)
        external
        onlyRole(DISTRIBUTOR_ROLE)
    {
        _updatePool();

        if (usdcAmount > 0 && pool.totalUsdcStaked > 0) {
            usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
            pool.accUsdcRewardPerShare += (usdcAmount * 1e18) / pool.totalUsdcStaked;
            totalUsdcDistributed += usdcAmount;
        }
        if (eurcAmount > 0 && pool.totalEurcStaked > 0) {
            eurc.safeTransferFrom(msg.sender, address(this), eurcAmount);
            pool.accEurcRewardPerShare += (eurcAmount * 1e18) / pool.totalEurcStaked;
            totalEurcDistributed += eurcAmount;
        }

        emit RewardsAdded(usdcAmount, eurcAmount);
    }

    function emergencyWithdraw() external nonReentrant {
        StakePosition storage pos = positions[msg.sender];
        uint256 uAmt = pos.usdcAmount;
        uint256 eAmt = pos.eurcAmount;

        pos.usdcAmount = 0;
        pos.eurcAmount = 0;
        pos.usdcRewardDebt = 0;
        pos.eurcRewardDebt = 0;
        pendingUsdcRewards[msg.sender] = 0;
        pendingEurcRewards[msg.sender] = 0;

        if (uAmt > 0) {
            pool.totalUsdcStaked -= uAmt;
            usdc.safeTransfer(msg.sender, uAmt);
        }
        if (eAmt > 0) {
            pool.totalEurcStaked -= eAmt;
            eurc.safeTransfer(msg.sender, eAmt);
        }

        if ((uAmt > 0 || eAmt > 0) && totalUniqueStakers > 0) {
            totalUniqueStakers--;
        }

        emit EmergencyWithdraw(msg.sender, uAmt, eAmt);
    }

    function updateApy(uint256 _usdcApy, uint256 _eurcApy)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(_usdcApy <= 10000 && _eurcApy <= 10000, "APY too high");
        pool.usdcApy = _usdcApy;
        pool.eurcApy = _eurcApy;
        emit ApyUpdated(_usdcApy, _eurcApy);
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function getPendingRewards(address user)
        external
        view
        returns (uint256 pendingUsdc, uint256 pendingEurc)
    {
        StakePosition memory pos = positions[user];
        uint256 accUsdc = pool.accUsdcRewardPerShare;
        uint256 accEurc = pool.accEurcRewardPerShare;

        pendingUsdc = pendingUsdcRewards[user] + (pos.usdcAmount * accUsdc / 1e18) - pos.usdcRewardDebt;
        pendingEurc = pendingEurcRewards[user] + (pos.eurcAmount * accEurc / 1e18) - pos.eurcRewardDebt;
    }

    function _updatePool() internal {
        pool.lastRewardBlock = block.number;
    }

    function _settlePending(address user) internal {
        StakePosition memory pos = positions[user];
        if (pos.usdcAmount > 0) {
            uint256 pending = (pos.usdcAmount * pool.accUsdcRewardPerShare / 1e18) - pos.usdcRewardDebt;
            if (pending > 0) pendingUsdcRewards[user] += pending;
        }
        if (pos.eurcAmount > 0) {
            uint256 pending = (pos.eurcAmount * pool.accEurcRewardPerShare / 1e18) - pos.eurcRewardDebt;
            if (pending > 0) pendingEurcRewards[user] += pending;
        }
    }

    function _claimInternal(address user) internal {
        uint256 uReward = pendingUsdcRewards[user];
        uint256 eReward = pendingEurcRewards[user];

        if (uReward > 0) {
            pendingUsdcRewards[user] = 0;
            lifetimeUsdcEarned[user] += uReward;
            usdc.safeTransfer(user, uReward);
        }
        if (eReward > 0) {
            pendingEurcRewards[user] = 0;
            lifetimeEurcEarned[user] += eReward;
            eurc.safeTransfer(user, eReward);
        }

        if (uReward > 0 || eReward > 0) {
            emit RewardsClaimed(user, uReward, eReward);
        }
    }

    function _authorizeUpgrade(address newImpl) internal override onlyRole(UPGRADER_ROLE) {}
}
