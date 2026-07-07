// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title LaunchedToken
/// @notice ERC20 token implementation deployed by TokenLaunchpad for each creator.
contract TestToken is ERC20, Ownable {
    /// @notice Mints the full initial supply to the token creator.
    /// @param name_ Human-readable token name.
    /// @param symbol_ ERC20 token symbol.
    /// @param initialSupply Supply amount in the token's smallest unit.
    /// @param initialOwner Creator that receives supply and ownership.
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
    }
}
