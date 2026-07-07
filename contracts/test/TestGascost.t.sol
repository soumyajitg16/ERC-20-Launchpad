// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {TestLaunchpad} from "../src/TestLaunchpad.sol";

contract TestGascost is Test {
    TestLaunchpad private launchpad;
    address private creator = address(0xBEEF);

    function setUp() public {
        launchpad = new TestLaunchpad(address(this));
        vm.deal(creator, 1 ether);
    }

    function testLaunchTokenStoresMetadataAndMintsSupply() public {
        uint256 initialSupply = 1_000_000 ether;

        vm.startPrank(creator);
        address tokenAddress = launchpad.launchToken{value: launchpad.CREATION_FEE()}(
            "Launch Token",
            "LCH",
            initialSupply
        );
        vm.stopPrank();

        assertEq(launchpad.getTokenCount(), 1);

        TestLaunchpad.TokenInfo memory info = launchpad.getToken(0);
        assertEq(info.tokenAddress, tokenAddress);
        assertEq(info.name, "Launch Token");
        assertEq(info.symbol, "LCH");
        assertEq(info.initialSupply, initialSupply);
        assertEq(info.owner, creator);
        assertEq(IERC20(tokenAddress).balanceOf(creator), initialSupply);
    }

    function testLaunchTokenRevertsWithoutExactFee() public {
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(
                TestLaunchpad.InvalidCreationFee.selector,
                launchpad.CREATION_FEE(),
                0.005 ether
            )
        );
        launchpad.launchToken{value: 0.005 ether}("Launch Token", "LCH", 1 ether);
    }
}
