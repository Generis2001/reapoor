// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title TreasuryVault
/// @notice Manages protocol reserves and reward funding for Reapoor
contract TreasuryVault is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public usdc;
    IERC20 public eurc;

    uint256 public totalUsdcDeposited;
    uint256 public totalEurcDeposited;
    uint256 public totalUsdcWithdrawn;
    uint256 public totalEurcWithdrawn;

    event Deposited(address indexed from, address indexed token, uint256 amount);
    event Withdrawn(address indexed to, address indexed token, uint256 amount);
    event FundedDistributor(address indexed distributor, uint256 usdcAmount, uint256 eurcAmount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(
        address _usdc,
        address _eurc,
        address _admin
    ) external initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(TREASURER_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
    }

    function depositUsdc(uint256 amount) external nonReentrant whenNotPaused {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        totalUsdcDeposited += amount;
        emit Deposited(msg.sender, address(usdc), amount);
    }

    function depositEurc(uint256 amount) external nonReentrant whenNotPaused {
        eurc.safeTransferFrom(msg.sender, address(this), amount);
        totalEurcDeposited += amount;
        emit Deposited(msg.sender, address(eurc), amount);
    }

    function withdrawUsdc(address to, uint256 amount)
        external
        onlyRole(TREASURER_ROLE)
        nonReentrant
    {
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC");
        usdc.safeTransfer(to, amount);
        totalUsdcWithdrawn += amount;
        emit Withdrawn(to, address(usdc), amount);
    }

    function withdrawEurc(address to, uint256 amount)
        external
        onlyRole(TREASURER_ROLE)
        nonReentrant
    {
        require(eurc.balanceOf(address(this)) >= amount, "Insufficient EURC");
        eurc.safeTransfer(to, amount);
        totalEurcWithdrawn += amount;
        emit Withdrawn(to, address(eurc), amount);
    }

    function fundDistributor(address distributor, uint256 usdcAmount, uint256 eurcAmount)
        external
        onlyRole(TREASURER_ROLE)
        nonReentrant
    {
        if (usdcAmount > 0) {
            usdc.safeTransfer(distributor, usdcAmount);
            totalUsdcWithdrawn += usdcAmount;
        }
        if (eurcAmount > 0) {
            eurc.safeTransfer(distributor, eurcAmount);
            totalEurcWithdrawn += eurcAmount;
        }
        emit FundedDistributor(distributor, usdcAmount, eurcAmount);
    }

    function getBalances() external view returns (uint256 usdcBal, uint256 eurcBal) {
        return (usdc.balanceOf(address(this)), eurc.balanceOf(address(this)));
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function _authorizeUpgrade(address newImpl) internal override onlyRole(UPGRADER_ROLE) {}
}
