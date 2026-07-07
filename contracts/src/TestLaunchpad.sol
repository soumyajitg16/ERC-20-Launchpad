// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {TestToken} from "./TestToken.sol";

/// @title TestLaunchpad
/// @notice Factory contract that deploys ERC20 tokens for a fixed creation fee.
contract TestLaunchpad is Ownable, ReentrancyGuard {
    uint256 public constant CREATION_FEE = 0.01 ether;

    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 initialSupply;
        address owner;
        uint256 createdAt;
    }

    TokenInfo[] private launchedTokens;

    error EmptyName();
    error EmptySymbol();
    error InvalidSupply();
    error InvalidCreationFee(uint256 expected, uint256 received);
    error InvalidTokenIndex(uint256 index);
    error FeeWithdrawalFailed();

    event TokenLaunched(
        address indexed tokenAddress,
        address indexed owner,
        string name,
        string symbol,
        uint256 initialSupply
    );
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Deploy a new ERC20 token and store its launch metadata.
    /// @dev `initialSupply` must already be scaled to the token's decimals.
    function launchToken(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply
    ) external payable nonReentrant returns (address tokenAddress) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(symbol).length == 0) revert EmptySymbol();
        if (initialSupply == 0) revert InvalidSupply();
        if (msg.value != CREATION_FEE) revert InvalidCreationFee(CREATION_FEE, msg.value);

        TestToken token = new TestToken(name, symbol, initialSupply, msg.sender);
        tokenAddress = address(token);

        launchedTokens.push(
            TokenInfo({
                tokenAddress: tokenAddress,
                name: name,
                symbol: symbol,
                initialSupply: initialSupply,
                owner: msg.sender,
                createdAt: block.timestamp
            })
        );

        emit TokenLaunched(tokenAddress, msg.sender, name, symbol, initialSupply);
    }

    /// @notice Number of tokens launched through this factory.
    function getTokenCount() external view returns (uint256) {
        return launchedTokens.length;
    }

    /// @notice Fetch a single token launch record.
    function getToken(uint256 index) external view returns (TokenInfo memory) {
        if (index >= launchedTokens.length) revert InvalidTokenIndex(index);
        return launchedTokens[index];
    }

    /// @notice Fetch all token launch records for dashboard rendering.
    function getAllTokens() external view returns (TokenInfo[] memory) {
        return launchedTokens;
    }

    /// @notice Withdraw accumulated launch fees to the owner.
    function withdrawFees(address payable recipient) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success,) = recipient.call{value: balance}("");
        if (!success) revert FeeWithdrawalFailed();

        emit FeesWithdrawn(recipient, balance);
    }
}
