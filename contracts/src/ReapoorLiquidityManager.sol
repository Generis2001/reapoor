// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ReapoorLiquidityManager
/// @notice Manages USDC and EURC liquidity provision with reward accounting
contract ReapoorLiquidityManager is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    uint256 private constant SECONDS_PER_YEAR = 365 days;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public usdc;
    IERC20 public eurc;

    struct LiquidityPosition {
        uint256 usdcShares;
        uint256 eurcShares;
        uint256 usdcRewardDebt;
        uint256 eurcRewardDebt;
        uint256 depositedAt;
    }

    struct LiquidityPool {
        uint256 totalUsdcDeposited;
        uint256 totalEurcDeposited;
        uint256 totalUsdcShares;
        uint256 totalEurcShares;
        uint256 accUsdcRewardPerShare;
        uint256 accEurcRewardPerShare;
        uint256 usdcApy;
        uint256 eurcApy;
    }

    LiquidityPool public liqPool;

    mapping(address => LiquidityPosition) public positions;
    mapping(address => uint256) public pendingUsdcRewards;
    mapping(address => uint256) public pendingEurcRewards;
    mapping(address => uint256) public lifetimeUsdcEarned;
    mapping(address => uint256) public lifetimeEurcEarned;
    uint256 public totalProviders;
    uint256 public totalUsdcDistributed;
    uint256 public totalEurcDistributed;
    uint256 public lastRewardTimestamp;
    uint256 public rewardUsdcReserve;
    uint256 public rewardEurcReserve;

    event LiquidityAdded(address indexed user, uint256 usdcAmount, uint256 eurcAmount);
    event LiquidityRemoved(address indexed user, uint256 usdcAmount, uint256 eurcAmount);
    event RewardsClaimed(address indexed user, uint256 usdcReward, uint256 eurcReward);
    event RewardsAdded(uint256 usdcAmount, uint256 eurcAmount);
    event ApyUpdated(uint256 usdcApy, uint256 eurcApy);
    event EmergencyWithdraw(address indexed user, uint256 usdcAmount, uint256 eurcAmount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

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
        liqPool.usdcApy = _usdcApy;
        liqPool.eurcApy = _eurcApy;
        lastRewardTimestamp = block.timestamp;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(DISTRIBUTOR_ROLE, _distributor);
        _grantRole(UPGRADER_ROLE, _admin);
    }

    function addLiquidity(uint256 usdcAmount, uint256 eurcAmount)
        external
        nonReentrant
        whenNotPaused
    {
        require(usdcAmount > 0 || eurcAmount > 0, "Zero liquidity");
        _updatePool();
        _settlePending(msg.sender);

        LiquidityPosition storage pos = positions[msg.sender];
        bool isNew = pos.usdcShares == 0 && pos.eurcShares == 0;

        if (usdcAmount > 0) {
            usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
            uint256 shares = liqPool.totalUsdcShares == 0
                ? usdcAmount
                : (usdcAmount * liqPool.totalUsdcShares) / liqPool.totalUsdcDeposited;
            pos.usdcShares += shares;
            liqPool.totalUsdcShares += shares;
            liqPool.totalUsdcDeposited += usdcAmount;
        }

        if (eurcAmount > 0) {
            eurc.safeTransferFrom(msg.sender, address(this), eurcAmount);
            uint256 shares = liqPool.totalEurcShares == 0
                ? eurcAmount
                : (eurcAmount * liqPool.totalEurcShares) / liqPool.totalEurcDeposited;
            pos.eurcShares += shares;
            liqPool.totalEurcShares += shares;
            liqPool.totalEurcDeposited += eurcAmount;
        }

        if (isNew && (pos.usdcShares > 0 || pos.eurcShares > 0)) {
            totalProviders++;
            pos.depositedAt = block.timestamp;
        }

        pos.usdcRewardDebt = (pos.usdcShares * liqPool.accUsdcRewardPerShare) / 1e18;
        pos.eurcRewardDebt = (pos.eurcShares * liqPool.accEurcRewardPerShare) / 1e18;

        emit LiquidityAdded(msg.sender, usdcAmount, eurcAmount);
    }

    function removeLiquidity(uint256 usdcShareAmount, uint256 eurcShareAmount)
        external
        nonReentrant
        whenNotPaused
    {
        LiquidityPosition storage pos = positions[msg.sender];
        require(usdcShareAmount <= pos.usdcShares && eurcShareAmount <= pos.eurcShares, "Insufficient shares");

        _updatePool();
        _settlePending(msg.sender);
        _claimInternal(msg.sender);

        uint256 usdcOut;
        uint256 eurcOut;

        if (usdcShareAmount > 0) {
            usdcOut = (usdcShareAmount * liqPool.totalUsdcDeposited) / liqPool.totalUsdcShares;
            pos.usdcShares -= usdcShareAmount;
            liqPool.totalUsdcShares -= usdcShareAmount;
            liqPool.totalUsdcDeposited -= usdcOut;
            usdc.safeTransfer(msg.sender, usdcOut);
        }

        if (eurcShareAmount > 0) {
            eurcOut = (eurcShareAmount * liqPool.totalEurcDeposited) / liqPool.totalEurcShares;
            pos.eurcShares -= eurcShareAmount;
            liqPool.totalEurcShares -= eurcShareAmount;
            liqPool.totalEurcDeposited -= eurcOut;
            eurc.safeTransfer(msg.sender, eurcOut);
        }

        if (pos.usdcShares == 0 && pos.eurcShares == 0 && totalProviders > 0) {
            totalProviders--;
        }

        pos.usdcRewardDebt = (pos.usdcShares * liqPool.accUsdcRewardPerShare) / 1e18;
        pos.eurcRewardDebt = (pos.eurcShares * liqPool.accEurcRewardPerShare) / 1e18;

        emit LiquidityRemoved(msg.sender, usdcOut, eurcOut);
    }

    function claimRewards() external nonReentrant whenNotPaused {
        _updatePool();
        _settlePending(msg.sender);
        _claimInternal(msg.sender);

        LiquidityPosition storage pos = positions[msg.sender];
        pos.usdcRewardDebt = (pos.usdcShares * liqPool.accUsdcRewardPerShare) / 1e18;
        pos.eurcRewardDebt = (pos.eurcShares * liqPool.accEurcRewardPerShare) / 1e18;
    }

    function addRewards(uint256 usdcAmount, uint256 eurcAmount)
        external
        onlyRole(DISTRIBUTOR_ROLE)
    {
        _updatePool();

        if (usdcAmount > 0) {
            usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
            rewardUsdcReserve += usdcAmount;
        }
        if (eurcAmount > 0) {
            eurc.safeTransferFrom(msg.sender, address(this), eurcAmount);
            rewardEurcReserve += eurcAmount;
        }

        emit RewardsAdded(usdcAmount, eurcAmount);
    }

    function emergencyWithdraw() external nonReentrant {
        _updatePool();
        _settlePending(msg.sender);

        LiquidityPosition storage pos = positions[msg.sender];
        uint256 forfeitedUsdc = pendingUsdcRewards[msg.sender];
        uint256 forfeitedEurc = pendingEurcRewards[msg.sender];

        uint256 usdcOut;
        uint256 eurcOut;

        if (forfeitedUsdc > 0) {
            rewardUsdcReserve += forfeitedUsdc;
            totalUsdcDistributed -= forfeitedUsdc;
        }
        if (forfeitedEurc > 0) {
            rewardEurcReserve += forfeitedEurc;
            totalEurcDistributed -= forfeitedEurc;
        }

        if (pos.usdcShares > 0 && liqPool.totalUsdcShares > 0) {
            usdcOut = (pos.usdcShares * liqPool.totalUsdcDeposited) / liqPool.totalUsdcShares;
            liqPool.totalUsdcShares -= pos.usdcShares;
            liqPool.totalUsdcDeposited -= usdcOut;
        }
        if (pos.eurcShares > 0 && liqPool.totalEurcShares > 0) {
            eurcOut = (pos.eurcShares * liqPool.totalEurcDeposited) / liqPool.totalEurcShares;
            liqPool.totalEurcShares -= pos.eurcShares;
            liqPool.totalEurcDeposited -= eurcOut;
        }

        delete positions[msg.sender];
        pendingUsdcRewards[msg.sender] = 0;
        pendingEurcRewards[msg.sender] = 0;

        if ((usdcOut > 0 || eurcOut > 0) && totalProviders > 0) totalProviders--;

        if (usdcOut > 0) usdc.safeTransfer(msg.sender, usdcOut);
        if (eurcOut > 0) eurc.safeTransfer(msg.sender, eurcOut);

        emit EmergencyWithdraw(msg.sender, usdcOut, eurcOut);
    }

    function updateApy(uint256 _usdcApy, uint256 _eurcApy) external onlyRole(ADMIN_ROLE) {
        require(_usdcApy <= 10000 && _eurcApy <= 10000, "APY too high");
        _updatePool();
        liqPool.usdcApy = _usdcApy;
        liqPool.eurcApy = _eurcApy;
        emit ApyUpdated(_usdcApy, _eurcApy);
    }

    function getUserShares(address user) external view returns (uint256 usdcShares, uint256 eurcShares) {
        return (positions[user].usdcShares, positions[user].eurcShares);
    }

    function getUserDeposits(address user) external view returns (uint256 usdcDeposit, uint256 eurcDeposit) {
        LiquidityPosition memory pos = positions[user];
        if (liqPool.totalUsdcShares > 0 && pos.usdcShares > 0) {
            usdcDeposit = (pos.usdcShares * liqPool.totalUsdcDeposited) / liqPool.totalUsdcShares;
        }
        if (liqPool.totalEurcShares > 0 && pos.eurcShares > 0) {
            eurcDeposit = (pos.eurcShares * liqPool.totalEurcDeposited) / liqPool.totalEurcShares;
        }
    }

    function getPendingRewards(address user) external view returns (uint256, uint256) {
        LiquidityPosition memory pos = positions[user];
        (uint256 accUsdc, uint256 accEurc) = _previewAccRewardPerShare();
        uint256 pendingUsdc = pendingUsdcRewards[user] +
            (pos.usdcShares * accUsdc / 1e18) - pos.usdcRewardDebt;
        uint256 pendingEurc = pendingEurcRewards[user] +
            (pos.eurcShares * accEurc / 1e18) - pos.eurcRewardDebt;
        return (pendingUsdc, pendingEurc);
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function _settlePending(address user) internal {
        LiquidityPosition memory pos = positions[user];
        if (pos.usdcShares > 0) {
            uint256 p = (pos.usdcShares * liqPool.accUsdcRewardPerShare / 1e18) - pos.usdcRewardDebt;
            if (p > 0) pendingUsdcRewards[user] += p;
        }
        if (pos.eurcShares > 0) {
            uint256 p = (pos.eurcShares * liqPool.accEurcRewardPerShare / 1e18) - pos.eurcRewardDebt;
            if (p > 0) pendingEurcRewards[user] += p;
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

    function _updatePool() internal {
        (uint256 accUsdc, uint256 accEurc, uint256 usdcReward, uint256 eurcReward) = _previewPoolUpdate();
        liqPool.accUsdcRewardPerShare = accUsdc;
        liqPool.accEurcRewardPerShare = accEurc;
        if (usdcReward > 0) {
            rewardUsdcReserve -= usdcReward;
            totalUsdcDistributed += usdcReward;
        }
        if (eurcReward > 0) {
            rewardEurcReserve -= eurcReward;
            totalEurcDistributed += eurcReward;
        }
        lastRewardTimestamp = block.timestamp;
    }

    function _previewAccRewardPerShare() internal view returns (uint256 accUsdc, uint256 accEurc) {
        (accUsdc, accEurc,,) = _previewPoolUpdate();
    }

    function _previewPoolUpdate()
        internal
        view
        returns (uint256 accUsdc, uint256 accEurc, uint256 usdcReward, uint256 eurcReward)
    {
        accUsdc = liqPool.accUsdcRewardPerShare;
        accEurc = liqPool.accEurcRewardPerShare;

        uint256 lastUpdated = lastRewardTimestamp == 0 ? block.timestamp : lastRewardTimestamp;
        if (block.timestamp <= lastUpdated) {
            return (accUsdc, accEurc, 0, 0);
        }

        uint256 elapsed = block.timestamp - lastUpdated;

        if (liqPool.totalUsdcDeposited > 0 && liqPool.totalUsdcShares > 0 && liqPool.usdcApy > 0 && rewardUsdcReserve > 0) {
            usdcReward = _computeAccruedReward(
                liqPool.totalUsdcDeposited,
                liqPool.usdcApy,
                elapsed,
                rewardUsdcReserve
            );
            if (usdcReward > 0) {
                accUsdc += (usdcReward * 1e18) / liqPool.totalUsdcShares;
            }
        }

        if (liqPool.totalEurcDeposited > 0 && liqPool.totalEurcShares > 0 && liqPool.eurcApy > 0 && rewardEurcReserve > 0) {
            eurcReward = _computeAccruedReward(
                liqPool.totalEurcDeposited,
                liqPool.eurcApy,
                elapsed,
                rewardEurcReserve
            );
            if (eurcReward > 0) {
                accEurc += (eurcReward * 1e18) / liqPool.totalEurcShares;
            }
        }
    }

    function _computeAccruedReward(
        uint256 principal,
        uint256 apyBps,
        uint256 elapsed,
        uint256 reserve
    ) internal pure returns (uint256 reward) {
        if (principal == 0 || apyBps == 0 || elapsed == 0 || reserve == 0) {
            return 0;
        }

        reward = (principal * apyBps * elapsed) / 10000 / SECONDS_PER_YEAR;
        if (reward > reserve) {
            reward = reserve;
        }
    }

    function _authorizeUpgrade(address newImpl) internal override onlyRole(UPGRADER_ROLE) {}
}
