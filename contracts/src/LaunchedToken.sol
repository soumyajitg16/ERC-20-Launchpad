// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20Metadata} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/// @title LaunchedToken
/// @notice ERC20 implementation used behind EIP-1167 minimal proxy clones.
/// @dev The implementation contract is deployed once by TokenLaunchpad. Each clone calls
/// `initialize` exactly once to set token metadata, owner, and initial balances.
contract LaunchedToken is IERC20Metadata, Initializable {
    uint8 private constant TOKEN_DECIMALS = 18;

    string private _name;
    string private _symbol;
    uint256 private _totalSupply;
    address private _owner;

    mapping(address account => uint256) private _balances;
    mapping(address account => mapping(address spender => uint256)) private _allowances;

    error InvalidOwner();
    error InvalidSender();
    error InvalidReceiver();
    error InvalidSpender();
    error InsufficientBalance(uint256 available, uint256 required);
    error InsufficientAllowance(uint256 available, uint256 required);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes clone storage after the factory deploys the minimal proxy.
    /// @param name_ Human-readable token name.
    /// @param symbol_ ERC20 token symbol.
    /// @param initialSupply Supply amount in the token's smallest unit.
    /// @param initialOwner Creator receiving ownership and the full initial supply.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint256 initialSupply,
        address initialOwner
    ) external initializer {
        if (initialOwner == address(0)) revert InvalidOwner();

        _name = name_;
        _symbol = symbol_;
        _owner = initialOwner;

        emit OwnershipTransferred(address(0), initialOwner);
        _mint(initialOwner, initialSupply);
    }

    /// @notice Owner assigned by the launchpad during clone setup.
    function owner() external view returns (address) {
        return _owner;
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function decimals() external pure override returns (uint8) {
        return TOKEN_DECIMALS;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address owner_, address spender) external view override returns (uint256) {
        return _allowances[owner_][spender];
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < value) {
                revert InsufficientAllowance(currentAllowance, value);
            }
            unchecked {
                _approve(from, msg.sender, currentAllowance - value);
            }
        }

        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) private {
        if (from == address(0)) revert InvalidSender();
        if (to == address(0)) revert InvalidReceiver();

        uint256 fromBalance = _balances[from];
        if (fromBalance < value) revert InsufficientBalance(fromBalance, value);

        unchecked {
            _balances[from] = fromBalance - value;
        }
        _balances[to] += value;

        emit Transfer(from, to, value);
    }

    function _approve(address owner_, address spender, uint256 value) private {
        if (owner_ == address(0)) revert InvalidOwner();
        if (spender == address(0)) revert InvalidSpender();

        _allowances[owner_][spender] = value;
        emit Approval(owner_, spender, value);
    }

    function _mint(address to, uint256 value) private {
        if (to == address(0)) revert InvalidReceiver();

        _totalSupply += value;
        _balances[to] += value;

        emit Transfer(address(0), to, value);
    }
}
